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
| Gradientes | `expo-linear-gradient` (módulo nativo, no SVG) | ~15.0.8 |
| Fuente | Quicksand (`@expo-google-fonts/quicksand`) | 0.4.1 |
| Schemas | Zod | 4.4.3 |
| Markdown docs | `react-native-markdown-display` | ✓ |
| Formularios | **NO** usamos React Hook Form aunque esté en `package.json`. | — |

**Web preview:** `react-native-web` está instalado para correr en navegador
(útil para iterar rápido con MCP). El bundle del cel **no lo incluye**.

---

## Convenciones (importantes — no romper)

### Commits
- **Sin formato técnico** (`feat:`, `fix:`, etc.). Usar **nombres descriptivos en camelCase** que describan qué se hizo:
  - Si: `pantallaLogin`, `flujoPublicacionConVerificacion`, `fixSolapamientoTabBar`.
  - No: `feat: add login screen`, `chore: bump deps`.
- **NO** incluir `Co-Authored-By: Claude` en los commits.
- Crear commits **solo cuando el usuario lo pida explícitamente**.

### Idioma
- Todo el texto visible al usuario en **español colombiano**, hardcodeado.
- **NO usar i18n** (no está instalado, no es prioridad).
- Comentarios de código y nombres de variables en español cuando aporta claridad.

### Estilos
- **NativeWind** vía `className` con tokens del Tailwind config:
  - Colores: `bg-bg`, `bg-accent`, `bg-accentSoft`, `text-ink`, `text-muted`, `border-line`.
  - Tipografía: `font-quicksand`, `font-quicksand-medium`, `font-quicksand-semibold`, `font-quicksand-bold`.
- Color de marca: **emerald `#10B981`** (verde esmeralda). Tabla completa en `src/theme/colors.ts`.
- Sombras inline (`shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`, `elevation`) cuando hace falta sombra real.
- Sin emojis como iconos; siempre vector vía `src/components/icons.tsx`.

### Iconos
- Todos centralizados en **`src/components/icons.tsx`** con dos patrones:
  - **Stroke** (`Stroke` wrapper): lineales, color via prop. Ej: `Mail`, `Lock`, `Heart`, `ChevronLeft`, `Star`, `Camera`, `Menu`, `InfoCircle`, `HelpCircle`, `FileText`, `LogOut`, `ClipboardList`, `MessageCircle`.
  - **Filled** (`Filled` wrapper): rellenos. Ej: `Truck`, `Car`, `Bike`, `Building2`, `Home`, `Trees`, `WhatsApp`, `HeartFilled`, `BadgeDolar`, `ShieldCheck`, `Sparkles`, `Smartphone`.
  - Marca multicolor: `GoogleIcon`, `FacebookIcon`, `AppleIcon` (Svg directo sin wrapper).
- `CATEGORY_ICONS` mapea categorías → componente (legacy). **`CategoryPill` ahora usa imágenes WebP** (`CATEGORY_IMAGES` con `require()`).
- Si el usuario pide un icono nuevo: añadirlo aquí con el patrón existente.

---

## Estructura de carpetas

