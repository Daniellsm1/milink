-- ============================================================================
-- Milink — Proteger PII de contacto (telefono_contacto + nombre_propietario)
--
-- Resuelve el §2.1 del PLAN_PUBLICACION_Y_PWA.md: hasta hoy cualquier rol
-- (incluido `anon` con la sb_publishable_ que va embebida en la app/PWA) podía
-- leer telefono_contacto y nombre_propietario consultando directo el REST.
-- En Colombia eso compromete Habeas Data (Ley 1581/2012) y el formulario de
-- Data Safety de Google Play.
--
-- Estrategia:
--   1) Revocar SELECT a `anon` y re-otorgar SELECT solo sobre las columnas
--      no sensibles. `authenticated` y `service_role` mantienen SELECT pleno
--      (la RLS sigue gobernando fila a fila).
--   2) RPC `obtener_contacto_publicacion(p_tipo, p_id)` SECURITY DEFINER que
--      devuelve nombre + teléfono solo si la publicación está aprobada o si
--      el caller es el dueño. Solo `authenticated` puede ejecutarlo.
--
-- Idempotente: usa `create or replace` y `revoke/grant` (que son no-op si ya
-- están en ese estado).
-- ============================================================================

-- ─── Vehículos: revoke + grant column-level a anon ────────────────────
-- Cualquier columna NUEVA que se agregue a `vehiculos` en migraciones
-- posteriores deberá sumarse a este GRANT o quedará invisible para `anon`.
revoke select on public.vehiculos from anon;
grant select (
  id, usuario_id,
  marca, modelo, ano, color, placa_terminacion,
  kilometraje, transmision, tipo_combustible, categoria,
  numero_sillas, capacidad_baul_litros,
  fecha_vencimiento_soat, fecha_vencimiento_tecnomec,
  tiene_aire_acondicionado,
  precio_alquiler_diario, kilometraje_permitido_diario,
  deposito_garantia, permite_conductor_adicional,
  ciudad_entrega_principal, ciudad_entrega_opcional,
  descripcion, imagenes, disponible, status,
  created_at, updated_at
) on public.vehiculos to anon;

-- `authenticated` conserva SELECT pleno (incluye PII); RLS sigue filtrando.
grant select on public.vehiculos to authenticated;

-- ─── Propiedades: revoke + grant column-level a anon ──────────────────
revoke select on public.propiedades from anon;
grant select (
  id, usuario_id,
  tipo_propiedad, titulo, descripcion,
  precio_alquiler_diario,
  departamento, ciudad_municipio,
  capacidad_huespedes, numero_habitaciones, numero_camas, numero_banos,
  tiene_piscina, tiene_wifi, tiene_parqueadero,
  tiene_aire_acondicionado, es_pet_friendly, tiene_zona_bbq,
  imagenes, disponible, status,
  created_at, updated_at
) on public.propiedades to anon;

grant select on public.propiedades to authenticated;

-- ─── RPC: obtener contacto de una publicación (solo authenticated) ────
-- Devuelve nombre + teléfono si la publicación está aprobada o si el caller
-- es el dueño. Si no hay sesión, levanta excepción.
create or replace function public.obtener_contacto_publicacion(
  p_tipo text,
  p_id   uuid
)
returns table (
  nombre_propietario text,
  telefono_contacto  text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if p_tipo = 'vehiculo' then
    return query
      select v.nombre_propietario, v.telefono_contacto
      from public.vehiculos v
      where v.id = p_id
        and (v.status = 'approved' or v.usuario_id = auth.uid());
  elsif p_tipo = 'propiedad' then
    return query
      select p.nombre_propietario, p.telefono_contacto
      from public.propiedades p
      where p.id = p_id
        and (p.status = 'approved' or p.usuario_id = auth.uid());
  else
    raise exception 'Tipo inválido: %', p_tipo;
  end if;
end;
$$;

revoke execute on function public.obtener_contacto_publicacion(text, uuid) from public;
revoke execute on function public.obtener_contacto_publicacion(text, uuid) from anon;
grant execute on function public.obtener_contacto_publicacion(text, uuid) to authenticated;
