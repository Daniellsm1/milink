-- ============================================================================
-- Milink — Esquema inicial
-- Tablas: vehiculos, propiedades, resenas
-- Seguridad: RLS habilitado en las 3 tablas con políticas:
--   - SELECT abierto (cualquiera lee publicaciones)
--   - INSERT/UPDATE/DELETE: solo el usuario dueño del registro
-- ============================================================================

-- ─── Extensiones ───────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ─── Tipos enumerados (previenen typos en campos cerrados) ─────────────
create type transmision_tipo as enum ('mecanico', 'automatico');
create type combustible_tipo as enum ('gasolina', 'diesel', 'hibrido', 'electrico', 'gas');
create type vehiculo_categoria as enum ('automovil', 'camioneta', 'motocicleta');
create type propiedad_tipo as enum ('finca', 'apartamento', 'casa');

-- ─── Función helper: actualizar updated_at automáticamente ─────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLA: vehiculos
-- ============================================================================
create table public.vehiculos (
  id                          uuid primary key default gen_random_uuid(),
  usuario_id                  uuid not null references auth.users(id) on delete cascade,

  -- Identificación
  marca                       text not null,
  modelo                      text not null,
  ano                         integer not null,
  color                       text,
  placa_terminacion           integer,         -- último dígito de la placa (pico y placa)

  -- Técnicas
  kilometraje                 integer not null default 0,
  transmision                 transmision_tipo not null,
  tipo_combustible            combustible_tipo not null,
  categoria                   vehiculo_categoria not null,
  numero_sillas               integer,
  capacidad_baul_litros       integer,

  -- Documentación
  fecha_vencimiento_soat      date,
  fecha_vencimiento_tecnomec  date,
  tiene_aire_acondicionado    boolean not null default false,

  -- Alquiler
  precio_alquiler_diario      numeric(12, 2) not null,
  kilometraje_permitido_diario integer,        -- null = libre
  deposito_garantia           numeric(12, 2),
  permite_conductor_adicional boolean not null default false,

  -- Ubicación
  ciudad_entrega_principal    text not null,
  ciudad_entrega_opcional     text,

  -- Contenido
  descripcion                 text,
  imagenes                    text[] not null default '{}',
  disponible                  boolean not null default true,

  -- Auditoría
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- Validaciones de integridad
  constraint vehiculos_ano_valido check (ano between 1950 and extract(year from now())::int + 1),
  constraint vehiculos_kilometraje_no_negativo check (kilometraje >= 0),
  constraint vehiculos_precio_positivo check (precio_alquiler_diario > 0),
  constraint vehiculos_placa_terminacion_rango check (
    placa_terminacion is null or placa_terminacion between 0 and 9
  ),
  constraint vehiculos_sillas_positivas check (numero_sillas is null or numero_sillas > 0),
  constraint vehiculos_baul_no_negativo check (capacidad_baul_litros is null or capacidad_baul_litros >= 0)
);

create index vehiculos_usuario_idx       on public.vehiculos(usuario_id);
create index vehiculos_ciudad_idx        on public.vehiculos(ciudad_entrega_principal);
create index vehiculos_categoria_idx     on public.vehiculos(categoria);
create index vehiculos_disponible_idx    on public.vehiculos(disponible) where disponible = true;

create trigger vehiculos_set_updated_at
  before update on public.vehiculos
  for each row execute function public.set_updated_at();