```
app/                            # Expo Router (rutas)
├── _layout.tsx                 # Stack root + Providers + SplashOverlay + prefetch
├── (tabs)/
│   ├── _layout.tsx             # CustomTabBar (BlurView absolute)
│   ├── index.tsx               # Explorar: hero + carrusel + categorías + grid mixto + beneficios
│   ├── favorites.tsx           # Favoritos funcionales (Supabase query por IDs + AsyncStorage)
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
│   └── [key].tsx               # Pantalla por categoría con FiltrosSheet + CategoriaSkeleton
├── docs/
│   ├── _layout.tsx             # Stack con headers nativos, Quicksand_700Bold, back accent
│   ├── terminos-condiciones.tsx
│   ├── politica-privacidad.tsx
│   ├── sobre-nosotros.tsx
│   ├── preguntas-frecuentes.tsx
│   ├── beneficios.tsx
│   └── guia-uso-seguro.tsx     # Cada una renderiza <MarkdownDoc source={require(...)} />
├── mis-publicaciones/
│   ├── _layout.tsx             # Stack con header nativo (mismo estilo que docs)
│   ├── index.tsx               # Listado de publicaciones propias + badges status
│   └── editar/
│       └── [tipo]/[id].tsx     # Form edición unificado veh/prop (precarga + upload selectivo)
└── admin/
    ├── index.tsx               # Panel de moderación (gated por correo, cards navegan)
    └── moderar/
        └── [tipo]/[id].tsx     # Detalle moderación: carrusel fotos + campos + WhatsApp + aprobar/rechazar

src/
├── components/
│   ├── icons.tsx               # TODOS los iconos del proyecto (~30 iconos)
│   ├── CustomTabBar.tsx        # Tab bar con BlurView y FAB "Publicar"
│   ├── tabBarMetrics.ts        # useTabBarHeight() + TAB_BAR_BASE_HEIGHT=64
│   ├── Avatar.tsx              # Avatar vectorial (no foto humana)
│   ├── SearchBar.tsx
│   ├── SectionHeader.tsx       # Props: title, action?, onAction?, hideAction?
│   ├── NewArrivalsCarousel.tsx # Auto-scroll cada 2.5s con pausa por drag
│   ├── NewArrivalCard.tsx
│   ├── BeneficiosCarousel.tsx  # Scroll manual + peek + gradiente Atardecer (expo-linear-gradient)
│   ├── CategoryPill.tsx        # Usa imágenes WebP (no SVG icons)
│   ├── VehicleCard.tsx         # Con corazón favorito (sibling, no hijo)
│   ├── PropiedadCard.tsx       # Con corazón favorito (sibling, no hijo)
│   ├── DrawerMenu.tsx          # Modal transparent + Reanimated translateX
│   ├── MarkdownDoc.tsx         # expo-asset + fetch(uri) para .md
│   ├── Skeleton.tsx            # Base shimmer con Reanimated (bg-line)
│   ├── skeletons.tsx           # ExplorerSkeleton, FavoritesSkeleton, CategoriaSkeleton, MisPublicacionesSkeleton
│   ├── SplashScreen.tsx        # Logo SVG animado (stroke-draw + glow + círculo verde)
│   ├── EmptyFavoritesIllustration.tsx
│   ├── FiltrosSheet.tsx        # BottomSheet con mode "vehiculo" | "propiedad"
│   └── form/
│       ├── Checkbox.tsx
│       ├── FormInput.tsx
│       ├── FormSelect.tsx
│       ├── FormToggle.tsx
│       ├── PhotoPicker.tsx     # Exactamente 3 fotos (creación)
│       ├── PhotoPickerEdit.tsx # 3 slots con discriminated union { existente | nueva } (edición)
│       └── CountryCodeSelect.tsx
├── content/
│   └── terminosPublicacion.ts  # T&C estructurados (espejo del .md de assets)
├── data/
│   ├── mock.ts                 # NUEVAS, DISPONIBLES, CATEGORIAS (fallback de UI)
│   └── detail.ts               # getDetalleById (mock) + fetchDetalleById (async)
├── lib/
│   ├── supabase.ts             # createClient<Database>() con AsyncStorage
│   ├── auth.tsx                # SessionProvider + useSession()
│   ├── favoritos.tsx           # FavoritosProvider + useFavoritos() (AsyncStorage)
│   ├── admins.ts               # ADMIN_EMAILS + esAdmin(user)
│   └── validation/
│       └── publicacion.ts      # Zod: vehiculoSchema, propiedadSchema
├── services/
│   ├── storage.ts              # subirImagenes() — base64 → Storage 'publicaciones'
│   ├── publicaciones.ts        # crearVehiculo, crearPropiedad, getUsuarioActual()
│   ├── feed.ts                 # listar*Aprobados, listarMixtoAprobado, listarNuevasEntradas, listar*PorIds
│   ├── moderacion.ts           # listarPendientes, aprobar, rechazar
│   └── misPublicaciones.ts     # getMisPublicaciones, get/actualizarVehiculo|Propiedad (edición)
├── theme/
│   └── colors.ts               # COLORS y FONTS tokens
└── types/
    └── database.ts             # Tipos del esquema (alineados con migraciones)

supabase/
└── migrations/                 # 0001 → 0005 (el usuario los corre en SQL Editor)

assets/
├── icon1.png                   # Icono único de la app (~330 KB, 1024×1024, usado en app.json, login, registro, header Explorar y drawer)
├── favoritosvacio.png
├── *.webp                      # 6 imágenes de categoría (camionetas/carros/motos/apartamentos/casas/fincas)
├── docs/                       # 6 documentos markdown institucionales (01–06)
│   ├── 01_Terminos_y_Condiciones.md
│   ├── 02_Politica_Tratamiento_Datos_y_Privacidad.md
│   ├── 03_Sobre_Nosotros.md
│   ├── 04_Preguntas_Frecuentes.md
│   ├── 05_Beneficios_de_usar_MiLink.md
│   └── 06_Guia_de_Uso_Seguro_y_Requisitos.md
└── legal/terminos_condiciones_publicacion.md

metro.config.js                 # Extiende Expo default + NativeWind CSS + .md en assetExts
```

