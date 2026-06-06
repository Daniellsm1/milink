@AGENTS.md

# Milink — Memoria persistente del proyecto

Marketplace móvil de **alquiler de vehículos y propiedades** entre miembros de
las Fuerzas Militares de Colombia. Las publicaciones pasan por **moderación
admin** antes de aparecer en el feed público.

> **Regla crítica:** estamos en **Expo SDK 54** (`expo ~54.0.35`). Antes de
> escribir código relacionado a Expo o instalar paquetes, consulta los docs
> versionados (ver `AGENTS.md`). Para deps nativas usa siempre
> `npx expo install <paquete>` (no `npm install`) para que respete las
> versiones del SDK.

---

## Stack (versiones reales del proyecto)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React Native + Expo | 0.81.5 / 54.0.35 |
| Lenguaje | TypeScript (strict) | 5.9.2 |
| Estilos | NativeWind + Tailwind | 4.2.4 / 3.4.17 |
| Navegación | Expo Router | 6.0.24 |
| Auth / DB / Storage | Supabase JS | 2.106.2 |
| Sesión (cliente) | `@react-native-async-storage/async-storage` + `react-native-url-polyfill` | ✓ |
| Data fetching | TanStack React Query | 5.100.14 |
| Animaciones | Reanimated 4 + react-native-worklets | 4.1.1 / 0.8.3 |
| Iconos | `react-native-svg` (vector propio) | 15.12.1 |
| Imágenes | `expo-image` + `expo-image-picker` + `expo-image-manipulator` | ✓ |
| Blur | `expo-blur` | ~15.0.8 |
| Fuente | Quicksand (`@expo-google-fonts/quicksand`) | 0.4.1 |
| Schemas | Zod | 4.4.3 |
| Formularios | **NO** usamos React Hook Form aunque esté en `package.json`. | — |

**Web preview:** `react-native-web` está instalado para correr en navegador
(útil para iterar rápido con MCP). El bundle del cel **no lo incluye**.

---

## Convenciones (importantes — no romper)

### Commits
- **Sin formato técnico** (`feat:`, `fix:`, etc.). Usar **nombres descriptivos en camelCase** que describan qué se hizo:
  - ✅ `pantallaLogin`, `flujoPublicacionConVerificacion`, `fixSolapamientoTabBar`,
    `carruselYDisponiblesConPropiedades`, `nombreRealPropietarioEnDetalle`.
  - ❌ `feat: add login screen`, `chore: bump deps`.
- **NO** incluir `Co-Authored-By: Claude` en los commits (se quitó después del primero).
- Crear commits **solo cuando el usuario lo pida explícitamente**.

### Idioma
- Todo el texto visible al usuario en **español colombiano**, hardcodeado.
- **NO usar i18n** (no está instalado, no es prioridad).
- Comentarios de código y nombres de variables también en español cuando aporta claridad (ej: `vehiculo`, `propiedad`, `crearVehiculo`, `nombre_propietario`).

### Estilos
- **NativeWind** vía `className` con tokens del Tailwind config:
  - Colores: `bg-bg`, `bg-accent`, `bg-accentSoft`, `text-ink`, `text-muted`, `border-line`.
  - Tipografía: `font-quicksand`, `font-quicksand-medium`, `font-quicksand-semibold`, `font-quicksand-bold`.
- Color de marca: **emerald `#10B981`** (verde esmeralda). Tabla completa en `src/theme/colors.ts`.
- Sombras inline (`shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`, `elevation`) cuando hace falta sombra real.
- Sin emojis como iconos; siempre vector vía `src/components/icons.tsx`.

### Iconos
- Todos centralizados en **`src/components/icons.tsx`** con dos patrones:
  - **Stroke** (`Stroke` wrapper): lineales, color via prop. Ej: `Mail`, `Lock`, `Heart`, `ChevronLeft`, `Star`, `Camera`.
  - **Filled** (`Filled` wrapper): rellenos. Ej: `Truck`, `Car`, `Bike`, `Building2`, `Home`, `Trees`, `WhatsApp`, `HeartFilled`.
  - Marca multicolor: `GoogleIcon`, `FacebookIcon`, `AppleIcon` (Svg directo sin wrapper).
- `CATEGORY_ICONS` mapea `camionetas/carros/motos/apartamentos/casas/fincas` → componente.
- Si el usuario pide un icono nuevo: añadirlo aquí con el patrón existente.

