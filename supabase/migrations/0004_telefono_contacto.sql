-- ============================================================================
-- Milink — Teléfono de contacto por publicación (para el enlace de WhatsApp)
-- Idempotente. Columna nullable a nivel DB (no rompe filas existentes);
-- la obligatoriedad se valida en la app (Zod). Se guarda unido sin signos,
-- ej. '573001234567'.
-- ============================================================================

alter table public.vehiculos
  add column if not exists telefono_contacto text;

alter table public.propiedades
  add column if not exists telefono_contacto text;

-- Solo dígitos (8 a 15) cuando no es null.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vehiculos_telefono_formato'
  ) then
    alter table public.vehiculos
      add constraint vehiculos_telefono_formato
      check (telefono_contacto is null or telefono_contacto ~ '^[0-9]{8,15}$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'propiedades_telefono_formato'
  ) then
    alter table public.propiedades
      add constraint propiedades_telefono_formato
      check (telefono_contacto is null or telefono_contacto ~ '^[0-9]{8,15}$');
  end if;
end$$;
