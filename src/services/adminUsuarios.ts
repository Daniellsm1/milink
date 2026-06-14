// Administración de usuarios (solo admin). La lectura de auth.users y el borrado
// en cascada van por RPCs SECURITY DEFINER (supabase/migrations/0006_admin_usuarios.sql).
// El gate real está en la DB (public.es_admin()); el gate del frontend es solo UX.
import { supabase } from "../lib/supabase";
import type { UsuarioRegistrado } from "../types/database";

const BUCKET = "publicaciones";

/** Todos los usuarios registrados, más recientes primero. */
export async function listarUsuariosRegistrados(): Promise<UsuarioRegistrado[]> {
  const { data, error } = await supabase.rpc("admin_listar_usuarios");
  if (error) throw new Error(error.message);
  return (data ?? []) as UsuarioRegistrado[];
}

/**
 * Elimina un usuario y todo lo suyo: primero las fotos de Storage (con la policy
 * admin), luego el RPC que borra publicaciones, reseñas y la fila de auth.users.
 */
export async function eliminarUsuario(userId: string): Promise<void> {
  // 1) Borrar fotos de Storage. El árbol es {userId}/vehiculos/* y {userId}/propiedades/*.
  const paths: string[] = [];
  for (const sub of ["vehiculos", "propiedades"] as const) {
    const { data: archivos, error } = await supabase.storage
      .from(BUCKET)
      .list(`${userId}/${sub}`, { limit: 1000 });
    if (error) {
      // Las fotos huérfanas no deben bloquear el borrado del usuario.
      console.warn(`No se pudieron listar fotos de ${sub}:`, error.message);
      continue;
    }
    for (const f of archivos ?? []) {
      paths.push(`${userId}/${sub}/${f.name}`);
    }
  }

  if (paths.length > 0) {
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) {
      console.warn("No se pudieron borrar algunas fotos:", error.message);
    }
  }

  // 2) Borrado en cascada en la DB.
  const { error } = await supabase.rpc("admin_eliminar_usuario", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}