-- ============================================================================
-- TABLA: propiedades
-- ============================================================================
create table public.propiedades (
  id                          uuid primary key default gen_random_uuid(),
  usuario_id                  uuid not null references auth.users(id) on delete cascade,

  -- Identificación
  tipo_propiedad              propiedad_tipo not null,
  titulo                      text not null,
  descripcion                 text,

  -- Alquiler
  precio_alquiler_diario      numeric(12, 2) not null,

  -- Ubicación
  departamento                text not null,
  ciudad_municipio            text not null,

  -- Capacidad
  capacidad_huespedes         integer not null,
  numero_habitaciones         integer not null,
  numero_camas                integer not null,
  numero_banos                integer not null,

  -- Comodidades (filtros rápidos)
  tiene_piscina               boolean not null default false,
  tiene_wifi                  boolean not null default false,
  tiene_parqueadero           boolean not null default false,
  tiene_aire_acondicionado    boolean not null default false,
  es_pet_friendly             boolean not null default false,
  tiene_zona_bbq              boolean not null default false,

  -- Contenido
  imagenes                    text[] not null default '{}',
  disponible                  boolean not null default true,

  -- Auditoría
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- Validaciones
  constraint propiedades_precio_positivo       check (precio_alquiler_diario > 0),
  constraint propiedades_huespedes_positivos   check (capacidad_huespedes > 0),
  constraint propiedades_habitaciones_no_neg   check (numero_habitaciones >= 0),
  constraint propiedades_camas_no_neg          check (numero_camas >= 0),
  constraint propiedades_banos_no_neg          check (numero_banos >= 0)
);

create index propiedades_usuario_idx        on public.propiedades(usuario_id);
create index propiedades_tipo_idx           on public.propiedades(tipo_propiedad);
create index propiedades_ciudad_idx         on public.propiedades(ciudad_municipio);
create index propiedades_departamento_idx   on public.propiedades(departamento);
create index propiedades_disponible_idx     on public.propiedades(disponible) where disponible = true;

create trigger propiedades_set_updated_at
  before update on public.propiedades
  for each row execute function public.set_updated_at();

-- ============================================================================
-- TABLA: resenas (polimórfica: vehiculo XOR propiedad)
-- ============================================================================
create table public.resenas (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null references auth.users(id) on delete cascade,
  vehiculo_id   uuid references public.vehiculos(id)   on delete cascade,
  propiedad_id  uuid references public.propiedades(id) on delete cascade,

  calificacion  integer not null,
  comentario    text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- 1..5 estrellas
  constraint resenas_calificacion_rango check (calificacion between 1 and 5),

  -- Polimorfismo: debe apuntar a UN solo ítem (vehículo O propiedad)
  constraint resenas_un_solo_objetivo check (
    (vehiculo_id is not null and propiedad_id is null) or
    (vehiculo_id is null and propiedad_id is not null)
  )
);

-- Un usuario no puede reseñar el mismo ítem dos veces
create unique index resenas_unica_por_vehiculo
  on public.resenas(usuario_id, vehiculo_id)
  where vehiculo_id is not null;

create unique index resenas_unica_por_propiedad
  on public.resenas(usuario_id, propiedad_id)
  where propiedad_id is not null;

create index resenas_vehiculo_idx   on public.resenas(vehiculo_id)  where vehiculo_id is not null;
create index resenas_propiedad_idx  on public.resenas(propiedad_id) where propiedad_id is not null;
create index resenas_usuario_idx    on public.resenas(usuario_id);

create trigger resenas_set_updated_at
  before update on public.resenas
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.vehiculos   enable row level security;
alter table public.propiedades enable row level security;
alter table public.resenas     enable row level security;

-- ─── vehiculos ─────────────────────────────────────────────────────────
create policy "vehiculos_select_publico"
  on public.vehiculos for select
  using (true);

create policy "vehiculos_insert_propio"
  on public.vehiculos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy "vehiculos_update_propio"
  on public.vehiculos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy "vehiculos_delete_propio"
  on public.vehiculos for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- ─── propiedades ───────────────────────────────────────────────────────
create policy "propiedades_select_publico"
  on public.propiedades for select
  using (true);

create policy "propiedades_insert_propio"
  on public.propiedades for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy "propiedades_update_propio"
  on public.propiedades for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy "propiedades_delete_propio"
  on public.propiedades for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- ─── resenas ───────────────────────────────────────────────────────────
create policy "resenas_select_publico"
  on public.resenas for select
  using (true);

create policy "resenas_insert_propio"
  on public.resenas for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy "resenas_update_propio"
  on public.resenas for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy "resenas_delete_propio"
  on public.resenas for delete
  to authenticated
  using (auth.uid() = usuario_id);
