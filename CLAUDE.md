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
  - **Stroke** (`Stroke` wrapper): lineales, color via prop. Ej: `Mail`, `Lock`, `Heart`, `ChevronLeft`, `Star`, `Camera`, `Menu`, `InfoCircle`, `HelpCircle`, `FileText`, `LogOut`, `ClipboardList`, `MessageCircle`, `Download`, `IosShare`.
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
│   ├── login.tsx               # signInWithPassword (sociales son stub) + link "¿olvidaste contraseña?"
│   ├── register.tsx            # signUp con user_metadata.nombre
│   ├── forgot-password.tsx     # resetPasswordForEmail (redirectTo via expo-linking)
│   └── reset-password.tsx      # updateUser({password}) tras llegar del enlace/deep link
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
│   ├── icons.tsx               # TODOS los iconos del proyecto (~32 iconos)
│   ├── InstallPwaButton.tsx    # Botón "Instalar" PWA (solo web) + hoja iOS; null en nativo
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
│   ├── supabase.ts             # createClient<Database>() con sessionStorage por plataforma
│   ├── auth.tsx                # SessionProvider + useSession() (maneja refresh token inválido)
│   ├── favoritos.tsx           # FavoritosProvider + useFavoritos() (AsyncStorage)
│   ├── pwaInstall.ts           # usePwaInstall() — beforeinstallprompt / iOS / una sola vez (solo web)
│   ├── responsive.ts           # useWebMaxWidth(n) + useCardColumns() (breakpoint 768px)
│   ├── sessionStorage.ts       # SecureStore chunked (nativo) | AsyncStorage (web) | no-op SSR
│   ├── admins.ts               # ADMIN_EMAILS + esAdmin(user)
│   └── validation/
│       └── publicacion.ts      # Zod: vehiculoSchema, propiedadSchema
├── services/
│   ├── storage.ts              # subirImagenes() — base64 → Storage 'publicaciones'
│   ├── publicaciones.ts        # crearVehiculo, crearPropiedad, getUsuarioActual()
│   ├── feed.ts                 # listar*Aprobados, listarMixtoAprobado, listarNuevasEntradas, buscarMixto (saneado), listar*PorIds
│   ├── moderacion.ts           # listarPendientes, aprobar, rechazar (borra fotos de storage)
│   ├── reportes.ts             # reportar() — UGC
│   ├── bloqueos.ts             # bloquearUsuario/listarBloqueados — UGC
│   ├── cuenta.ts               # eliminarMiCuenta() (RPC)
│   └── misPublicaciones.ts     # getMisPublicaciones, get/actualizarVehiculo|Propiedad (edición)
├── theme/
│   └── colors.ts               # COLORS y FONTS tokens
└── types/
    └── database.ts             # Tipos del esquema (alineados con migraciones)

