// Modelo del ítem de detalle (vehículo o propiedad) y builder desde datos mock.
// Diseñado para que luego se reemplace por una consulta a Supabase devolviendo
// la misma forma `DetailItem`.
import { DISPONIBLES, NUEVAS } from "./mock";

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