---

## Rutas y flujo de navegación

| Ruta | Pantalla | Quién navega aquí |
|---|---|---|
| `/(tabs)` index | **Explorar** (default) | Splash → Tab "Explorar" |
| `/(tabs)/favorites` | Favoritos (funcional con Supabase queries) | Tab "Favoritos" / corazón del hero |
| `/(tabs)/publish` | Términos legales (paso 1) | Tab "Publicar" (FAB) / "Publicar un bien" del perfil |
| `/(tabs)/profile` | Perfil (logueado o invitación a login) | Tab "Perfil" |
| `/auth/login` | Login email/password (+ stubs sociales) | Botón del perfil / auth gate |
| `/auth/register` | signUp | Link "Regístrate" del login |
| `/publish/form` | Formulario completo | Paso legal → requiere sesión |
| `/vehicle/[id]` | Detalle (veh **o** propiedad) | Tarjetas feed, carrusel, panel admin |
| `/categoria/[key]` | Listado por categoría | Píldoras de "Categorías" en Explorar |
| `/docs/*` | 6 pantallas de documentos institucionales | Drawer lateral (accesibles sin login) |
| `/mis-publicaciones` | Listado de publicaciones propias con badges de status | Perfil / Drawer (solo logueado) |
| `/mis-publicaciones/editar/[tipo]/[id]` | Form edición unificado veh/prop | Botón "Editar" en card aprobada/rechazada |
| `/admin` | Panel de moderación (listado pendientes) | Perfil (solo si `esAdmin(user)`) |
| `/admin/moderar/[tipo]/[id]` | Detalle moderación con fotos+campos+WhatsApp+aprobar/rechazar | Tap en card del listado admin |

---

## Decisiones de arquitectura