supabase/
└── migrations/                 # 0001 → 0011 (el usuario los corre en SQL Editor)

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
| `/auth/forgot-password` | Solicitar enlace de recuperación | Link "¿Olvidaste tu contraseña?" del login |
| `/auth/reset-password` | Definir nueva contraseña (llega del enlace/deep link) | Email de recuperación → web URL o `milink://` |
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
- **`SessionProvider`** (en `src/lib/auth.tsx`) escucha `onAuthStateChange` y expone `useSession()` con `{ session, user, loading, signOut }`. El `getSession()` inicial maneja el error de **refresh token inválido** (`AuthApiError` tras pausar/reanudar el proyecto): llama `signOut()` para limpiar SecureStore y deja `session = null`, evitando el loop de error en cada apertura.
- **Recuperar contraseña**: `auth/forgot-password` (`resetPasswordForEmail` con `redirectTo = ExpoLinking.createURL("/auth/reset-password")` → web URL absoluta / nativo `milink://`) y `auth/reset-password` (la sesión temporal la crea Supabase desde el enlace; `updateUser({ password })`; si llega sin sesión redirige a forgot-password). Requiere `scheme: "milink"` en `app.json` y registrar las Redirect URLs en Supabase al desplegar.
- **Botón "Instalar" PWA** (`src/components/InstallPwaButton.tsx` + `src/lib/pwaInstall.ts`): SOLO web (null en nativo). Captura `beforeinstallprompt` (Android/escritorio Chrome/Edge) para lanzar el instalador; en iOS Safari abre una hoja de instrucciones (no hay instalador programático). Se oculta si ya está en standalone o si existe el flag `milink:pwa-install-dismissed` en localStorage (se persiste tras cualquier interacción → "una sola vez"). SSR-safe: todo lo que toca `window` vive en `useEffect`, estado inicial `visible=false`. Va en el header de Explorar entre "Milink" y el corazón.
- **Cuota anti-spam** (migración 0011): trigger `BEFORE INSERT` en `vehiculos`/`propiedades` (`verificar_cuota_publicaciones`, SECURITY DEFINER) que bloquea > 5 publicaciones en `pending_approval` por usuario (suma ambas tablas).
- **`FavoritosProvider`** (en `src/lib/favoritos.tsx`) persiste en AsyncStorage (`@milink:favoritos`). Expone `useFavoritos()` con `{ favoritos, esFavorito(id), toggleFavorito(id, tipo), loading }`. Revierte estado si el write a AsyncStorage falla.
- **Tabs con `BlurView` absoluto** (no ocupan layout). Pantallas con footer fijo o listas largas deben reservar espacio con **`useTabBarHeight()`** (de `src/components/tabBarMetrics.ts`). NO hardcodear paddings.
- **Splash animado overlay**: logo SVG redibujado a mano (5 paths limpios en viewBox `0 0 100 100`: techo sup, techo inf, chimenea, eslabón izq/der). Fondo `#0F1115` con grid estático + sparkles pulsantes. Animación de 6 fases (~3.5s): stroke-draw con `strokeDashoffset`, glow neon (3 capas), hold, círculo verde `withSpring`, sólido, fade-out con `runOnJS(onFinish)`. Se renderiza como overlay absoluto (`zIndex 999`); el `<Stack>` monta detrás desde t=0 y las queries disparan durante la animación.
- **Prefetch en splash**: `queryClient.prefetchQuery` de `nuevas-entradas` y `mixto-aprobado` en `_layout.tsx` `useEffect`. TanStack deduplica si Explorar lanza las mismas queries.
- **Skeleton loaders**: `Skeleton` base con shimmer Reanimated (`bg-line`, barra blanca op 0.3, `withRepeat(withTiming(1200ms), -1)`). Tres variantes: `ExplorerSkeleton` (carrusel + píldoras + grid), `FavoritesSkeleton` (4 cards), `CategoriaSkeleton` (6 cards). En Explorar: skeleton durante `isLoading`, mocks solo como fallback post-carga vacía.
- **CategoryPill con WebP**: imágenes WebP en vez de iconos SVG dentro de las píldoras de categoría. `CATEGORY_IMAGES` con `require()`. camionetas/carros son 10% más grandes via `CATEGORY_IMAGE_SIZE`.
- **Carrusel "Nuevas entradas"** auto-scroll cada 2.5s con `scrollToOffset` (más fiable que `scrollToIndex`). Pausa cuando el usuario arrastra (`userDraggingRef`).
- **BeneficiosCarousel** (rediseñado): scroll **manual** (sin auto-scroll), efecto **peek** (cards vecinas asomadas ~15% por lado, `cardWidth = min(width*0.70, 290)`), coverflow con Reanimated (`scale [0.85, 1, 0.85]`, `opacity [0.55, 1, 0.55]`). Fondo gradiente diagonal **"Atardecer"** (ámbar `#FBBF24` → coral `#FB7185`) con `expo-linear-gradient` (módulo nativo, evita el bug de SVG en Android). Card en dos capas: externa (sombra/elevation con `backgroundColor:#fff`) + interna (`overflow:hidden`, gradiente).
- **Drawer lateral**: `Modal transparent` + Reanimated `useSharedValue` para `translateX` y `overlayOpacity` (280ms, `Easing.out(cubic)`). Ancho: `min(80% viewport, 320)`. Header con avatar+inicial (logueado) o logo (anon). 7 items de navegación + logout rojo. `goTo(ruta)` cierra drawer + `setTimeout(router.push, 280)`.
- **Documentos institucionales**: 6 pantallas bajo `/docs/`, cada una renderiza `<MarkdownDoc source={require(...)} />`. `MarkdownDoc` usa `expo-asset` + `fetch(asset.localUri ?? asset.uri)` para cargar texto (NO `FileSystem.readAsStringAsync`, deprecado en SDK 54). Accesibles sin login. **Excepción**: los T&C de publicación (`app/(tabs)/publish.tsx`) usan `TERMINOS_TEXTO` inlinado (ver más abajo), no `MarkdownDoc`.
- **Detalle async + hero**: `fetchDetalleById` busca mocks → `vehiculos` → `propiedades`. Animación de entrada con Reanimated `Keyframe` en wrapper interno.
- **Filtros**: `FiltrosSheet` con `mode: "vehiculo" | "propiedad"`. Acepta `categoriaFija`/`tipoFijo`.
- **Form de publicar usa `useState` + Zod**, no React Hook Form.
- **Storage**: subida via `expo-image-manipulator` base64 → `supabase.storage.from('publicaciones').upload(...)`. Path `{userId}/{tipo}/{ts}-{i}.jpg`.
- **`auth.users` NO es legible desde el cliente**. `nombre_propietario` denormalizado en `vehiculos`/`propiedades`.
- **Admin** gated por correo en `src/lib/admins.ts` + `public.es_admin()` en RLS.
- **Corazón favorito como sibling**: en `VehicleCard`/`PropiedadCard` el `Pressable` del corazón es hermano (no hijo) del `Pressable` de la card, para evitar `<button>` anidados en web.
- **"Mis publicaciones" + edición unificada**: una sola pantalla `editar/[tipo]/[id]` sirve a vehículos y propiedades. Reusa los Zod schemas y los componentes de `src/components/form/`. `PhotoPickerEdit` usa discriminated union `{ tipo: "existente"; url } | { tipo: "nueva"; uri }` para subir **solo las fotos nuevas** vía `subirImagenes(userId, tipoPlural, uris)`. Al guardar, el service inyecta `status: "pending_approval"` y la query del listado se invalida (`["mis-publicaciones", userId]`). Teléfono parseado con regex `/^(\+\d{1,3})(\d+)$/` para precargar `indicativo` + `telefono`.
- **Detalle moderación admin**: el listado `/admin` ya no tiene botones inline — cada card navega a `/admin/moderar/[tipo]/[id]`. La pantalla de detalle muestra carrusel paginado de todas las fotos, todos los campos con componente `Campo({ label, value })`, bloque destacado de teléfono con botón **WhatsApp** (`Linking.openURL(\`https://wa.me/${tel}\`)`), y botones aprobar/rechazar. "Rechazar" abre un modal con textarea para `motivo_rechazo` (opcional). Ambas mutations llaman RPC `moderar_publicacion` e invalidan `["pendientes"]` **y** `["mis-publicaciones"]`.
- **PII protegida (contacto propietario)**: `telefono_contacto` y `nombre_propietario` **no son legibles por `anon`** (column-level REVOKE, migración 0008). En `app/vehicle/[id].tsx` el contacto se carga lazy (`queryKey: ["contacto", tipo, id]`, `enabled: !!user`) via RPC `obtener_contacto_publicacion`. Usuarios anónimos ven "Propietario verificado". Forms de publicar (`app/(tabs)/publish.tsx`) y editar (`app/mis-publicaciones/editar/[tipo]/[id].tsx`) incluyen checkbox de consentimiento (`consientoContacto`) requerido para guardar.
- **Términos de publicación inline**: `app/(tabs)/publish.tsx` renderiza `TERMINOS_TEXTO` de `src/content/terminosPublicacion.ts` (string literal completo). Elimina dependencia de `expo-asset + fetch` que falla intermitentemente en hosts web estáticos.
- **Fotos eliminadas al rechazar** (migración 0010): el RPC `moderar_publicacion` limpia `imagenes = '{}'` en rechazos; `rechazar()` en `moderacion.ts` recibe las URLs y borra los archivos del bucket (best-effort) tras el RPC. Policy `publicaciones_delete_admin` permite al admin borrar archivos de cualquier usuario.
- **Búsqueda saneada**: `buscarMixto` (`feed.ts`) hace `query.trim().replace(/[,()%]/g, "")` antes de construir el filtro `.or()` de PostgREST → evita inyección de filtros. Los `.ilike(col, valor)` con valor parametrizado ya son seguros.
- **UGC moderable** (migración 0007): `reportar()` y `bloquearUsuario()` cableados en `app/vehicle/[id].tsx` (detalle). `eliminar_mi_cuenta()` RPC desde el perfil. Requisito de Play para apps con contenido de usuarios.

