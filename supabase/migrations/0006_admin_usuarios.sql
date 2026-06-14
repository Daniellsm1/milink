-- ============================================================================
-- Milink — Administración de usuarios registrados
-- Permite al admin (public.es_admin()) listar TODOS los usuarios de auth.users
-- y eliminarlos en cascada (usuario + vehiculos + propiedades + resenas).
-- auth.users no es legible desde el cliente con RLS normal → todo va por RPC
-- SECURITY DEFINER gateada por public.es_admin().
--
-- Idempotente: create or replace + drop policy if exists.
-- ============================================================================

-- ─── Listar usuarios registrados ───────────────────────────────────────
-- Retorna cada usuario con su nombre, teléfono (en cascada de fallback),
-- fecha de registro y un jsonb con el resumen de sus publicaciones.
create or replace function public.admin_listar_usuarios()
returns table (
  id                  uuid,
  email               text,
  nombre              text,
  telefono            text,
  created_at          timestamptz,
  publicaciones       jsonb,
  total_publicaciones int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(u.raw_user_meta_data ->> 'nombre', '') as nombre,
    coalesce(
      nullif(u.raw_user_meta_data ->> 'telefono', ''),
      (select v.telefono_contacto
         from public.vehiculos v
        where v.usuario_id = u.id and v.telefono_contacto is not null
        order by v.created_at asc
        limit 1),
      (select p.telefono_contacto
         from public.propiedades p
        where p.usuario_id = u.id and p.telefono_contacto is not null
        order by p.created_at asc
        limit 1),
      ''
    ) as telefono,
    u.created_at,
    coalesce(pubs.items, '[]'::jsonb)  as publicaciones,
    coalesce(pubs.total, 0)::int       as total_publicaciones
  from auth.users u
  left join lateral (
    select
      jsonb_agg(x order by x.created_at desc) as items,
      count(*)                                as total
    from (
      select
        v.id,
        'vehiculo'::text          as tipo,
        v.categoria::text         as categoria,
        (v.marca || ' ' || v.modelo) as resumen,
        v.created_at,
        v.status::text            as status
      from public.vehiculos v
      where v.usuario_id = u.id
      union all
      select
        p.id,
        'propiedad'::text         as tipo,
        p.tipo_propiedad::text    as categoria,
        p.titulo                  as resumen,
        p.created_at,
        p.status::text            as status
      from public.propiedades p
      where p.usuario_id = u.id
    ) x
  ) pubs on true
  order by u.created_at desc;
end;
$$;

grant execute on function public.admin_listar_usuarios() to authenticated;

-- ─── Eliminar usuario en cascada ───────────────────────────────────────
-- El admin no puede eliminarse a sí mismo. Las FK ya tienen ON DELETE CASCADE,
-- pero borramos explícitamente por claridad y para no depender de ellas.
create or replace function public.admin_eliminar_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'No puedes eliminarte a ti mismo';
  end if;

  delete from public.resenas r
   where r.usuario_id = p_user_id
      or r.vehiculo_id in (select v.id from public.vehiculos v where v.usuario_id = p_user_id)
      or r.propiedad_id in (select p.id from public.propiedades p where p.usuario_id = p_user_id);

  delete from public.vehiculos   where usuario_id = p_user_id;
  delete from public.propiedades where usuario_id = p_user_id;
  delete from auth.users         where id = p_user_id;
end;
$$;

grant execute on function public.admin_eliminar_usuario(uuid) to authenticated;

-- ─── Storage: admin puede borrar fotos de cualquier usuario ────────────
drop policy if exists "admin_delete_publicaciones" on storage.objects;
create policy "admin_delete_publicaciones"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'publicaciones' and public.es_admin());
