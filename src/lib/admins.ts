// Lista blanca de administradores. Debe coincidir con la lista en la función
// `public.es_admin()` de Supabase (supabase/migrations/0003_admin_policies.sql)
// para que las policies del backend y el gate del frontend digan lo mismo.
import type { User } from "@supabase/supabase-js";

export const ADMIN_EMAILS = ["daniel200430@hotmail.com"] as const;

export function esAdmin(user: Pick<User, "email"> | null | undefined): boolean {
  if (!user?.email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(user.email);
}