---

## Modelo de datos Supabase

### Tablas (schema `public`)

#### `vehiculos`
Campos clave: `id`, `usuario_id` → `auth.users(id)`, `marca`, `modelo`, `ano`, `categoria` (enum: automovil/camioneta/motocicleta), `transmision`, `tipo_combustible`, `color`, `numero_sillas`, `kilometraje`, `kilometraje_permitido_diario`, `precio_alquiler_diario`, `ciudad_entrega_principal`, `ciudad_entrega_opcional`, `tiene_aire_acondicionado`, `imagenes text[]`, `status` (pending_approval/approved/rejected), `telefono_contacto`, `nombre_propietario`, `motivo_rechazo`, timestamps.

#### `propiedades`
Campos clave: `id`, `usuario_id`, `tipo_propiedad` (finca/apartamento/casa), `titulo`, `descripcion`, `departamento`, `ciudad_municipio`, `precio_alquiler_diario`, `capacidad_huespedes`, `numero_habitaciones/camas/banos`, amenidades booleanas, `imagenes text[]`, `status`, `telefono_contacto`, `nombre_propietario`, `motivo_rechazo`, timestamps.

#### `resenas`
Polimórfica con XOR check: solo uno de `vehiculo_id`/`propiedad_id` non-null. `calificacion` int CHECK 1..5.

