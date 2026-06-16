// Servicio del feed público: vehículos y propiedades aprobados desde Supabase.
// Soporta filtros opcionales (precio, marca, ciudad, combustible, categoría, tipo).
import { supabase } from "../lib/supabase";
import type { Disponible, NuevaEntrada } from "../data/mock";
import type {
  CombustibleTipo,
  PropiedadRow,
  PropiedadTipo,
  VehiculoCategoria,
  VehiculoRow,
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

type VehiculoRowSeleccionado = Pick<
  VehiculoRow,
  | "id"
  | "marca"
  | "modelo"
  | "precio_alquiler_diario"
  | "ciudad_entrega_principal"
  | "ciudad_entrega_opcional"
  | "tipo_combustible"
  | "numero_sillas"
  | "transmision"
  | "imagenes"
>;

function mapVehiculoRow(row: VehiculoRowSeleccionado): Disponible {
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
}

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

  return (data ?? []).map(mapVehiculoRow);
}

/** Trae vehículos aprobados por una lista de IDs (para la pantalla Favoritos). */
export async function listarVehiculosPorIds(
  ids: string[]
): Promise<Disponible[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("vehiculos")
    .select(
      "id, marca, modelo, precio_alquiler_diario, ciudad_entrega_principal, ciudad_entrega_opcional, tipo_combustible, numero_sillas, transmision, imagenes"
    )
    .eq("status", "approved")
    .in("id", ids);
  if (error) throw new Error(error.message);

  return (data ?? []).map(mapVehiculoRow);
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

type PropiedadRowSeleccionado = Pick<
  PropiedadRow,
  | "id"
  | "titulo"
  | "ciudad_municipio"
  | "departamento"
  | "precio_alquiler_diario"
  | "capacidad_huespedes"
  | "numero_habitaciones"
  | "imagenes"
  | "tipo_propiedad"
>;

function mapPropiedadRow(row: PropiedadRowSeleccionado): PropiedadListado {
  return {
    id: row.id,
    titulo: row.titulo,
    ciudad: row.ciudad_municipio,
    departamento: row.departamento,
    precio: row.precio_alquiler_diario.toLocaleString("es-CO"),
    capacidad: row.capacidad_huespedes,
    habitaciones: row.numero_habitaciones,
    imagen: row.imagenes?.[0] ?? "",
    tipo: row.tipo_propiedad,
  };
}

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

  return (data ?? []).map(mapPropiedadRow);
}

/** Trae propiedades aprobadas por una lista de IDs (para la pantalla Favoritos). */
export async function listarPropiedadesPorIds(
  ids: string[]
): Promise<PropiedadListado[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("propiedades")
    .select(
      "id, titulo, ciudad_municipio, departamento, precio_alquiler_diario, capacidad_huespedes, numero_habitaciones, imagenes, tipo_propiedad"
    )
    .eq("status", "approved")
    .in("id", ids);
  if (error) throw new Error(error.message);

  return (data ?? []).map(mapPropiedadRow);
}

// ── Mixto: vehículos + propiedades aprobados ─────────────────────────
export type DisponibleMixto =
  | { kind: "vehiculo"; data: Disponible }
  | { kind: "propiedad"; data: PropiedadListado };

/** Listado completo para "Disponibles para ti": veh + prop aprobados,
 *  intercalados por fecha de creación más reciente. */
export async function listarMixtoAprobado(
  limit = 40
): Promise<DisponibleMixto[]> {
  const [vehs, props] = await Promise.all([
    listarVehiculosAprobados({}, limit),
    listarPropiedadesAprobadas({}, limit),
  ]);

  // Mapeamos sin perder created_at; como no lo expusimos, los servicios ya
  // ordenan por created_at desc cada uno. Para mezclar, hacemos zip simple
  // alternando los más recientes de cada lista en orden de inserción.
  // (Más adelante podemos cambiarlo a un ORDER global si hace falta.)
  const mezclados: DisponibleMixto[] = [];
  const max = Math.max(vehs.length, props.length);
  for (let i = 0; i < max; i++) {
    if (vehs[i]) mezclados.push({ kind: "vehiculo", data: vehs[i] });
    if (props[i]) mezclados.push({ kind: "propiedad", data: props[i] });
  }
  return mezclados.slice(0, limit);
}

// ── Búsqueda: nombre/título, marca y ciudad sobre veh + prop ─────────
const SELECT_VEHICULO_BUSQUEDA =
  "id, marca, modelo, precio_alquiler_diario, ciudad_entrega_principal, ciudad_entrega_opcional, tipo_combustible, numero_sillas, transmision, imagenes";
