// Modelo del ítem de detalle (vehículo o propiedad) y builder desde datos mock.
// Diseñado para que luego se reemplace por una consulta a Supabase devolviendo
// la misma forma `DetailItem`.
import { DISPONIBLES, NUEVAS } from "./mock";
import { supabase } from "../lib/supabase";

export type CaracteristicaIcono =
  | "combustible"
  | "transmision"
  | "asientos"
  | "ano"
  | "kilometraje"
  | "ubicacion";

export type Caracteristica = {
  icono: CaracteristicaIcono;
  etiqueta: string;
};

export type Propietario = {
  nombre: string;
  calificacion: number;
  resenas: number;
  telefono: string; // formato internacional sin signos: 57XXXXXXXXXX
};

export type DetailItem = {
  id: string;
  titulo: string;
  ubicacion: string;
  precioDia: string; // formateado, ej. "1.200.000"
  imagenes: string[];
  caracteristicas: Caracteristica[];
  descripcion: string;
  propietario: Propietario;
};

// Propietario demo (hasta enlazar perfiles reales de Supabase).
const PROPIETARIO_DEMO: Propietario = {
  nombre: "Juan Pérez",
  calificacion: 4.9,
  resenas: 150,
  telefono: "573001234567",
};

// Imágenes adicionales para enriquecer el carrusel en el demo.
const EXTRA_VEHICULO = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&q=80&auto=format&fit=crop",
];

function descripcionVehiculo(brand: string, model: string): string {
  return `Experimenta el confort y rendimiento del ${brand} ${model}. Vehículo en excelente estado, mantenimiento al día y listo para tu viaje. Ideal para escapadas de fin de semana o desplazamientos durante tus permisos.`;
}

export function getDetalleById(id: string): DetailItem | null {
  // 1) Vehículos (catálogo "Disponibles")
  const v = DISPONIBLES.find((x) => x.id === id);
  if (v) {
    return {
      id: v.id,
      titulo: `${v.brand} ${v.model}`,
      ubicacion: `${v.loc}, CO`,
      precioDia: v.price,
      imagenes: [v.img, ...EXTRA_VEHICULO],
      caracteristicas: [
        { icono: "combustible", etiqueta: v.fuel },
        { icono: "transmision", etiqueta: v.trans },
        { icono: "asientos", etiqueta: `${v.seats} asientos` },
        { icono: "ano", etiqueta: "2023" },
        { icono: "kilometraje", etiqueta: "Ilimitado" },
      ],
      descripcion: descripcionVehiculo(v.brand, v.model),
      propietario: PROPIETARIO_DEMO,
    };
  }

  // 2) Nuevas entradas (vehículos o propiedades destacadas)
  const n = NUEVAS.find((x) => x.id === id);
  if (n) {
    const esPropiedad = n.tag === "PROPIEDAD";
    return {
      id: n.id,
      titulo: n.name,
      ubicacion: `${n.loc}, CO`,
      precioDia: n.price,
      imagenes: [n.img],
      caracteristicas: esPropiedad
        ? [
            { icono: "ubicacion", etiqueta: n.loc },
            { icono: "asientos", etiqueta: "Capacidad amplia" },
          ]
        : [
            { icono: "combustible", etiqueta: "Gasolina" },
            { icono: "transmision", etiqueta: "Automático" },
            { icono: "asientos", etiqueta: "5 asientos" },
            { icono: "ano", etiqueta: "2023" },
          ],
      descripcion: esPropiedad
        ? `${n.name} en ${n.loc}. Espacio ideal para descansar durante tus vacaciones o permisos, con excelentes comodidades.`
        : `${n.name}. Vehículo destacado, en óptimas condiciones y listo para alquilar.`,
      propietario: PROPIETARIO_DEMO,
    };
  }

  return null;
}

/**
 * Versión asíncrona: primero busca en mocks; si no encuentra, consulta Supabase
 * (tabla `vehiculos`) buscando una publicación aprobada con ese id. Devuelve
 * null si no existe en ninguna de las dos fuentes.
 */
