// Servicio del feed público: vehículos y propiedades aprobados desde Supabase.
// Soporta filtros opcionales (precio, marca, ciudad, combustible, categoría, tipo).
import { supabase } from "../lib/supabase";
import type { Disponible } from "../data/mock";
import type {
  CombustibleTipo,
  PropiedadTipo,
  VehiculoCategoria,
} from "../types/database";

// ── Filtros de vehículos ─────────────────────────────────────────────
export type FiltrosVehiculo = {
  categoria?: VehiculoCategoria;
  ciudad?: string;
  marca?: string;
  combustible?: CombustibleTipo;
  precioMin?: number;
  precioMax?: number;
};

/** Trae los últimos vehículos aprobados (con filtros opcionales). */
export async function listarVehiculosAprobados(
  filtros: FiltrosVehiculo = {},
  limit = 50
): Promise<Disponible[]> {
  let q = supabase
    .from("vehiculos")
    .select(
      "id, marca, modelo, precio_alquiler_diario, ciudad_entrega_principal, ciudad_entrega_opcional, tipo_combustible, numero_sillas, transmision, imagenes"
    )
    .eq("status", "approved");

  if (filtros.categoria) q = q.eq("categoria", filtros.categoria);
  if (filtros.combustible) q = q.eq("tipo_combustible", filtros.combustible);
  if (filtros.marca?.trim()) q = q.ilike("marca", `%${filtros.marca.trim()}%`);
  if (filtros.ciudad?.trim())
    q = q.ilike("ciudad_entrega_principal", `%${filtros.ciudad.trim()}%`);
  if (typeof filtros.precioMin === "number")
    q = q.gte("precio_alquiler_diario", filtros.precioMin);
  if (typeof filtros.precioMax === "number")
    q = q.lte("precio_alquiler_diario", filtros.precioMax);

  const { data, error } = await q
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row): Disponible => {
    const fuel: Disponible["fuel"] =
      row.tipo_combustible === "electrico"
        ? "Eléctrico"
        : row.tipo_combustible === "hibrido"
        ? "Híbrido"
        : "Gasolina";
    const trans: Disponible["trans"] =
      row.transmision === "automatico" ? "Automático" : "Manual";

    return {
      id: row.id,
      brand: row.marca,
      model: row.modelo,
      price: row.precio_alquiler_diario.toLocaleString("es-CO"),
      loc: row.ciudad_entrega_principal,
      locOpcional: row.ciudad_entrega_opcional ?? undefined,
      fuel,
      seats: String(row.numero_sillas ?? 5),
      trans,
      img: row.imagenes?.[0] ?? "",
    };
  });
}

// ── Filtros de propiedades ───────────────────────────────────────────
export type FiltrosPropiedad = {
  tipoPropiedad?: PropiedadTipo;
  ciudad?: string;
  precioMin?: number;
  precioMax?: number;
  huespedesMin?: number;
};

export type PropiedadListado = {
  id: string;
  titulo: string;
  ciudad: string;
  departamento: string;
  precio: string; // ya formateado
  capacidad: number;
  habitaciones: number;
  imagen: string;
  tipo: PropiedadTipo;
};

export async function listarPropiedadesAprobadas(
  filtros: FiltrosPropiedad = {},
  limit = 50
): Promise<PropiedadListado[]> {
  let q = supabase
    .from("propiedades")
    .select(
      "id, titulo, ciudad_municipio, departamento, precio_alquiler_diario, capacidad_huespedes, numero_habitaciones, imagenes, tipo_propiedad"
    )
    .eq("status", "approved");

  if (filtros.tipoPropiedad) q = q.eq("tipo_propiedad", filtros.tipoPropiedad);
  if (filtros.ciudad?.trim())
    q = q.ilike("ciudad_municipio", `%${filtros.ciudad.trim()}%`);
  if (typeof filtros.precioMin === "number")
    q = q.gte("precio_alquiler_diario", filtros.precioMin);
  if (typeof filtros.precioMax === "number")
    q = q.lte("precio_alquiler_diario", filtros.precioMax);
  if (typeof filtros.huespedesMin === "number")
    q = q.gte("capacidad_huespedes", filtros.huespedesMin);

  const { data, error } = await q
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map(
    (row): PropiedadListado => ({
      id: row.id,
      titulo: row.titulo,
      ciudad: row.ciudad_municipio,
      departamento: row.departamento,
      precio: row.precio_alquiler_diario.toLocaleString("es-CO"),
      capacidad: row.capacidad_huespedes,
      habitaciones: row.numero_habitaciones,
      imagen: row.imagenes?.[0] ?? "",
      tipo: row.tipo_propiedad,
    })
  );
}
