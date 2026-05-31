-- ============================================================================
-- Milink — Estado de publicación (moderación) + Storage de imágenes
-- Idempotente: se puede correr aunque 0001 ya esté aplicado.
--
-- Las publicaciones nuevas entran con status 'pending_approval' y NO son
-- visibles en el feed público hasta que un admin las marque 'approved'.
-- El dueño siempre ve sus propias publicaciones (en cualquier estado).
-- ============================================================================

-- ─── Enum de estado ────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'publicacion_status') then
    create type publicacion_status as enum ('pending_approval', 'approved', 'rejected');
  end if;
end$$;

-- ─── Columna status en vehiculos y propiedades ─────────────────────────
alter table public.vehiculos
  add column if not exists status publicacion_status not null default 'pending_approval';

alter table public.propiedades
  add column if not exists status publicacion_status not null default 'pending_approval';

create index if not exists vehiculos_status_idx   on public.vehiculos(status);
create index if not exists propiedades_status_idx on public.propiedades(status);

-- ─── Políticas SELECT con moderación ───────────────────────────────────
-- Público ve solo 'approved'; el dueño ve todo lo suyo.
drop policy if exists "vehiculos_select_publico" on public.vehiculos;
create policy "vehiculos_select_aprobado_o_propio"
  on public.vehiculos for select
  using (status = 'approved' or auth.uid() = usuario_id);

drop policy if exists "propiedades_select_publico" on public.propiedades;
create policy "propiedades_select_aprobado_o_propio"
  on public.propiedades for select
  using (status = 'approved' or auth.uid() = usuario_id);

-- Evitar que un usuario "se autoapruebe": al insertar/actualizar su propio
-- registro el status debe quedar en pending_approval (la aprobación la hace
-- un admin vía service_role, que ignora RLS).
drop policy if exists "vehiculos_insert_propio" on public.vehiculos;
create policy "vehiculos_insert_propio"
  on public.vehiculos for insert
  to authenticated
  with check (auth.uid() = usuario_id and status = 'pending_approval');

drop policy if exists "vehiculos_update_propio" on public.vehiculos;
create policy "vehiculos_update_propio"
  on public.vehiculos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id and status = 'pending_approval');

drop policy if exists "propiedades_insert_propio" on public.propiedades;
create policy "propiedades_insert_propio"
  on public.propiedades for insert
  to authenticated
  with check (auth.uid() = usuario_id and status = 'pending_approval');

drop policy if exists "propiedades_update_propio" on public.propiedades;
create policy "propiedades_update_propio"
  on public.propiedades for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id and status = 'pending_approval');

-- ============================================================================
-- STORAGE: bucket público de imágenes de publicaciones
-- Estructura de rutas: {user_id}/{archivo}  -> el usuario solo escribe en su carpeta
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('publicaciones', 'publicaciones', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes
drop policy if exists "publicaciones_read_publico" on storage.objects;
create policy "publicaciones_read_publico"
  on storage.objects for select
  using (bucket_id = 'publicaciones');

-- Subir: solo autenticados y dentro de su propia carpeta ({uid}/...)
drop policy if exists "publicaciones_insert_propio" on storage.objects;
create policy "publicaciones_insert_propio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'publicaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Actualizar/eliminar solo lo propio
drop policy if exists "publicaciones_update_propio" on storage.objects;
create policy "publicaciones_update_propio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'publicaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "publicaciones_delete_propio" on storage.objects;
create policy "publicaciones_delete_propio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'publicaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
