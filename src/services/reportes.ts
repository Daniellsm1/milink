// Servicio de reportes UGC.
// El usuario común inserta en `public.reportes` (RLS: insert propio).
// El admin lista vía RPC admin_listar_reportes() y marca resuelto vía update
// (RLS: select/update solo si es_admin()).
import { supabase } from "../lib/supabase";

export type ReporteTipo = "vehiculo" | "propiedad";

export type ReporteAdmin = {
  id: string;
  tipo: ReporteTipo;
  objeto_id: string;
  motivo: string;
  resuelto: boolean;
  created_at: string;
  reportante_email: string;
  resumen: string | null;
  objeto_status: string | null;
};

export async function reportar(args: {
  tipo: ReporteTipo;
  objetoId: string;
  motivo: string;
}): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const uid = userData.user?.id;
  if (!uid) throw new Error("Debes iniciar sesión para reportar.");

  const { error } = await supabase.from("reportes").insert({
    reportante_id: uid,
    tipo: args.tipo,
    objeto_id: args.objetoId,
    motivo: args.motivo.trim(),
  });
  if (error) throw new Error(error.message);
}

export async function listarReportes(): Promise<ReporteAdmin[]> {
  const { data, error } = await supabase.rpc("admin_listar_reportes");
  if (error) throw new Error(error.message);
  return (data ?? []) as ReporteAdmin[];
}

export async function marcarReporteResuelto(id: string): Promise<void> {
  const { error } = await supabase
    .from("reportes")
    .update({ resuelto: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