### RLS (resumen)
- `select`: `anon` ve `approved` pero **NO** `telefono_contacto`/`nombre_propietario` (column-level REVOKE). `authenticated` ve todo lo que RLS permite. Dueño ve los suyos. Admins ven todos.
- `insert`: solo authenticated, `auth.uid() = usuario_id`, `status = 'pending_approval'`.
- `update`/`delete`: dueño (forzando pending). **Admin NO tiene policy UPDATE directa** — usa RPC `moderar_publicacion` (SECURITY DEFINER, toca solo `status` y `motivo_rechazo`).
- Contacto PII: solo disponible vía RPC `obtener_contacto_publicacion(tipo, id)` para `authenticated`; devuelve error si `auth.uid() is null`.

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
| 0006 | `0006_admin_usuarios.sql` | RPC `admin_eliminar_usuario(p_user_id)` (SECURITY DEFINER) + listado admin |
| 0007 | `0007_cuenta_y_ugc.sql` | RPC `eliminar_mi_cuenta()` + tablas `reportes`/`bloqueos` + `admin_listar_reportes()` |
| 0008 | `0008_pii_contacto_protegida.sql` | REVOKE/GRANT column-level en `vehiculos`/`propiedades` para `anon` (excluye `telefono_contacto` y `nombre_propietario`); RPC `obtener_contacto_publicacion(p_tipo, p_id)` SECURITY DEFINER, solo `authenticated` |
| 0009 | `0009_moderacion_rpc.sql` | Columna `motivo_rechazo` en ambas tablas; RPC `moderar_publicacion(p_tipo, p_id, p_nuevo_status, p_motivo)` SECURITY DEFINER; elimina policies `*_update_admin` directas |
| 0010 | `0010_limpiar_fotos_al_rechazar.sql` | Policy `publicaciones_delete_admin` en storage + RPC `moderar_publicacion` ahora limpia `imagenes` al rechazar |
| 0011 | `0011_cuota_publicaciones.sql` | Trigger `verificar_cuota_publicaciones` (BEFORE INSERT) — máx. 5 publicaciones `pending_approval` por usuario |