---

## Estructura de carpetas

```
app/                            # Expo Router (rutas)
├── _layout.tsx                 # Stack root + SessionProvider + QueryClient + Splash/fonts
├── (tabs)/
│   ├── _layout.tsx             # CustomTabBar (BlurView absolute)
│   ├── index.tsx               # Explorar: hero + carrusel + categorías + grid mixto
│   ├── favorites.tsx           # (UI estática por ahora)
│   ├── publish.tsx             # Paso 1: términos legales + checkboxes
│   └── profile.tsx             # Perfil (logueado o anónimo) + link a /admin si es admin
├── auth/
│   ├── login.tsx               # signInWithPassword (sociales son stub)
│   └── register.tsx            # signUp con user_metadata.nombre
├── publish/
│   └── form.tsx                # Paso 2: form completo + Zod + 3 fotos + modal de éxito
├── vehicle/
│   └── [id].tsx                # Detalle (sirve vehículos Y propiedades por id)
├── categoria/
│   └── [key].tsx               # Pantalla por categoría con FiltrosSheet
└── admin/
    └── index.tsx               # Panel de moderación (gated por correo)

src/
├── components/
│   ├── icons.tsx               # TODOS los iconos del proyecto
│   ├── CustomTabBar.tsx        # Tab bar con BlurView y FAB "Publicar"
│   ├── tabBarMetrics.ts        # useTabBarHeight() + TAB_BAR_BASE_HEIGHT=64
│   ├── Avatar.tsx              # Avatar vectorial (no foto humana)
│   ├── SearchBar.tsx
│   ├── SectionHeader.tsx
│   ├── NewArrivalsCarousel.tsx # Auto-scroll cada 2.5s con pausa por drag
│   ├── NewArrivalCard.tsx
│   ├── CategoryPill.tsx
│   ├── VehicleCard.tsx
│   ├── PropiedadCard.tsx
│   ├── EmptyFavoritesIllustration.tsx
│   ├── FiltrosSheet.tsx        # BottomSheet con mode "vehiculo" | "propiedad"
│   └── form/
│       ├── Checkbox.tsx
│       ├── FormInput.tsx
│       ├── FormSelect.tsx
│       ├── FormToggle.tsx
│       ├── PhotoPicker.tsx     # Exactamente 3 fotos
│       └── CountryCodeSelect.tsx
├── content/
│   └── terminosPublicacion.ts  # T&C estructurados (espejo del .md de assets)
├── data/
│   ├── mock.ts                 # NUEVAS, DISPONIBLES, CATEGORIAS (fallback de UI)
│   └── detail.ts               # getDetalleById (mock) + fetchDetalleById (async, busca veh y prop)
├── lib/
│   ├── supabase.ts             # createClient<Database>() con AsyncStorage
│   ├── auth.tsx                # SessionProvider + useSession()
│   ├── admins.ts               # ADMIN_EMAILS = ["daniel200430@hotmail.com"] + esAdmin(user)
│   └── validation/
│       └── publicacion.ts      # Zod: vehiculoSchema, propiedadSchema, COUNTRY_CODES, telefonoCompleto()
├── services/
│   ├── storage.ts              # subirImagenes() — base64 → Storage 'publicaciones'
│   ├── publicaciones.ts        # crearVehiculo, crearPropiedad, getUsuarioActual()
│   ├── feed.ts                 # listarVehiculosAprobados, listarPropiedadesAprobadas, listarMixtoAprobado, listarNuevasEntradas
│   └── moderacion.ts           # listarPendientes, aprobar, rechazar
├── theme/
│   └── colors.ts               # COLORS y FONTS tokens
└── types/
    └── database.ts             # Tipos del esquema (alineados con migraciones)

supabase/
└── migrations/                 # 0001 → 0005 (el usuario los corre en SQL Editor)

assets/
├── milink-icon.png             # Logo (¡pesa ~5 MB ahora! pendiente comprimir)
├── favoritosvacio.png
└── legal/terminos_condiciones_publicacion.md   # Documento canónico
```

---

## Rutas y flujo de navegación

