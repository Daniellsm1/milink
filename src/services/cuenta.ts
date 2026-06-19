// Servicio para que el usuario elimine su propia cuenta.
// La autoridad real vive en el RPC eliminar_mi_cuenta() (0007_cuenta_y_ugc.sql),
// que usa auth.uid() y SECURITY DEFINER para borrar en cascada.
import { supabase } from "../lib/supabase";

export async function eliminarMiCuenta(): Promise<void> {
  const { error } = await supabase.rpc("eliminar_mi_cuenta");
  if (error) throw new Error(error.message);
}