**Status:** **0001–0011 todas aplicadas** en el proyecto `mucpwtieilxgasxagujo`.

> **Nota:** MCP de Supabase NO conectado a la cuenta del usuario. Migraciones nuevas van a `supabase/migrations/` y el usuario las pega en SQL Editor.

---

## Configuración de entorno

`.env` (gitignored): `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `.env.example` commiteado como plantilla.

`app.json`: `scheme: "milink"` (deep link para el enlace de recuperación de contraseña en nativo). `android.adaptiveIcon.foregroundImage` apunta a `assets/icon1.png` (icono del home). `web` con `output: "static"`, `themeColor: "#10B981"`. `.claude/` está en `.gitignore` (skills locales, ~53MB — no van al repo).

Sesión: adaptador por plataforma en `src/lib/sessionStorage.ts` — **SecureStore con chunking ~1.8KB en nativo** (cifrado en Keychain/Keystore), **AsyncStorage en web** (con fallback no-op en SSR). Cableado en `supabase.ts` como `auth.storage` + `detectSessionInUrl: Platform.OS === "web" && typeof window !== "undefined"`. Polyfill URL via `react-native-url-polyfill/auto`.

**Email transaccional:** Resend configurado como SMTP personalizado en Supabase Auth (dashboard → Authentication → SMTP Settings). Todos los emails de auth (confirmación de correo, enlace de recuperación de contraseña) se envían vía Resend. Las credenciales SMTP de Resend no van al repo.

**Deploy web:** PWA desplegada en producción en **milinkapp.com** (Vercel). Build: `expo export -p web` → `dist/`. Variable de entorno `EXPO_PUBLIC_SUPABASE_*` configurada en Vercel.

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
7. **Email confirmation** en Supabase Auth → para pruebas conviene OFF. **Para producción se activa manualmente al desplegar** (junto con las Redirect URLs de recuperación de contraseña: `https://<dominio>/auth/reset-password` y `milink://auth/reset-password`).
8. **Reanimated 4 en web**: funciona, pero `transform` durante animación puede dejar residuos. Si se ve raro en web, no es necesariamente bug en nativo.
9. **MCP Supabase** conectado a otra cuenta — migraciones se dan al usuario para SQL Editor.
10. **Nested `<button>` en web**: Pressable corazón dentro de Pressable card → `<button>` anidados (HTML inválido). Solución: heart como **sibling** absoluto, no hijo.
11. **`FileSystem.readAsStringAsync` deprecado en SDK 54**: usar `fetch(asset.localUri ?? asset.uri)` para cargar archivos .md.
12. **`react-native-markdown-display` + React 19**: requiere `--legacy-peer-deps`. Después de instalarlo, verificar que `react-native-worklets` sigue presente.
13. **Gradientes SVG en Android se fragmentan**: combinar `<Svg viewBox + preserveAspectRatio="none">` con `<LinearGradient>` (cualquier modo: `userSpaceOnUse` u `objectBoundingBox`) renderiza el gradiente en **bloques sólidos** en Android (Skia ignora la deformación del viewBox al calcular los stops). En web sí queda continuo. **Solución:** `expo-linear-gradient` (módulo nativo: Android `android.graphics.LinearGradient`, iOS `CAGradientLayer`, web `linear-gradient` CSS). Como agrega código nativo, **requiere rebuild del dev-client** (`eas build --profile development --platform android`), no basta con `--clear`.
14. **Web `output: "static"` hace SSR en Node — `window` no existe ahí**: Expo Router pre-renderiza cada ruta en Node antes de servir el bundle. Cualquier código que toque `window` (AsyncStorage, `detectSessionInUrl` de Supabase, `localStorage`) **revienta el `expo export -p web`** con `ReferenceError: window is not defined`. **Regla:** guard con `typeof window !== "undefined"` todo acceso al DOM/Web Storage en código que corra en el render inicial. En `sessionStorage.ts` el branch web es no-op cuando no hay window (no hay sesión que recuperar en SSR; el cliente la lee al hidratar). El TSC no atrapa esto — solo se ve al exportar.
15. **`numColumns` en `FlatList` requiere remount al cambiar**: si haces el feed responsive (2 col móvil → 4 col escritorio) tienes que pasar `key={\`cols-${n}\`}` para forzar el remount; cambiar `numColumns` en caliente lanza warning de RN y no toma efecto. Patrón usado en feed, favoritos y categoría.
16. **Ancho máximo en PWA sin romper móvil**: usar **siempre** `useWebMaxWidth(n)` de `src/lib/responsive.ts` (devuelve `null` si `Platform.OS !== "web"` o si `width < 768`). Mezclarlo en el `contentContainerStyle` del scroll y en las barras header/footer fijas. **No** introducir colores ni layouts solo-web — un iPhone (~390px) debe ver lo mismo que la app nativa.
17. **`Alert.alert` no funciona con botones en web**: `Alert.alert` con buttons en React Native Web solo renderiza `window.alert` (sin botones propios). Para confirmaciones que requieran acción (ej. "¿Iniciar sesión?"), usar `Platform.OS === "web"` + `window.confirm`. Patrón implementado en `app/vehicle/[id].tsx` (`exigirSesion`).
18. **`expo-asset + fetch` puede fallar en hosts web estáticos**: la URI bundleada de archivos `.md` no siempre se resuelve en exports estáticos. Alternativa 100% confiable: inlinear el texto como constante TypeScript (ver `src/content/terminosPublicacion.ts` + `TERMINOS_TEXTO`). Los docs institucionales (`/docs/*`) siguen con `MarkdownDoc` + `expo-asset` porque son menos críticos; si empiezan a fallar, migrar al mismo patrón inline.
19. **Iconos solo-web (`beforeinstallprompt`, `localStorage`, `matchMedia`) revientan en SSR**: el patrón seguro es el de `pwaInstall.ts` — `Platform.OS !== "web"` corta temprano, todo acceso a `window`/`navigator` vive en `useEffect`, y el estado inicial deja el componente en `null` para que el render del servidor y la primera hidratación coincidan. Verificar la píldora en preview: el evento `beforeinstallprompt` no dispara en Chrome headless, hay que despacharlo sintéticamente o forzar el branch temporalmente.
20. **El icono del home de Android es el `adaptiveIcon`, no `icon`**: si el icono del cel se ve mal (placeholder), cambiar `android.adaptiveIcon.foregroundImage` (no solo `expo.icon`). Solo se actualiza con un nuevo build nativo (`eas build`), no con `--clear`. El `foregroundImage` se recorta en círculo/squircle según el launcher — el logo debería tener ~20% de margen.

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