- **Auth no bloqueante**: la app abre en Explorar sin login. Solo se pide al **Reservar**, **Publicar** o **marcar favorito** (anon → Alert con opción de ir a login).
- **`SessionProvider`** (en `src/lib/auth.tsx`) escucha `onAuthStateChange` y expone `useSession()` con `{ session, user, loading, signOut }`.
- **`FavoritosProvider`** (en `src/lib/favoritos.tsx`) persiste en AsyncStorage (`@milink:favoritos`). Expone `useFavoritos()` con `{ favoritos, esFavorito(id), toggleFavorito(id, tipo), loading }`. Revierte estado si el write a AsyncStorage falla.
- **Tabs con `BlurView` absoluto** (no ocupan layout). Pantallas con footer fijo o listas largas deben reservar espacio con **`useTabBarHeight()`** (de `src/components/tabBarMetrics.ts`). NO hardcodear paddings.
- **Splash animado overlay**: logo SVG redibujado a mano (5 paths limpios en viewBox `0 0 100 100`: techo sup, techo inf, chimenea, eslabón izq/der). Fondo `#0F1115` con grid estático + sparkles pulsantes. Animación de 6 fases (~3.5s): stroke-draw con `strokeDashoffset`, glow neon (3 capas), hold, círculo verde `withSpring`, sólido, fade-out con `runOnJS(onFinish)`. Se renderiza como overlay absoluto (`zIndex 999`); el `<Stack>` monta detrás desde t=0 y las queries disparan durante la animación.
- **Prefetch en splash**: `queryClient.prefetchQuery` de `nuevas-entradas` y `mixto-aprobado` en `_layout.tsx` `useEffect`. TanStack deduplica si Explorar lanza las mismas queries.
- **Skeleton loaders**: `Skeleton` base con shimmer Reanimated (`bg-line`, barra blanca op 0.3, `withRepeat(withTiming(1200ms), -1)`). Tres variantes: `ExplorerSkeleton` (carrusel + píldoras + grid), `FavoritesSkeleton` (4 cards), `CategoriaSkeleton` (6 cards). En Explorar: skeleton durante `isLoading`, mocks solo como fallback post-carga vacía.
- **CategoryPill con WebP**: imágenes WebP en vez de iconos SVG dentro de las píldoras de categoría. `CATEGORY_IMAGES` con `require()`. camionetas/carros son 10% más grandes via `CATEGORY_IMAGE_SIZE`.
- **Carrusel "Nuevas entradas"** auto-scroll cada 2.5s con `scrollToOffset` (más fiable que `scrollToIndex`). Pausa cuando el usuario arrastra (`userDraggingRef`).
- **BeneficiosCarousel** (rediseñado): scroll **manual** (sin auto-scroll), efecto **peek** (cards vecinas asomadas ~15% por lado, `cardWidth = min(width*0.70, 290)`), coverflow con Reanimated (`scale [0.85, 1, 0.85]`, `opacity [0.55, 1, 0.55]`). Fondo gradiente diagonal **"Atardecer"** (ámbar `#FBBF24` → coral `#FB7185`) con `expo-linear-gradient` (módulo nativo, evita el bug de SVG en Android). Card en dos capas: externa (sombra/elevation con `backgroundColor:#fff`) + interna (`overflow:hidden`, gradiente).
- **Drawer lateral**: `Modal transparent` + Reanimated `useSharedValue` para `translateX` y `overlayOpacity` (280ms, `Easing.out(cubic)`). Ancho: `min(80% viewport, 320)`. Header con avatar+inicial (logueado) o logo (anon). 7 items de navegación + logout rojo. `goTo(ruta)` cierra drawer + `setTimeout(router.push, 280)`.
- **Documentos institucionales**: 6 pantallas bajo `/docs/`, cada una renderiza `<MarkdownDoc source={require(...)} />`. `MarkdownDoc` usa `expo-asset` + `fetch(asset.localUri ?? asset.uri)` para cargar texto (NO `FileSystem.readAsStringAsync`, deprecado en SDK 54). Accesibles sin login.
- **Detalle async + hero**: `fetchDetalleById` busca mocks → `vehiculos` → `propiedades`. Animación de entrada con Reanimated `Keyframe` en wrapper interno.
- **Filtros**: `FiltrosSheet` con `mode: "vehiculo" | "propiedad"`. Acepta `categoriaFija`/`tipoFijo`.
- **Form de publicar usa `useState` + Zod**, no React Hook Form.
- **Storage**: subida via `expo-image-manipulator` base64 → `supabase.storage.from('publicaciones').upload(...)`. Path `{userId}/{tipo}/{ts}-{i}.jpg`.
- **`auth.users` NO es legible desde el cliente**. `nombre_propietario` denormalizado en `vehiculos`/`propiedades`.
- **Admin** gated por correo en `src/lib/admins.ts` + `public.es_admin()` en RLS.
- **Corazón favorito como sibling**: en `VehicleCard`/`PropiedadCard` el `Pressable` del corazón es hermano (no hijo) del `Pressable` de la card, para evitar `<button>` anidados en web.
- **"Mis publicaciones" + edición unificada**: una sola pantalla `editar/[tipo]/[id]` sirve a vehículos y propiedades. Reusa los Zod schemas y los componentes de `src/components/form/`. `PhotoPickerEdit` usa discriminated union `{ tipo: "existente"; url } | { tipo: "nueva"; uri }` para subir **solo las fotos nuevas** vía `subirImagenes(userId, tipoPlural, uris)`. Al guardar, el service inyecta `status: "pending_approval"` y la query del listado se invalida (`["mis-publicaciones", userId]`). Teléfono parseado con regex `/^(\+\d{1,3})(\d+)$/` para precargar `indicativo` + `telefono`.
- **Detalle moderación admin**: el listado `/admin` ya no tiene botones inline — cada card navega a `/admin/moderar/[tipo]/[id]`. La pantalla de detalle muestra carrusel paginado de todas las fotos, todos los campos con componente `Campo({ label, value })`, bloque destacado de teléfono con botón **WhatsApp** (`Linking.openURL(\`https://wa.me/${tel}\`)`), y botones aprobar/rechazar con `useMutation` que invalida `["pendientes"]`.

