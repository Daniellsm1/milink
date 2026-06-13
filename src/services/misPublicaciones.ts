// Listado unificado (vehículos + propiedades) del usuario logueado, con su
// estado de moderación. Permite al dueño ver qué publicó y en qué estado va.
import { supabase } from "../lib/supabase";

export type PublicacionPropia = {
  id: string;
  tipo: "vehiculo" | "propiedad";
  titulo: string;
  precio_alquiler_diario: number;
  imagenes: string[];
  status: "pending_approval" | "approved" | "rejected";
  created_at: string;
  ciudad: string;
};

export async function getMisPublicaciones(
  userId: string
): Promise<PublicacionPropia[]> {
  const [{ data: vehiculos, error: errV }, { data: propiedades, error: errP }] =
    await Promise.all([
      supabase
        .from("vehiculos")
        .select(
          "id, marca, modelo, ano, precio_alquiler_diario, imagenes, status, created_at, ciudad_entrega_principal"
        )
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("propiedades")
        .select(
          "id, titulo, precio_alquiler_diario, imagenes, status, created_at, ciudad_municipio"
        )
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  if (errV) throw errV;
  if (errP) throw errP;

  const vehiculosMap = (vehiculos ?? []).map(
    (v): PublicacionPropia => ({
      id: v.id,
      tipo: "vehiculo",
      titulo: `${v.marca} ${v.modelo} ${v.ano}`,
      precio_alquiler_diario: v.precio_alquiler_diario,
      imagenes: v.imagenes ?? [],
      status: v.status as PublicacionPropia["status"],
      created_at: v.created_at,
      ciudad: v.ciudad_entrega_principal,
    })
  );

  const propiedadesMap = (propiedades ?? []).map(
    (p): PublicacionPropia => ({
      id: p.id,
      tipo: "propiedad",
      titulo: p.titulo,
      precio_alquiler_diario: p.precio_alquiler_diario,
      imagenes: p.imagenes ?? [],
      status: p.status as PublicacionPropia["status"],
      created_at: p.created_at,
      ciudad: p.ciudad_municipio,
    })
  );

  return [...vehiculosMap, ...propiedadesMap].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
