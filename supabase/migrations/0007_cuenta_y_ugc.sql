-- ============================================================================
-- Milink — Eliminación de cuenta self-service + UGC (reportes y bloqueos)
--
-- Cumple los bloqueantes 🔴 de Google Play (sección 1.1 y 1.2 del plan):
--   • eliminar_mi_cuenta() — el usuario puede borrar su cuenta in-app.
--   • reportes / bloqueos — mecanismos de moderación UGC requeridos.
--
-- Idempotente: create or replace + drop policy if exists.
-- ============================================================================

-- ─── Eliminar mi propia cuenta ─────────────────────────────────────────
-- Clona la lógica de admin_eliminar_usuario(p_user_id) pero usa auth.uid()
-- y NO requiere ser admin. Las fotos en Storage quedan huérfanas (limpieza
-- diferida — ver 2.4 del plan).
create or replace function public.eliminar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  delete from public.resenas r
   where r.usuario_id = uid
      or r.vehiculo_id  in (select v.id from public.vehiculos  v where v.usuario_id = uid)
      or r.propiedad_id in (select p.id from public.propiedades p where p.usuario_id = uid);

  delete from public.vehiculos   where usuario_id = uid;
  delete from public.propiedades where usuario_id = uid;
  delete from auth.users         where id = uid;
end;
$$;

grant execute on function public.eliminar_mi_cuenta() to authenticated;

-- ─── Tabla de reportes (UGC #2 — reportar contenido) ───────────────────
do $$ begin
  if not exists (select 1 from pg_type where typname = 'reporte_tipo') then
    create type public.reporte_tipo as enum ('vehiculo','propiedad');
  end if;
end $$;

create table if not exists public.reportes (
  id            uuid primary key default gen_random_uuid(),
  reportante_id uuid not null references auth.users(id) on delete cascade,
  tipo          public.reporte_tipo not null,
  objeto_id     uuid not null,
  motivo        text not null check (char_length(motivo) between 5 and 500),
  resuelto      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists reportes_objeto_idx     on public.reportes(tipo, objeto_id);
create index if not exists reportes_resuelto_idx   on public.reportes(resuelto, created_at desc);

alter table public.reportes enable row level security;

drop policy if exists reportes_insert_propio on public.reportes;
create policy reportes_insert_propio
  on public.reportes for insert to authenticated
  with check (auth.uid() = reportante_id);

drop policy if exists reportes_select_admin on public.reportes;
create policy reportes_select_admin
  on public.reportes for select to authenticated
  using (public.es_admin());

drop policy if exists reportes_update_admin on public.reportes;
create policy reportes_update_admin
  on public.reportes for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ─── Tabla de bloqueos (UGC #3 — bloquear usuarios) ────────────────────
create table if not exists public.bloqueos (
  bloqueador_id uuid not null references auth.users(id) on delete cascade,
  bloqueado_id  uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (bloqueador_id, bloqueado_id),
  check (bloqueador_id <> bloqueado_id)
);

create index if not exists bloqueos_bloqueador_idx on public.bloqueos(bloqueador_id);

alter table public.bloqueos enable row level security;

drop policy if exists bloqueos_select_propios on public.bloqueos;
create policy bloqueos_select_propios
  on public.bloqueos for select to authenticated
  using (auth.uid() = bloqueador_id);

drop policy if exists bloqueos_insert_propio on public.bloqueos;
create policy bloqueos_insert_propio
  on public.bloqueos for insert to authenticated
  with check (auth.uid() = bloqueador_id);

drop policy if exists bloqueos_delete_propio on public.bloqueos;
create policy bloqueos_delete_propio
  on public.bloqueos for delete to authenticated
  using (auth.uid() = bloqueador_id);

-- ─── Listar reportes con info embebida (admin) ─────────────────────────
-- Devuelve el reporte + correo del reportante + un resumen del objeto
-- reportado (título/marca-modelo). SECURITY DEFINER porque cruza auth.users
-- y necesita leer publicaciones de cualquier status.
create or replace function public.admin_listar_reportes()
returns table (
  id                uuid,
  tipo              text,
  objeto_id         uuid,
  motivo            text,
  resuelto          boolean,
  created_at        timestamptz,
  reportante_email  text,
  resumen           text,
  objeto_status     text
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
    r.id,
    r.tipo::text,
    r.objeto_id,
    r.motivo,
    r.resuelto,
    r.created_at,
    coalesce(u.email::text, '')                   as reportante_email,
    case r.tipo
      when 'vehiculo' then
        (select (v.marca || ' ' || v.modelo) from public.vehiculos v where v.id = r.objeto_id)
      when 'propiedad' then
        (select p.titulo from public.propiedades p where p.id = r.objeto_id)
    end                                            as resumen,
    case r.tipo
      when 'vehiculo' then
        (select v.status::text from public.vehiculos v where v.id = r.objeto_id)
      when 'propiedad' then
        (select p.status::text from public.propiedades p where p.id = r.objeto_id)
    end                                            as objeto_status
  from public.reportes r
  left join auth.users u on u.id = r.reportante_id
  order by r.resuelto asc, r.created_at desc;
end;
$$;

grant execute on function public.admin_listar_reportes() to authenticated;