---

## Modelo de datos Supabase

### Tablas (schema `public`)

#### `vehiculos`
Campos clave: `id`, `usuario_id` → `auth.users(id)`, `marca`, `modelo`, `ano`, `categoria` (enum: automovil/camioneta/motocicleta), `transmision`, `tipo_combustible`, `color`, `numero_sillas`, `kilometraje`, `kilometraje_permitido_diario`, `precio_alquiler_diario`, `ciudad_entrega_principal`, `ciudad_entrega_opcional`, `tiene_aire_acondicionado`, `imagenes text[]`, `status` (pending_approval/approved/rejected), `telefono_contacto`, `nombre_propietario`, timestamps.

#### `propiedades`
Campos clave: `id`, `usuario_id`, `tipo_propiedad` (finca/apartamento/casa), `titulo`, `descripcion`, `departamento`, `ciudad_municipio`, `precio_alquiler_diario`, `capacidad_huespedes`, `numero_habitaciones/camas/banos`, amenidades booleanas, `imagenes text[]`, `status`, `telefono_contacto`, `nombre_propietario`, timestamps.

#### `resenas`
Polimórfica con XOR check: solo uno de `vehiculo_id`/`propiedad_id` non-null. `calificacion` int CHECK 1..5.

### RLS (resumen)
- `select`: público solo ve `approved`; dueño ve los suyos; admins ven todos.
- `insert`: solo authenticated, `auth.uid() = usuario_id`, `status = 'pending_approval'`.
- `update`/`delete`: dueño (forzando pending). Admins: policy update separada para `status`.

### Storage
- Bucket **`publicaciones`** (público). Insert/update/delete solo en `{auth.uid()}/...`.

---

## Migraciones (orden estricto)

| N° | Archivo | Qué hace |
|---|---|---|
| 0001 | `0001_init.sql` | Tablas, enums, RLS básico, índices, triggers `updated_at` |
| 0002 | `0002_publicacion_status_y_storage.sql` | Enum `publicacion_status`, columna `status`, bucket `publicaciones` |
| 0003 | `0003_admin_policies.sql` | `public.es_admin()` + policies admin |
| 0004 | `0004_telefono_contacto.sql` | Columna `telefono_contacto` en ambas tablas |
| 0005 | `0005_nombre_propietario.sql` | Columna `nombre_propietario` + backfill con `SECURITY DEFINER` |