**Flujo completo funcional**: registro → login → publicar (T&C + form + 3 fotos + modal) → admin aprueba/rechaza (con motivo opcional) desde detalle de moderación → aparece en Explorar (mixto veh+prop) y en su categoría → detalle con propietario real, teléfono y WhatsApp link (solo para autenticados). El dueño ve sus publicaciones en "Mis publicaciones" con badge de estado y motivo de rechazo si aplica, y puede editarlas (vuelven a `pending_approval`). Auth real con Supabase Auth, sesión persistida en AsyncStorage. Storage real: fotos suben a bucket `publicaciones`.

**Funcionalidades recientes**:
- **Botón "Instalar" PWA** (solo web): píldora esmeralda en el header de Explorar entre "Milink" y el corazón. Prompt nativo en Android/escritorio, hoja de instrucciones en iOS, se muestra una sola vez. `usePwaInstall` + `InstallPwaButton`.
- **Recuperar contraseña**: `auth/forgot-password` + `auth/reset-password` con deep link `milink://`. Link "¿Olvidaste tu contraseña?" en login.
- **Anti-spam**: cuota de máx. 5 publicaciones pending por usuario (trigger, migración 0011).
- **Fotos de rechazadas eliminadas** (migración 0010): RPC limpia `imagenes` + borrado en storage.
- **Refresh token inválido manejado** en `auth.tsx` (evita loop de `AuthApiError`).
- **Fase 2 PWA (§6–§10 del plan)**: el mismo código exporta a `dist/` como PWA estática (`web.output: "static"` en `app.json`). Stack web:
  - `app/+html.tsx` = HTML root con `<head>` PWA (manifest, theme-color esmeralda, apple-touch-icon) + registro del SW.
  - `public/manifest.json` (Milink, `#10B981`/`#0F1115`) + `public/sw.js` (cache-first app shell + SWR imágenes Supabase; **NO** cachea `/auth/`,`/rest/`,`/realtime/`) + `public/icons/{192,512,maskable-512}.png` generados desde `assets/icon1.png` con `@expo/image-utils`.
  - `src/lib/sessionStorage.ts` = SecureStore nativo (chunked) | AsyncStorage web | no-op SSR.
  - `src/lib/responsive.ts` = `useWebMaxWidth(n)` + `useCardColumns()` (breakpoint 768px → móvil/nativo intacto).
  - Splash animado se salta en web (`Platform.OS === "web"` en `_layout.tsx`).
