-- ============================================================================
-- Milink — RPC de moderación + motivo de rechazo (§2.3 del plan)
--
-- Antes: las policies `vehiculos_update_admin` / `propiedades_update_admin`
-- permitían al admin modificar CUALQUIER columna de cualquier publicación.
-- Ahora: aprobar/rechazar pasan por un único RPC `moderar_publicacion(...)`
-- `SECURITY DEFINER` que solo toca `status` y opcionalmente persiste el motivo
-- del rechazo. Las policies amplias de UPDATE se eliminan.
--
-- Idempotente: `create or replace`, `add column if not exists`,
-- `drop policy if exists`.
-- ============================================================================

-- ─── Columna motivo_rechazo en ambas tablas ───────────────────────────
-- Nota: NO se añade al grant column-level de anon (migración 0008). En
-- Postgres las columnas nuevas no heredan grants previos, así que anon
-- ya no la puede leer. `authenticated` tiene SELECT pleno y la verá via
-- RLS (dueño) o policy admin (es_admin()).
alter table public.vehiculos   add column if not exists motivo_rechazo text;
alter table public.propiedades add column if not exists motivo_rechazo text;

-- ─── RPC moderar_publicacion ──────────────────────────────────────────
create or replace function public.moderar_publicacion(
  p_tipo          text,
  p_id            uuid,
  p_nuevo_status  text,
  p_motivo        text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  if p_nuevo_status not in ('approved','rejected') then
    raise exception 'Status inválido: %', p_nuevo_status;
  end if;

  -- Motivo solo se guarda en rechazos; aprobar limpia el motivo previo.
  if p_tipo = 'vehiculo' then
    update public.vehiculos
       set status = p_nuevo_status::publicacion_status,
           motivo_rechazo = case
             when p_nuevo_status = 'rejected' then p_motivo
             else null
           end
     where id = p_id;
  elsif p_tipo = 'propiedad' then
    update public.propiedades
       set status = p_nuevo_status::publicacion_status,
           motivo_rechazo = case
             when p_nuevo_status = 'rejected' then p_motivo
             else null
           end
     where id = p_id;
  else
    raise exception 'Tipo inválido: %', p_tipo;
  end if;
end;
$$;

revoke execute on function public.moderar_publicacion(text, uuid, text, text) from public;
revoke execute on function public.moderar_publicacion(text, uuid, text, text) from anon;
grant  execute on function public.moderar_publicacion(text, uuid, text, text) to authenticated;

-- ─── Drop policies amplias de UPDATE del admin ────────────────────────
-- Las SELECT (vehiculos_select_admin / propiedades_select_admin) se MANTIENEN:
-- las necesita listarPendientes() y el detalle de moderación.
drop policy if exists "vehiculos_update_admin"   on public.vehiculos;
drop policy if exists "propiedades_update_admin" on public.propiedades;