**Status:** todas aplicadas en el proyecto `mucpwtieilxgasxagujo`.

> **Nota:** MCP de Supabase NO conectado a la cuenta del usuario. Migraciones nuevas van a `supabase/migrations/` y el usuario las pega en SQL Editor.

---

## Configuración de entorno

`.env` (gitignored): `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `.env.example` commiteado como plantilla.

Sesión: `AsyncStorage` (no SecureStore para que funcione web). Polyfill URL via `react-native-url-polyfill/auto` en `src/lib/supabase.ts`.

---

## Comandos útiles

```bash
npx tsc --noEmit                          # Chequeo de tipos
npx expo start --web --port 8095          # Preview web (MCP expo-web)
npx expo start                            # Dev server normal
npx expo install <paquete>                # Deps con versiones del SDK 54
eas build --profile development --platform android  # Build de desarrollo
```

---

## Gotchas (cosas que ya nos mordieron)

1. **Tab bar `absolute bottom-0` con BlurView** → no ocupa layout. Usar `useTabBarHeight()`, no hardcodear paddings.
2. **Reanimated 4 eliminó `sharedTransitionTag`**. No intentar shared element; usar hero fade+scale en wrapper interno.
3. **Carrusel auto-scroll**: `scrollToOffset(index * STEP)` más fiable que `scrollToIndex`. Necesita `userDraggingRef` para no sobrescribir índice tras auto-scroll.
4. **`auth.users` bloqueado en cliente** por RLS. `nombre_propietario` denormalizado en publicaciones.
5. **`scrollToOffset` y `pagingEnabled`**: carrusel detalle usa `pagingEnabled` (ancho pantalla); Nuevas entradas usa `snapToInterval`.
6. **`expo install` vs `npm install`**: siempre `expo install` para deps de Expo SDK 54.
7. **Email confirmation** en Supabase Auth → para pruebas conviene OFF.
8. **Reanimated 4 en web**: funciona, pero `transform` durante animación puede dejar residuos. Si se ve raro en web, no es necesariamente bug en nativo.
9. **MCP Supabase** conectado a otra cuenta — migraciones se dan al usuario para SQL Editor.
10. **Nested `<button>` en web**: Pressable corazón dentro de Pressable card → `<button>` anidados (HTML inválido). Solución: heart como **sibling** absoluto, no hijo.
11. **`FileSystem.readAsStringAsync` deprecado en SDK 54**: usar `fetch(asset.localUri ?? asset.uri)` para cargar archivos .md.
12. **`react-native-markdown-display` + React 19**: requiere `--legacy-peer-deps`. Después de instalarlo, verificar que `react-native-worklets` sigue presente.
13. **Gradientes SVG en Android se fragmentan**: combinar `<Svg viewBox + preserveAspectRatio="none">` con `<LinearGradient>` (cualquier modo: `userSpaceOnUse` u `objectBoundingBox`) renderiza el gradiente en **bloques sólidos** en Android (Skia ignora la deformación del viewBox al calcular los stops). En web sí queda continuo. **Solución:** `expo-linear-gradient` (módulo nativo: Android `android.graphics.LinearGradient`, iOS `CAGradientLayer`, web `linear-gradient` CSS). Como agrega código nativo, **requiere rebuild del dev-client** (`eas build --profile development --platform android`), no basta con `--clear`.

---

## Cómo extender (recetas)

### Agregar un icono nuevo
Editar `src/components/icons.tsx`: Stroke (`Stroke` wrapper) para lineales, Filled (`Filled` wrapper) para rellenos, `Svg` directo para multicolor.

### Agregar una pantalla nueva
1. Crear archivo en `app/...` (Expo Router toma la ruta del path).
2. Registrarla en `app/_layout.tsx` con `<Stack.Screen name="..." />` (si no es tab).
3. Auth gate: `useSession()` + `router.replace('/auth/login')`. Admin gate: `esAdmin(user)`.

### Agregar un documento institucional
1. Crear `.md` en `assets/docs/` (numerado `0N_Nombre.md`).
2. Crear screen en `app/docs/` con `<MarkdownDoc source={require("../../assets/docs/0N_Nombre.md")} />`.
3. Añadir item al drawer en `DrawerMenu.tsx` (array de items con icono + label + ruta).

### Agregar una columna a vehículos/propiedades
1. Crear migración en `supabase/migrations/`. 2. Actualizar `src/types/database.ts`. 3. Actualizar insert en `src/services/publicaciones.ts`. 4. Si se muestra: actualizar selects en `src/services/feed.ts`.

### Agregar un filtro nuevo
1. Extender tipo `Filtros*` en `src/services/feed.ts`. 2. Aplicar en la query. 3. Añadir input en `FiltrosSheet.tsx`.

### Agregar un admin nuevo
1. Editar `ADMIN_EMAILS` en `src/lib/admins.ts`. 2. Actualizar `public.es_admin()` en migraciones (o nueva migración).

---

## Estado actual (snapshot junio 2026)

**Flujo completo funcional**: registro → login → publicar (T&C + form + 3 fotos + modal) → admin aprueba/rechaza desde detalle de moderación → aparece en Explorar (mixto veh+prop) y en su categoría → detalle con propietario real, teléfono y WhatsApp link. El dueño ve sus publicaciones en "Mis publicaciones" con badge de estado y puede editarlas (vuelven a `pending_approval`). Auth real con Supabase Auth, sesión persistida en AsyncStorage. Storage real: fotos suben a bucket `publicaciones`.

**Funcionalidades recientes**:
- **"Mis publicaciones"**: listado del dueño con badges (En revisión / Aprobada / Rechazada) + form unificado de edición para vehículo y propiedad (precarga datos, sube solo fotos nuevas, status → pending_approval). Accesible desde Perfil y Drawer.
- **Detalle de moderación admin**: carrusel de todas las fotos, todos los campos del formulario, bloque de teléfono con botón WhatsApp, botones aprobar/rechazar. Listado admin pasó a ser solo navegación (card → detalle), sin botones inline.
- **BeneficiosCarousel rediseñado**: gradiente diagonal "Atardecer" (ámbar → coral) con `expo-linear-gradient` + peek manual (sin auto-scroll) que muestra las cards vecinas asomadas para invitar a deslizar.
- **Header de Explorar**: reorganizado — izquierda logo+texto "Milink", derecha corazón Favoritos + menú hamburguesa.
- **Selector país**: +503 El Salvador agregado entre España y Panamá.
- **Favoritos funcionales**: persistencia local con AsyncStorage, queries a Supabase por IDs, corazón en todas las cards con auth gate, pantalla con FlatList + skeleton + empty state + error state + RefreshControl.
- **Splash animado (~3.5s)**: logo SVG dibujado por fases (stroke-draw + glow + círculo verde spring + fade-out). Precarga datos del feed durante la animación.
- **Skeleton loaders**: shimmer en Explorar, Favoritos, Categoría y Mis publicaciones (no mocks).
- **Drawer lateral**: menú hamburguesa con navegación a docs y cuenta (incluye "Mis publicaciones"), animado con Reanimated.
- **6 documentos institucionales**: términos, privacidad, sobre nosotros, FAQ, beneficios, guía de uso seguro. Renderizados con react-native-markdown-display. Accesibles sin login.
- **Categorías con WebP**: imágenes WebP en las píldoras de categoría (camionetas/carros 10% más grandes).

**Pendientes conocidos**: comprimir logo (~5 MB), conectar OAuth Google/Facebook/Apple (hoy son stubs), modo oscuro (no tocar aún).

**TSC siempre limpio antes de commit.**