| Ruta | Pantalla | Quién navega aquí |
|---|---|---|
| `/(tabs)` | Tab bar root | Splash inicial |
| `/(tabs)` index | **Explorar** (default) | Tab "Explorar" del bar |
| `/(tabs)/favorites` | Favoritos (estado vacío estático por ahora) | Tab "Favoritos" |
| `/(tabs)/publish` | Términos legales (paso 1) | Tab "Publicar" (FAB) y botón "Publicar un bien" del perfil |
| `/(tabs)/profile` | Perfil (logueado o invitación a login) | Tab "Perfil" e icono ☺ del header de Explorar |
| `/auth/login` | Login con email/password (+ stubs sociales) | Botón "Iniciar sesión / Registrarse" del perfil |
| `/auth/register` | signUp | Link "Regístrate" del login |
| `/publish/form` | Formulario completo | Botón "Continuar al formulario" del paso legal (requiere sesión, si no redirige a login) |
| `/vehicle/[id]` | Detalle (vehículo **o** propiedad — `fetchDetalleById` decide) | Tarjetas del feed, carrusel, panel admin |
| `/categoria/[key]` | Listado filtrado por categoría | Píldoras de "Categorías" en Explorar |
| `/admin` | Panel de moderación | Botón "Panel de moderación" del perfil (solo si `esAdmin(user)`) |

---

## Decisiones de arquitectura

- **Auth no bloqueante**: la app abre directo en Explorar sin pedir login. Solo se pide al **Reservar** o al **Publicar**. El header tiene ícono de Perfil que va a `/profile`; ahí se ofrece login.
- **`SessionProvider`** (en `src/lib/auth.tsx`) escucha `onAuthStateChange` y expone `useSession()` con `{ session, user, loading, signOut }`.
- **Tabs con `BlurView` absoluto** (no ocupan layout). Pantallas con footer fijo o listas largas deben reservar espacio con **`useTabBarHeight()`** (de `src/components/tabBarMetrics.ts`). NO hardcodear paddings tipo `120`.
- **Carrusel "Nuevas entradas"** auto-scroll cada 2.5 s con `scrollToOffset` (más fiable que `scrollToIndex`). Pausa cuando el usuario arrastra (`onScrollBeginDrag`) y reanuda al soltar (`onScrollEndDrag`). Usa bandera `userDraggingRef` para distinguir scrolls programáticos de manuales (si no, el `onMomentumScrollEnd` sobreescribe el índice).
- **Detalle async + hero**: `fetchDetalleById` primero mira mocks, después tabla `vehiculos`, después `propiedades` (en ese orden). Animación de entrada con Reanimated `Keyframe` (fade + scale 1.08→1, 380 ms) en un **wrapper interno** (el wrapper externo con `marginTop: -24` no debe tener transform, rompía stacking en web).
- **Filtros**: un solo componente `FiltrosSheet` con `mode: "vehiculo" | "propiedad"`. Acepta `categoriaFija`/`tipoFijo` para cuando vienes de una categoría específica. En Explorar, cuando hay filtros activos solo se muestran vehículos filtrados (no mocks ni propiedades).
- **Form de publicar usa `useState` + Zod**, no React Hook Form (decisión consciente para no reescribir ~30 campos). Esquema en `src/lib/validation/publicacion.ts`.
- **Storage**: subida via `expo-image-manipulator` que devuelve base64 → `base64-arraybuffer` → `supabase.storage.from('publicaciones').upload(...)`. Funciona web y nativo. Path `{userId}/{tipo}/{ts}-{i}.jpg`. RLS exige que el primer segmento del path = `auth.uid()`.
- **`auth.users` NO es legible desde el cliente** (RLS). Por eso denormalizamos `nombre_propietario` directamente en `vehiculos` y `propiedades` (set en INSERT con el `user_metadata.nombre`, y backfill via función `auth_user_nombre()` con `SECURITY DEFINER` en la migración 0005).
- **Admin** gated por correo en `src/lib/admins.ts` (`ADMIN_EMAILS = ["daniel200430@hotmail.com"]`) y por policies RLS de la migración 0003 (función `public.es_admin()` debe coincidir con esa lista).

---

## Modelo de datos Supabase

### Tablas (schema `public`)

#### `vehiculos`
Campos clave: `id`, `usuario_id` → `auth.users(id)`, `marca`, `modelo`, `ano`, `categoria` (enum `vehiculo_categoria`: automovil/camioneta/motocicleta), `transmision` (mecanico/automatico), `tipo_combustible` (gasolina/diesel/hibrido/electrico/gas), `color`, `numero_sillas`, `kilometraje`, `kilometraje_permitido_diario`, `precio_alquiler_diario`, `ciudad_entrega_principal`, `ciudad_entrega_opcional`, `tiene_aire_acondicionado`, `imagenes text[]`, **`status` (`publicacion_status`: pending_approval/approved/rejected — default pending_approval)**, **`telefono_contacto`**, **`nombre_propietario`**, `created_at`, `updated_at`.