- **PWA en producción en milinkapp.com** (Vercel): da las URLs públicas de Política de Privacidad y eliminación de cuenta que Play exige. Redirect URLs de recuperación configuradas en Supabase.
- **Resend como SMTP de Supabase**: emails de auth (confirmación, recuperación) se envían vía Resend (configurado en dashboard, no en código).
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
- **Protección PII del propietario** (migración 0008): `telefono_contacto` y `nombre_propietario` ocultos para `anon` via column-level REVOKE. Contacto cargado lazy con RPC `obtener_contacto_publicacion` solo para `authenticated`. Anónimos ven "Propietario verificado". Checkbox de consentimiento en publicar y editar.
- **Moderación admin vía RPC + motivo de rechazo** (migración 0009): policies UPDATE directas del admin eliminadas; admin llama RPC `moderar_publicacion` (SECURITY DEFINER). Modal de rechazo con textarea para motivo opcional. El motivo aparece en "Mis publicaciones" bajo la card rechazada (bloque rojo). Mutations invalidan `["pendientes"]` y `["mis-publicaciones"]`.
- **Términos de publicación inline**: `TERMINOS_TEXTO` como constante en `src/content/terminosPublicacion.ts`; elimina fallo de `expo-asset + fetch` en web estático.

**Pendientes conocidos** (ver `PLAN_PUBLICACION_Y_PWA.md` para detalle/prioridad):
- 🔴 Assets ficha Play Store: IARC, ícono 512×512, gráfico 1024×500, capturas, descripción.
- 🟠 Activar confirmación de correo + Redirect URLs de recuperación (manual en Supabase) + CAPTCHA.
- 🟠 Error Boundary global + Sentry (no hay manejo de crashes).
- 🟡 Higiene: `git rm -r --cached .claude` (ya en `.gitignore`); quitar deps muertas (`react-hook-form`, `expo-notifications`, `expo-file-system` — confirmado sin imports); thumbnails del feed (`?width=`); tests; admin email en tabla `roles`.
- 🟡 PWA: SW cachea toda navegación bajo `/` (fallback offline impreciso); `VERSION` del SW no se autobumpea.
- Otros: conectar OAuth Google/Facebook/Apple (hoy stubs), modo oscuro (no tocar aún), comprimir logo.

**TSC siempre limpio antes de commit.**
