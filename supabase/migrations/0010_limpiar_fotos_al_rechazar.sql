-- ============================================================================
-- Milink — Limpieza de fotos al rechazar publicaciones (§2.4 del plan)
--
-- Dos cambios:
-- 1. Nueva policy DELETE en storage.objects para que el admin pueda borrar
--    archivos de cualquier usuario en el bucket 'publicaciones'.
-- 2. El RPC `moderar_publicacion` también vacía `imagenes = '{}'` al
--    rechazar, de modo que la DB no quede con referencias a archivos
--    que el cliente borrará vía Storage API.
-- ============================================================================

-- ─── 1. Policy DELETE en storage para admins ─────────────────────────────
drop policy if exists "publicaciones_delete_admin" on storage.objects;
create policy "publicaciones_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'publicaciones'
    and public.es_admin()
  );

-- ─── 2. Modificar moderar_publicacion para limpiar imagenes ──────────────
-- Reemplaza la versión de 0009 añadiendo el case de imagenes en rechazos.
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

  if p_tipo = 'vehiculo' then
    update public.vehiculos
       set status         = p_nuevo_status::publicacion_status,
           motivo_rechazo = case
             when p_nuevo_status = 'rejected' then p_motivo
             else null
           end,
           imagenes       = case
             when p_nuevo_status = 'rejected' then '{}'::text[]
             else imagenes
           end
     where id = p_id;
  elsif p_tipo = 'propiedad' then
    update public.propiedades
       set status         = p_nuevo_status::publicacion_status,
           motivo_rechazo = case
             when p_nuevo_status = 'rejected' then p_motivo
             else null
           end,
           imagenes       = case
             when p_nuevo_status = 'rejected' then '{}'::text[]
             else imagenes
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