#### `propiedades`
Campos clave: `id`, `usuario_id`, `tipo_propiedad` (enum `propiedad_tipo`: finca/apartamento/casa), `titulo`, `descripcion`, `departamento`, `ciudad_municipio`, `precio_alquiler_diario`, `capacidad_huespedes`, `numero_habitaciones`, `numero_camas`, `numero_banos`, `tiene_piscina/wifi/parqueadero/aire_acondicionado/zona_bbq`, `es_pet_friendly`, `imagenes text[]`, `status`, `telefono_contacto`, `nombre_propietario`, timestamps.

#### `resenas`
Polimórfica con XOR check: solo uno de `vehiculo_id` / `propiedad_id` puede ser non-null. `calificacion` int CHECK 1..5. Índices únicos `(usuario_id, vehiculo_id)` y `(usuario_id, propiedad_id)`.

### RLS (resumen)
- `select`: público solo ve `approved`; el dueño ve todos los suyos; admins ven todos.
- `insert`: solo authenticated, `auth.uid() = usuario_id` y `status = 'pending_approval'`.
- `update` / `delete`: solo el dueño (forzando `status = 'pending_approval'`). Admins tienen policy `update` separada que permite cambiar `status`.

### Storage
- Bucket **`publicaciones`** (público). Policies: lectura abierta; insert/update/delete solo en `{auth.uid()}/...`.

---

## Migraciones (orden estricto)

| N° | Archivo | Qué hace |
|---|---|---|
| 0001 | `0001_init.sql` | Tablas `vehiculos`/`propiedades`/`resenas`, enums, RLS básico, índices, triggers `updated_at` |
| 0002 | `0002_publicacion_status_y_storage.sql` | Enum `publicacion_status` + columna `status`, policies select/insert con status, bucket `publicaciones` + policies |
| 0003 | `0003_admin_policies.sql` | Función `public.es_admin()` + policies update/select para admins |
| 0004 | `0004_telefono_contacto.sql` | Columna `telefono_contacto` en ambas tablas |
| 0005 | `0005_nombre_propietario.sql` | Columna `nombre_propietario` + función `auth_user_nombre()` con SECURITY DEFINER + backfill |

**Status real:** todas aplicadas en el proyecto `mucpwtieilxgasxagujo` del usuario.

> **Importante:** mi MCP de Supabase NO está conectado a la cuenta del usuario.
> No puedo aplicar migraciones directamente. Cuando hay una nueva: la creo en
> `supabase/migrations/` y el usuario la pega en SQL Editor → Run.

---

## Configuración de entorno

`.env` (gitignored) — variables que se inyectan al bundle (`EXPO_PUBLIC_*`):
```
EXPO_PUBLIC_SUPABASE_URL=https://mucpwtieilxgasxagujo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```
`.env.example` está commiteado como plantilla.

Sesión: `AsyncStorage` (no SecureStore para que funcione web). Polyfill global de URL via `react-native-url-polyfill/auto` (importado al tope de `src/lib/supabase.ts`).

---

## Comandos útiles

```bash
# Chequeo de tipos
npx tsc --noEmit

# Preview web (puerto 8095 — el que usa el MCP expo-web)
npx expo start --web --port 8095

# Dev server normal
npx expo start

# Instalar deps con versiones del SDK 54
npx expo install <paquete>

# Build de desarrollo (solo cuando se agregan libs nativas)
eas build --profile development --platform android

# Aplicar migración Supabase
# → abrir Dashboard → SQL Editor → pegar contenido del .sql → Run
```

---

## Gotchas (cosas que ya nos mordieron)

