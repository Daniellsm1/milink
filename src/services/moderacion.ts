// Servicio de moderación: lista publicaciones pendientes (vehículos + propiedades)
// y permite aprobarlas/rechazarlas. Las policies de Supabase
// (supabase/migrations/0003_admin_policies.sql) bloquean estas operaciones
// para no-admins, así que la seguridad real está en la DB. El gate del frontend
// es solo UX.
import { supabase } from "../lib/supabase";

export type PendienteTipo = "vehiculo" | "propiedad";
export type PublicacionStatus = "pending_approval" | "approved" | "rejected";

export type PendienteItem = {
  tipo: PendienteTipo;
  id: string;
  usuario_id: string;
  titulo: string;
  ciudad: string;
  precio: number;
  imagenes: string[];
  status: PublicacionStatus;
  created_at: string;
};

/** Devuelve todos los pending_approval (vehículos + propiedades), más recientes primero. */
export async function listarPendientes(): Promise<PendienteItem[]> {
  const [v, p] = await Promise.all([
    supabase
      .from("vehiculos")
      .select(
        "id, usuario_id, marca, modelo, ciudad_entrega_principal, precio_alquiler_diario, imagenes, status, created_at"
      )
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false }),
    supabase
      .from("propiedades")
      .select(
        "id, usuario_id, titulo, ciudad_municipio, precio_alquiler_diario, imagenes, status, created_at"
      )
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false }),
  ]);

  if (v.error) throw new Error(`Error vehiculos: ${v.error.message}`);
  if (p.error) throw new Error(`Error propiedades: ${p.error.message}`);

  const vehiculos: PendienteItem[] = (v.data ?? []).map((row) => ({
    tipo: "vehiculo",
    id: row.id,
    usuario_id: row.usuario_id,
    titulo: `${row.marca} ${row.modelo}`,
    ciudad: row.ciudad_entrega_principal,
    precio: row.precio_alquiler_diario,
    imagenes: row.imagenes,
    status: row.status,
    created_at: row.created_at,
  }));

  const propiedades: PendienteItem[] = (p.data ?? []).map((row) => ({
    tipo: "propiedad",
    id: row.id,
    usuario_id: row.usuario_id,
    titulo: row.titulo,
    ciudad: row.ciudad_municipio,
    precio: row.precio_alquiler_diario,
    imagenes: row.imagenes,
    status: row.status,
    created_at: row.created_at,
  }));

  return [...vehiculos, ...propiedades].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

async function cambiarStatus(
  tipo: PendienteTipo,
  id: string,
  status: PublicacionStatus
): Promise<void> {
  const tabla = tipo === "vehiculo" ? "vehiculos" : "propiedades";
  const { error } = await supabase
    .from(tabla)
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export const aprobar = (tipo: PendienteTipo, id: string) =>
  cambiarStatus(tipo, id, "approved");

export const rechazar = (tipo: PendienteTipo, id: string) =>
  cambiarStatus(tipo, id, "rejected");