const SELECT_PROPIEDAD_BUSQUEDA =
  "id, titulo, ciudad_municipio, departamento, precio_alquiler_diario, capacidad_huespedes, numero_habitaciones, imagenes, tipo_propiedad";

/** Busca por nombre/título, marca (vehículos) o ciudad sobre el feed mixto aprobado. */
export async function buscarMixto(
  query: string,
  limit = 40
): Promise<DisponibleMixto[]> {
  const q = query.trim().replace(/[,()%]/g, "");
  if (!q) return [];

  const [vRes, pRes] = await Promise.all([
    supabase
      .from("vehiculos")
      .select(SELECT_VEHICULO_BUSQUEDA)
      .eq("status", "approved")
      .or(
        `marca.ilike.%${q}%,modelo.ilike.%${q}%,ciudad_entrega_principal.ilike.%${q}%`
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("propiedades")
      .select(SELECT_PROPIEDAD_BUSQUEDA)
      .eq("status", "approved")
      .or(`titulo.ilike.%${q}%,ciudad_municipio.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (vRes.error) throw new Error(vRes.error.message);
  if (pRes.error) throw new Error(pRes.error.message);

  const vehs = (vRes.data ?? []).map(mapVehiculoRow);
  const props = (pRes.data ?? []).map(mapPropiedadRow);

  const mezclados: DisponibleMixto[] = [];
  const max = Math.max(vehs.length, props.length);
  for (let i = 0; i < max; i++) {
    if (vehs[i]) mezclados.push({ kind: "vehiculo", data: vehs[i] });
    if (props[i]) mezclados.push({ kind: "propiedad", data: props[i] });
  }
  return mezclados.slice(0, limit);
}

// ── Carrusel "Nuevas entradas": últimas N publicaciones aprobadas ────
/** Trae las N publicaciones aprobadas más recientes (veh + prop),
 *  mapeadas al tipo `NuevaEntrada` que consume el carrusel. */
export async function listarNuevasEntradas(limit = 5): Promise<NuevaEntrada[]> {
  // Pedimos un poco más de cada lado y luego mezclamos para acertar mejor el "más reciente".
  const fetchN = Math.max(limit, 5);
  const [vRes, pRes] = await Promise.all([
    supabase
      .from("vehiculos")
      .select(
        "id, marca, modelo, ciudad_entrega_principal, precio_alquiler_diario, imagenes, categoria, tipo_combustible, created_at"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(fetchN),
    supabase
      .from("propiedades")
      .select(
        "id, titulo, ciudad_municipio, precio_alquiler_diario, imagenes, tipo_propiedad, created_at"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(fetchN),
  ]);

  if (vRes.error) throw new Error(vRes.error.message);
  if (pRes.error) throw new Error(pRes.error.message);

  const vehs: (NuevaEntrada & { _ts: string })[] = (vRes.data ?? []).map(
    (row) => {
      // Tag: combustible si es eléctrico/híbrido, si no la categoría.
      const tag =
        row.tipo_combustible === "electrico"
          ? "ELÉCTRICO"
          : row.tipo_combustible === "hibrido"
          ? "HÍBRIDO"
          : row.categoria === "camioneta"
          ? "CAMIONETA"
          : row.categoria === "motocicleta"
          ? "MOTO"
          : "VEHÍCULO";
      return {
        id: row.id,
        name: `${row.marca} ${row.modelo}`,
        loc: row.ciudad_entrega_principal,
        price: row.precio_alquiler_diario.toLocaleString("es-CO"),
        img: row.imagenes?.[0] ?? "",
        tag,
        _ts: row.created_at,
      };
    }
  );

  const props: (NuevaEntrada & { _ts: string })[] = (pRes.data ?? []).map(
    (row) => ({
      id: row.id,
      name: row.titulo,
      loc: row.ciudad_municipio,
      price: row.precio_alquiler_diario.toLocaleString("es-CO"),
      img: row.imagenes?.[0] ?? "",
      tag: row.tipo_propiedad.toUpperCase(),
      _ts: row.created_at,
    })
  );

  // Mezcla global por timestamp (más reciente primero) y corta a `limit`.
  return [...vehs, ...props]
    .sort((a, b) => b._ts.localeCompare(a._ts))
    .slice(0, limit)
    .map(({ _ts: _, ...rest }) => rest);
}