1. **Tab bar es `absolute bottom-0` con `BlurView`** → no ocupa layout. Cualquier pantalla con footer fijo o lista larga debe usar `useTabBarHeight()`; no hardcodear `paddingBottom: 120`.
2. **Reanimated 4** eliminó `sharedTransitionTag`. No intentar shared element real; usar hero (fade + scale) en un wrapper interno (poner `transform` en el contenedor con `marginTop:-24` rompe el stacking en web).
3. **Carrusel auto-scroll**: `scrollToOffset(index * STEP)` es más fiable que `scrollToIndex`. Necesita `userDraggingRef` para que `onMomentumScrollEnd` no sobrescriba el índice tras un auto-scroll.
4. **`auth.users` bloqueado en el cliente** por RLS. Para mostrar el nombre del propietario denormalizamos `nombre_propietario` en las publicaciones (capturado en INSERT desde `user_metadata.nombre`, fallback al local-part del email).
5. **`scrollToOffset` y `pagingEnabled`**: en el carrusel del detalle (imágenes), `pagingEnabled` mide por ancho de pantalla; en el de Nuevas entradas usamos `snapToInterval` con `CARD_WIDTH + GAP`.
6. **`expo install` vs `npm install`**: usar siempre `expo install` para deps de Expo SDK 54.
7. **Logo `assets/milink-icon.png` ~5 MB** — pendiente comprimir (debería ser <100 KB para un asset que se renderiza a 40×40 / 72×72).
8. **Email confirmation** en Supabase Auth → si está ON, el signUp pide confirmar correo antes de poder publicar. Para pruebas conviene OFF (Authentication → Sign In / Providers → Email).
9. **Anim de Reanimated 4 en web** funciona, pero algunas cosas como el `transform` durante la animación dejan residuos. Si algo se ve raro en web, **no es necesariamente bug en nativo**.
10. **MCP Supabase** está conectado a otra cuenta — no puedo correr migraciones directamente, hay que dárselas al usuario.

---

## Cómo extender (recetas)

### Agregar un icono nuevo
Editar `src/components/icons.tsx`:
- Lineal (con `color`): usar wrapper `Stroke`.
- Relleno (con `color`): usar wrapper `Filled`.
- Multicolor de marca: `Svg` directo.

### Agregar una pantalla nueva
1. Crear archivo en `app/...` (Expo Router toma la ruta del path).
2. Registrarla en `app/_layout.tsx` con `<Stack.Screen name="..." />` (si no es tab).
3. Si necesita gate de auth: leer `useSession()` y `router.replace('/auth/login')` si no hay user.
4. Si necesita gate de admin: leer `esAdmin(user)` de `src/lib/admins.ts`.

### Agregar una columna a vehículos/propiedades
1. Crear `supabase/migrations/000N_descripcion.sql` con `alter table … add column if not exists …`.
2. Decirle al usuario que la corra en SQL Editor.
3. Actualizar `src/types/database.ts` (Row + Insert).
4. Si va al INSERT del form: actualizar `src/services/publicaciones.ts` (`VehiculoFormData`/`PropiedadFormData` y el insert).
5. Si se muestra en feed/detalle: actualizar selects en `src/services/feed.ts` y/o `src/data/detail.ts`.

### Agregar un filtro nuevo
1. Extender `FiltrosVehiculo` o `FiltrosPropiedad` en `src/services/feed.ts`.
2. Aplicar en la query (`q.eq/ilike/gte/lte`).
3. Añadir input al `FiltrosSheet` correspondiente (`src/components/FiltrosSheet.tsx`).

### Agregar un admin nuevo
1. Editar `ADMIN_EMAILS` en `src/lib/admins.ts`.
2. **También** editar el array de emails dentro de `public.es_admin()` en `supabase/migrations/0003_admin_policies.sql` (o crear una migración 000N que reemplace la función) y correrlo en SQL Editor.

### Cambiar un texto / agregar un mensaje
Todo está en español hardcodeado. Solo editar el archivo y listo (no hay i18n).

---

## Estado actual (snapshot al cierre de la última sesión)

- **Flujo completo funcional**: registro → login → publicar (con T&C + form + 3 fotos + modal) → admin aprueba → aparece en Explorar (mixto veh+prop) y en su categoría → detalle muestra propietario real con teléfono y WhatsApp link.
- **Auth real**: signIn / signUp con Supabase Auth, sesión persistida en AsyncStorage.
- **Storage real**: las 3 fotos suben al bucket `publicaciones` y se renderizan en el feed/detalle.
- **Verificado en web preview**: TSC siempre limpio antes de commit.
- **Pendientes conocidos**: comprimir logo (~5 MB), conectar OAuth de Google/Facebook/Apple (hoy son stubs con Alert "Próximamente"), pantalla de favoritos solo tiene empty state estático (no persiste favoritos), no hay pantalla "Mis publicaciones" todavía.
