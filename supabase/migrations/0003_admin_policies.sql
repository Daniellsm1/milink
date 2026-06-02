-- ============================================================================
-- Milink — Policies de administrador
-- Permite a usuarios cuyo email esté en la lista `admin_emails` cambiar el
-- status de cualquier publicación (aprobar/rechazar).
--
-- Idempotente: usa drop policy + create. Se puede correr múltiples veces.
-- ============================================================================

-- ─── Función helper: ¿es admin? ────────────────────────────────────────
-- Devuelve true si el email del JWT del usuario actual está en la lista
-- blanca de administradores. Cambia el array para agregar/quitar admins.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (auth.jwt() ->> 'email') = any (array[
    'daniel200430@hotmail.com'
  ]::text[]);
$$;

-- ─── vehiculos: admin puede UPDATE (cambiar status) ────────────────────
drop policy if exists "vehiculos_update_admin" on public.vehiculos;
create policy "vehiculos_update_admin"
  on public.vehiculos for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Admin también puede leer cualquier publicación (incluidas pending)
-- para el panel de moderación.
drop policy if exists "vehiculos_select_admin" on public.vehiculos;
create policy "vehiculos_select_admin"
  on public.vehiculos for select
  to authenticated
  using (public.es_admin());

-- ─── propiedades: lo mismo ─────────────────────────────────────────────
drop policy if exists "propiedades_update_admin" on public.propiedades;
create policy "propiedades_update_admin"
  on public.propiedades for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "propiedades_select_admin" on public.propiedades;
create policy "propiedades_select_admin"
  on public.propiedades for select
  to authenticated
  using (public.es_admin());
