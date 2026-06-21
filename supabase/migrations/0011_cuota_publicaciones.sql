-- ============================================================================
-- Milink — Cuota anti-spam: máximo de publicaciones pending por usuario (§2.5)
--
-- Sin esto, un usuario podría insertar miles de publicaciones en
-- pending_approval e inundar el panel admin / consumir storage. RLS solo
-- valida ownership, no cantidad.
--
-- Regla: un usuario no puede tener más de 5 publicaciones (vehículos +
-- propiedades sumadas) en estado pending_approval al mismo tiempo. Las que ya
-- están approved o rejected no cuentan: el admin ya las revisó.
--
-- Trigger BEFORE INSERT en ambas tablas. SECURITY DEFINER porque la cuenta
-- atraviesa tablas que el usuario podría no poder leer todas via RLS (aunque
-- las suyas sí — esto es defensivo).
-- ============================================================================

create or replace function public.verificar_cuota_publicaciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_pendientes int;
  v_limite           int := 5;
begin
  -- Solo aplica a inserts de filas nuevas en pending_approval. Si por algún
  -- motivo un insert llegara con otro status, no bloqueamos (otras policies
  -- ya se encargan).
  if NEW.status is distinct from 'pending_approval'::publicacion_status then
    return NEW;
  end if;

  select
    (select count(*) from public.vehiculos
       where usuario_id = NEW.usuario_id
         and status = 'pending_approval')
    +
    (select count(*) from public.propiedades
       where usuario_id = NEW.usuario_id
         and status = 'pending_approval')
  into v_total_pendientes;

  if v_total_pendientes >= v_limite then
    raise exception
      'Tienes % publicaciones en revisión. Espera a que el equipo apruebe o rechace alguna antes de crear más.',
      v_total_pendientes
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

revoke execute on function public.verificar_cuota_publicaciones() from public;

drop trigger if exists vehiculos_cuota_pendientes on public.vehiculos;
create trigger vehiculos_cuota_pendientes
  before insert on public.vehiculos
  for each row execute function public.verificar_cuota_publicaciones();

drop trigger if exists propiedades_cuota_pendientes on public.propiedades;
create trigger propiedades_cuota_pendientes
  before insert on public.propiedades
  for each row execute function public.verificar_cuota_publicaciones();
