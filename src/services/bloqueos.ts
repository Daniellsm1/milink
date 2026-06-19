// Servicio de bloqueos UGC.
// Tabla public.bloqueos (RLS: el bloqueador gestiona los suyos).
// Los feeds filtran usuarios bloqueados antes de devolver resultados.
import { supabase } from "../lib/supabase";

export async function bloquearUsuario(usuarioId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const uid = userData.user?.id;
  if (!uid) throw new Error("Debes iniciar sesión para bloquear.");
  if (uid === usuarioId) throw new Error("No puedes bloquearte a ti mismo.");

  const { error } = await supabase.from("bloqueos").insert({
    bloqueador_id: uid,
    bloqueado_id: usuarioId,
  });
  // Conflicto = ya estaba bloqueado, tratamos como éxito idempotente.
  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function desbloquearUsuario(usuarioId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const uid = userData.user?.id;
  if (!uid) throw new Error("Debes iniciar sesión.");

  const { error } = await supabase
    .from("bloqueos")
    .delete()
    .eq("bloqueador_id", uid)
    .eq("bloqueado_id", usuarioId);
  if (error) throw new Error(error.message);
}

export async function listarBloqueados(): Promise<string[]> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from("bloqueos")
    .select("bloqueado_id")
    .eq("bloqueador_id", uid);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.bloqueado_id as string);
}
