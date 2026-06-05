-- ============================================================================
-- Milink — Nombre del propietario en cada publicación
--
-- Como auth.users no es legible desde el cliente (RLS lo bloquea),
-- denormalizamos `nombre_propietario` en vehiculos/propiedades. La función
-- auth_user_nombre() se ejecuta con SECURITY DEFINER para poder leer
-- auth.users durante el backfill, y devuelve el nombre del user_metadata
-- (o el local-part del email como fallback).
-- ============================================================================

-- ─── Columnas ─────────────────────────────────────────────────────────
alter table public.vehiculos
  add column if not exists nombre_propietario text;

alter table public.propiedades
  add column if not exists nombre_propietario text;

-- ─── Helper SECURITY DEFINER para resolver el nombre desde auth.users ─
create or replace function public.auth_user_nombre(uid uuid)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (raw_user_meta_data ->> 'nombre'),
    nullif(split_part(email, '@', 1), ''),
    'Propietario'
  )
  from auth.users
  where id = uid;
$$;

-- Permite que cualquier rol autenticado (incluido anon) pueda llamar la
-- función — solo devuelve el nombre, no datos sensibles.
grant execute on function public.auth_user_nombre(uuid) to anon, authenticated;

-- ─── Backfill para filas existentes ───────────────────────────────────
update public.vehiculos
  set nombre_propietario = public.auth_user_nombre(usuario_id)
  where nombre_propietario is null;

update public.propiedades
  set nombre_propietario = public.auth_user_nombre(usuario_id)
  where nombre_propietario is null;