export async function fetchDetalleById(id: string): Promise<DetailItem | null> {
  const enMock = getDetalleById(id);
  if (enMock) return enMock;

  const { data, error } = await supabase
    .from("vehiculos")
    .select(
      "id, marca, modelo, ano, ciudad_entrega_principal, ciudad_entrega_opcional, precio_alquiler_diario, tipo_combustible, transmision, numero_sillas, kilometraje_permitido_diario, descripcion, imagenes, telefono_contacto, nombre_propietario"
    )
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  // Si no es vehículo, intentamos como propiedad
  if (!data) {
    const prop = await fetchPropiedad(id);
    return prop;
  }

  if (error) return null;

  const fuel =
    data.tipo_combustible === "electrico"
      ? "Eléctrico"
      : data.tipo_combustible === "hibrido"
      ? "Híbrido"
      : data.tipo_combustible === "diesel"
      ? "Diésel"
      : "Gasolina";
  const trans = data.transmision === "automatico" ? "Automático" : "Manual";

  const ubicacion = data.ciudad_entrega_opcional
    ? `${data.ciudad_entrega_principal} · ${data.ciudad_entrega_opcional}, CO`
    : `${data.ciudad_entrega_principal}, CO`;

  return {
    id: data.id,
    titulo: `${data.marca} ${data.modelo}`,
    ubicacion,
    precioDia: data.precio_alquiler_diario.toLocaleString("es-CO"),
    imagenes: data.imagenes ?? [],
    caracteristicas: [
      { icono: "combustible", etiqueta: fuel },
      { icono: "transmision", etiqueta: trans },
      {
        icono: "asientos",
        etiqueta: `${data.numero_sillas ?? 5} asientos`,
      },
      { icono: "ano", etiqueta: String(data.ano) },
      {
        icono: "kilometraje",
        etiqueta:
          data.kilometraje_permitido_diario == null
            ? "Ilimitado"
            : `${data.kilometraje_permitido_diario} km/día`,
      },
    ],
    descripcion:
      data.descripcion ?? descripcionVehiculo(data.marca, data.modelo),
    propietario: {
      ...PROPIETARIO_DEMO,
      nombre: data.nombre_propietario ?? PROPIETARIO_DEMO.nombre,
      telefono: data.telefono_contacto ?? PROPIETARIO_DEMO.telefono,
    },
  };
}

/** Lookup en `propiedades` (cuando el id no es un vehículo). */
async function fetchPropiedad(id: string): Promise<DetailItem | null> {
  const { data, error } = await supabase
    .from("propiedades")
    .select(
      "id, tipo_propiedad, titulo, descripcion, ciudad_municipio, departamento, precio_alquiler_diario, capacidad_huespedes, numero_habitaciones, numero_camas, numero_banos, imagenes, telefono_contacto, nombre_propietario"
    )
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    titulo: data.titulo,
    ubicacion: `${data.ciudad_municipio}, ${data.departamento}`,
    precioDia: data.precio_alquiler_diario.toLocaleString("es-CO"),
    imagenes: data.imagenes ?? [],
    caracteristicas: [
      { icono: "ubicacion", etiqueta: data.ciudad_municipio },
      { icono: "asientos", etiqueta: `${data.capacidad_huespedes} huéspedes` },
      { icono: "ano", etiqueta: `${data.numero_habitaciones} hab.` },
      { icono: "kilometraje", etiqueta: `${data.numero_camas} camas` },
      { icono: "combustible", etiqueta: `${data.numero_banos} baños` },
    ],
    descripcion:
      data.descripcion ??
      `${data.titulo} en ${data.ciudad_municipio}, ${data.departamento}. Espacio ideal para tu estadía.`,
    propietario: {
      ...PROPIETARIO_DEMO,
      nombre: data.nombre_propietario ?? PROPIETARIO_DEMO.nombre,
      telefono: data.telefono_contacto ?? PROPIETARIO_DEMO.telefono,
    },
  };
}
