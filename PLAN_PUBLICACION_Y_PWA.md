# Milink — Plan de Publicación en Play Store y Estrategia PWA

> Auditoría técnica y hoja de ruta. Revisión hecha sobre el código real del repo
> (Expo SDK 54, RN 0.81.5, Supabase). Fecha: junio 2026.
>
> **Cómo leer este documento:** cada hallazgo tiene una severidad
> (🔴 bloqueante · 🟠 importante · 🟡 mejora) y, cuando aplica, el archivo
> exacto donde está el problema y la solución concreta.

---

## 0. Resumen ejecutivo

Milink está **mucho más maduro de lo normal** para un proyecto en pre-lanzamiento:
RLS bien pensado, moderación admin real, tipos estrictos (TSC pasa limpio), key
`sb_publishable_` correcta (no se filtra `service_role`), y operaciones sensibles
de admin detrás de RPCs `SECURITY DEFINER` gateadas por `es_admin()`. La base de
seguridad del backend es sólida.

Lo que **bloquea la publicación hoy** no es la calidad del código, son **requisitos
de política de Google Play** que el proyecto aún no cumple:

1. 🔴 **Falta URL web pública de eliminación de cuenta.** El botón in-app ya está
   implementado; Google exige también una URL accesible sin la app instalada.
2. 🔴 **Sin Política de Privacidad publicada en una URL pública** (la tienes
   in-app pero Play exige URL accesible desde la ficha y la app).
3. 🟠 **PII expuesta a anónimos:** teléfono y nombre del propietario son legibles
   sin login → cosechables por scrapers (riesgo Habeas Data, Ley 1581/2012).
4. 🟠 **Sesión en AsyncStorage sin cifrar** en vez de SecureStore en nativo.

El resto son mejoras de calidad, rendimiento y futuro. Abajo está todo detallado
y, al final, el **roadmap priorizado** y la **Fase 2 (PWA con el mismo repo)**.

---

# FASE 1 — Listos para Play Store

## 1. Riesgos de rechazo en Google Play (priorizado)

### 1.1 🔴 URL web pública de eliminación de cuenta — *bloqueante*

**Qué exige Google:** además del mecanismo in-app (ya implementado), Play exige
una **URL web pública** para solicitar el borrado sin tener la app instalada.
Esa URL se pega en Play Console → *Data safety*.

**Estado actual:** el botón in-app "Eliminar mi cuenta" ya está en
`app/(tabs)/profile.tsx` con doble confirmación, y el RPC `eliminar_mi_cuenta()`
está en `supabase/migrations/0007_cuenta_y_ugc.sql`. **Solo falta la URL web.**

**Pendiente:**
- Publicar una página simple (puede ser la misma del sitio de la PWA en
  Fase 2, o un Google Site / Notion público) con instrucciones y un correo de
  contacto para solicitar borrado.

### 1.3 🔴 Política de Privacidad en URL pública — *bloqueante*

Tienes el documento in-app (`app/docs/politica-privacidad.tsx`) pero Play exige
una **URL accesible públicamente** (sin login) tanto en la ficha de la tienda
como enlazada dentro de la app. Hospédala (GitHub Pages, Google Sites, o la web
de la PWA en Fase 2) y enlázala desde la ficha y el perfil.

### 1.4 🟠 Formulario "Data safety" (Seguridad de los datos)

Es obligatorio y debe **coincidir** con lo que la app realmente recolecta. Si
declaras de menos, es causal de suspensión. Milink recolecta: correo, nombre,
teléfono, fotos, ubicación aproximada (ciudad/departamento) y contenido del
usuario. Declara todo eso, indica que se comparte con otros usuarios (el teléfono
y nombre son visibles públicamente), y marca que hay cifrado en tránsito (HTTPS
de Supabase) y opción de eliminación de cuenta (una vez hecho 1.1).

### 1.5 🟠 Nivel de API objetivo (target SDK)

- **Hoy:** apps nuevas deben apuntar a **Android 15 (API 35)**. Expo SDK 54 /
  RN 0.81 ya apunta a API 35 → **cumples**.
- **Atención:** a partir del **31 de agosto de 2026** Play exigirá **API 36
  (Android 16)** para apps y actualizaciones nuevas. Si publicas después de esa
  fecha, planea subir a Expo SDK 55+ antes. (Hoy es junio 2026 → tienes margen,
  pero tenlo en el radar.)

### 1.8 🟡 Afiliación a las Fuerzas Militares

El nicho ("miembros de las Fuerzas Militares de Colombia") es comercialmente
válido, pero **no uses escudos, logos o insignias oficiales** sin autorización ni
des a entender respaldo/afiliación gubernamental: eso sí dispara la política de
suplantación/engaño. Mantén el lenguaje como "comunidad para militares", no como
"app oficial de…".

### 1.9 🟡 Otros requisitos de la ficha (no son código, pero sin esto no publicas)

Cuestionario de **clasificación de contenido (IARC)**, **ícono 512×512**,
**gráfico de funciones 1024×500**, mínimo **2–8 capturas** por tipo de
dispositivo, descripción corta y larga, y categoría. Sin estos, la ficha no se
puede enviar.

---

## 2. Hallazgos de seguridad (priorizado)

### 2.1 🟠 PII pública: teléfono y nombre legibles sin autenticación

La policy `*_select_aprobado_o_propio` deja leer toda fila `approved` a
**cualquiera** (incluido anónimo con la anon key). Eso incluye
`telefono_contacto` y `nombre_propietario`. Con la anon key (que va en el bundle)
un scraper puede **cosechar todos los teléfonos**. En Colombia es dato personal
(Ley 1581/2012, Habeas Data).

**Opciones (de menor a mayor esfuerzo):**
- Exponer el teléfono **solo a usuarios autenticados** vía un RPC
  `obtener_contacto(publicacion_id)` y quitar `telefono_contacto` del `select`
  público del feed/detalle.
- O mostrar el teléfono solo al pulsar "Contactar" (lazy + auth gate), no en el
  payload inicial.
- Mínimo: documentar este tratamiento en la Política de Privacidad y obtener
  consentimiento explícito al publicar (checkbox "acepto que mi teléfono será
  visible para contactarme").

### 2.2 🟠 Sesión en AsyncStorage (texto plano) en lugar de SecureStore

`src/lib/supabase.ts` usa `AsyncStorage` para persistir la sesión. AsyncStorage
**no está cifrado**; en un dispositivo rooteado el refresh token es legible. Ya
tienes `expo-secure-store` instalado y declarado en `app.json`, pero no se usa
para la sesión.

**Solución:** adaptador de storage condicional por plataforma — SecureStore en
nativo, AsyncStorage en web (SecureStore no existe en web). SecureStore tiene
límite de ~2KB por clave, así que conviene un wrapper que parta el token en
chunks. Ejemplo:

```ts
// src/lib/sessionStorage.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const sessionStorage =
  Platform.OS === "web"
    ? AsyncStorage
    : {
        getItem: (k: string) => SecureStore.getItemAsync(k),
        setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
        removeItem: (k: string) => SecureStore.deleteItemAsync(k),
      };
// (si el token supera ~2KB, partir en k.0, k.1, … o usar una lib de chunking)
```

### 2.3 🟡 Policy de UPDATE del admin demasiado amplia

`vehiculos_update_admin` / `propiedades_update_admin` permiten al admin modificar
**cualquier columna** (precio, descripción, fotos), no solo `status`. El admin es
de confianza, pero por mínimo privilegio conviene mover aprobar/rechazar a un RPC
`SECURITY DEFINER` `moderar_publicacion(tipo, id, nuevo_status)` que **solo**
toque `status`, y quitar las policies de UPDATE amplias. (Igual que ya hiciste
para la gestión de usuarios.)

### 2.4 🟡 Fotos de publicaciones rechazadas siguen siendo públicas

El bucket `publicaciones` es público y las rutas son
`{uid}/{tipo}/{timestamp}-{i}.jpg` (parcialmente adivinables). Las fotos de una
publicación **rechazada** siguen accesibles por URL. Considera: borrar las fotos
al rechazar, o usar URLs firmadas (signed URLs) para contenido no aprobado.

### 2.5 🟡 Abuso/spam: sin límites ni confirmación de correo

- RLS permite inserts ilimitados → un usuario puede inundar de publicaciones
  pendientes. Considera una **cuota por usuario** (trigger que cuente pendientes)
  o rate limiting.
- Por el gotcha #7 del `CLAUDE.md`, la confirmación de correo está **OFF**. Para
  producción **actívala** (evita cuentas falsas) y considera el **CAPTCHA
  (hCaptcha) integrado de Supabase Auth**.
- Falta flujo de **"¿Olvidaste tu contraseña?"** (`resetPasswordForEmail`).
  Súmalo: es esperado por los usuarios y por los revisores.

### 2.6 🟡 Higiene del repo

- La carpeta **`.claude/` está versionada en git** (aparece en `git status` con
  cambios). No es parte del proyecto. Añádela a `.gitignore` y haz
  `git rm -r --cached .claude` para sacarla del índice.
- El correo del admin (`daniel200430@hotmail.com`) está hardcodeado en
  `admins.ts` y en `0003_admin_policies.sql`. No es un secreto crítico (el gate
  real es server-side) pero a futuro conviene una **tabla `roles`** o un *custom
  claim* en el JWT en vez de listas en dos sitios que hay que mantener
  sincronizadas.

> **Nota positiva:** la anon key es del tipo `sb_publishable_` (diseñada para ir
> en el cliente), no hay `service_role` en el bundle, y toda la autoridad real
> vive en RLS + RPCs `SECURITY DEFINER`. Ese es el patrón correcto. 👍

---

## 3. Rendimiento y calidad de código

- 🟡 **Dependencias muertas:** `react-hook-form`, `expo-notifications`,
  `expo-file-system` y `expo-secure-store` no se importan en `app/`/`src/`
  (verificado por grep). Pesan en el bundle y confunden. Decide: **úsalas o
  quítalas**. (`expo-secure-store` vale la pena conservarla y *usarla* — ver 2.2.
  `expo-notifications` consérvala solo si vas a implementar push pronto.)
- 🟡 **Sin Error Boundary global:** un error de render tumba toda la app. Añade un
  `ErrorBoundary` en `app/_layout.tsx` con UI de fallback amable.
- 🟡 **Sin reporte de crashes:** integra **Sentry** (`@sentry/react-native`,
  plugin de Expo) para ver errores en producción. Imprescindible post-lanzamiento.
- 🟡 **Splash forzado de ~3.5s:** la animación retrasa el *cold start* de forma
  fija. Considera acortarla o permitir saltarla; los revisores y usuarios
  penalizan arranques lentos.
- 🟡 **Miniaturas del feed:** el grid carga las `publicUrl` completas (1280px).
  Usa la **transformación de imágenes de Supabase** (`?width=400`) o genera
  thumbnails para el grid; `expo-image` ya cachea, pero bajarás datos y memoria.
- 🟡 **Sin tests:** no hay ninguna prueba. Mínimo: smoke tests de los servicios
  (`feed`, `publicaciones`, `validation`) con Jest + `@testing-library/react-native`,
  y validar los esquemas Zod. Ver también la skill `engineering:testing-strategy`.
- 🟢 **Bien hecho:** TSC limpio, imágenes comprimidas en subida (resize 1280 +
  `compress 0.7`), React Query con prefetch en splash, RLS por índice, constraints
  de integridad en DB (años, precios, teléfono regex).

---

## 4. Cómo compilar y publicar en Google Play — paso a paso

> Asume que nunca lo has hecho. Usa **EAS Build** (la nube de Expo); no necesitas
> Android Studio ni configurar el SDK localmente.

### Paso 0 — Requisitos de una sola vez
1. **Cuenta de Google Play Console**: pago único de **USD 25**.
   Desde 2023 las cuentas **personales nuevas** pueden requerir **verificación de
   identidad** y, según el caso, un **periodo de pruebas cerradas con ~12–20
   testers durante 14 días** antes de poder publicar en producción. Créala cuanto
   antes para no bloquear el lanzamiento.
2. **Cuenta Expo** (gratis) y la CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```

### Paso 1 — Arreglar identidad antes de compilar (¡permanente!)
En `app.json`: cambia `android.package` a `com.danielkmm.milink` y `name` a
`"Milink"` (ver 1.7). Hazlo **ahora**, no después de publicar.

### Paso 2 — Versionado
Ya tienes `eas.json` con `production.autoIncrement: true` y
`appVersionSource: "remote"` → EAS maneja el `versionCode` por ti. Solo sube
`version` (ej. `1.0.0`) en `app.json` cuando cambie la versión visible.

### Paso 3 — Variables de entorno en EAS
Tu `.env` está gitignored (✅). Para que el build en la nube tenga las claves,
súbelas como variables de EAS:
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://mucpwtieilxgasxagujo.supabase.co" --environment production
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_..." --environment production
```
(Son `EXPO_PUBLIC_*`, o sea públicas por diseño; la seguridad está en RLS.)

### Paso 4 — Build de producción (genera el .aab)
```bash
eas build --profile production --platform android
```
EAS crea y **gestiona tu keystore** (firma de la app) automáticamente — guárdalo
bien, es lo que te permite actualizar la app en el futuro. Al terminar te da un
**`.aab`** (Android App Bundle, el formato que pide Play).

### Paso 5 — Probarla antes de publicar
- Build de prueba instalable: `eas build --profile preview --platform android`
  (genera un APK que puedes instalar en tu teléfono).
- O sube el `.aab` al canal de **pruebas internas** en Play Console.

### Paso 6 — Crear la app en Play Console y completar fichas
En Play Console → "Crear app". Luego completa (sin esto no se envía):
- **Política de Privacidad** (URL del paso 1.3).
- **Data safety** (sección 1.4).
- **Clasificación de contenido** (IARC).
- **Público objetivo y contenido** (mayores de edad).
- **Ficha principal**: ícono 512×512, gráfico de funciones 1024×500, capturas,
  descripción corta y larga.
- **URL de eliminación de cuenta** (paso 1.1).

### Paso 7 — Subir el binario
- Manual: arrastra el `.aab` en Producción (o Prueba cerrada primero).
- Automático: `eas submit --profile production --platform android` (configura una
  *service account* de Google una vez; EAS lo documenta en el primer intento).

### Paso 8 — Pruebas cerradas → Producción
Haz el ciclo de **prueba cerrada** (invita testers por correo/grupo), corrige lo
que salga, y luego promueve a **Producción**. La primera revisión suele tardar
**de unas horas a varios días**.

### Paso 9 — Post-lanzamiento
Vigila *Android vitals* (ANRs, crashes), responde reseñas, y planifica el salto a
**API 36** antes del 31-ago-2026 si publicas cerca de esa fecha.

---

## 5. Mejoras, futuras funciones e integraciones

**Producto / engagement**
- **Notificaciones push** (ya tienes `expo-notifications`): avisar al dueño cuando
  su publicación se aprueba/rechaza, y al interesado de novedades. Requiere
  configurar el plugin en `app.json` + permisos + tabla de push tokens.
- **Chat in-app** en lugar de saltar a WhatsApp: mantiene al usuario dentro,
  es más seguro y moderable (y reduce la exposición de teléfonos, ver 2.1).


---

# FASE 2 — Una sola base de código: App móvil + PWA

## 6. La buena noticia: ya estás a mitad de camino

No necesitas un monorepo ni un segundo proyecto. **Expo + Expo Router ya es
multiplataforma** y el runtime web **ya está instalado** en este repo:
`react-native-web` (^0.21.0) y `react-dom` (19.1.0) ya están en `package.json`.
El mismo código de `app/` y `src/` puede generar:
- el **APK/AAB** para Play Store (lo de la Fase 1), y
- una **web estática instalable (PWA)** con `expo export -p web`.

Y los dos pilares de la identidad visual **ya son compartidos por construcción**:
- **Fuentes:** Quicksand se carga con `@expo-google-fonts/quicksand` + `useFonts`
  en `app/_layout.tsx`. `expo-font` inyecta el `@font-face` en web, así que las
  clases `font-quicksand-*` rinden igual en móvil y navegador.
- **Paleta:** es hex puro (esmeralda `#10B981` y compañía) en `src/theme/colors.ts`
  y `tailwind.config.js`. NativeWind la compila a CSS en web → color idéntico.

La estrategia es: **un repo, un código, ramas condicionales por plataforma**
(`Platform.OS === "web"`, patrón ya usado en 6 pantallas) más la capa PWA
(manifest + service worker) que Expo no genera sola.

### 6.1 Consistencia visual y funcional (requisito duro)

La PWA debe verse y funcionar **igual** que la app móvil. Cómo se blinda:

- **Paleta — una sola fuente de verdad.** Hoy los colores están duplicados en
  `src/theme/colors.ts` (`COLORS`, para estilos inline) y en `tailwind.config.js`
  (tokens `bg`/`accent`/`ink`…, para `className`). Son los mismos hex, pero para
  evitar *drift* conviene **importar `COLORS` dentro de `tailwind.config.js`** y
  derivar los tokens de ahí. Prohibido introducir colores "solo-web".
- **Fuentes — mismas familias Quicksand.** Mantener `font-quicksand`,
  `font-quicksand-medium/semibold/bold`. Verificar en web que el `@font-face` se
  inyecta y que **no** se cuela una fuente de sistema como fallback (inspeccionar
  el `font-family` computado).
- **Funciones — paridad por reuso, no por reescritura.** Las mismas rutas de Expo
  Router sirven web; los servicios de Supabase (`feed`, `publicaciones`,
  `moderacion`, `reportes`, `bloqueos`, `misPublicaciones`) son agnósticos de
  plataforma; `expo-image-picker` cae a `<input type=file>` en web. La paridad sale
  casi gratis **mientras** se mantenga UN solo árbol de componentes y se evite
  forkear con `*.web.tsx` por estética (eso rompería la consistencia).

## 7. Arquitectura objetivo

```
app/
  _layout.tsx             # saltar/acortar el splash animado en web (Platform.OS)
  +html.tsx               # NUEVO: <head> PWA (manifest, theme-color) + registro del SW
  (tabs)/index.tsx        # feed responsive (grid 1 col móvil → 2–4 escritorio)
  ...                     # el resto de rutas sirven móvil y web sin cambios
src/
  lib/
    sessionStorage.ts     # NUEVO: SecureStore (nativo) | AsyncStorage (web)  ← seg. 2.2
    supabase.ts           # detectSessionInUrl: Platform.OS === 'web' + auth.storage
  theme/colors.ts         # única fuente de verdad de la paleta (compartida)
public/                   # NUEVO: Expo copia esto tal cual a la raíz del sitio web
  manifest.json
  sw.js
  icons/{icon-192,icon-512,maskable-512}.png   # generados desde assets/icon1.png
app.json                  # web.output: "static" + metadatos PWA
```

Regla de oro: **el código compartido es ~90%**; solo se aísla lo que un entorno no
soporta. Los `*.web.tsx` se reservan para módulos nativos ausentes en web, **no**
para variantes estéticas.

## 8. Qué funciona, qué hay que adaptar y qué se rompe en web

| Módulo | En web | Acción |
|---|---|---|
| Expo Router, React Query, Zod, NativeWind | ✅ funciona | nada |
| `expo-image`, `expo-linear-gradient`, `expo-blur` | ✅ traen build web propio | nada (el blur del tab bar queda más sutil) |
| Quicksand (`@expo-google-fonts` + `expo-font`) | ✅ `@font-face` | verificar que no haya fallback de sistema |
| Reanimated 4 (splash, hero) | ✅ funciona | revisar residuos de `transform` (gotcha #8) |
| `expo-image-picker` + `expo-image-manipulator` | ✅ `<input type=file>` | **probar** el flujo de 3 fotos (base64) |
| WhatsApp `wa.me`, `Share`, `Linking` | ✅ abren en navegador | nada |
| `react-native-markdown-display` (docs) | ⚠️ carga `.md` vía `fetch` | verificar que `asset.localUri ?? asset.uri` resuelve en web |
| **`expo-secure-store`** | ❌ no existe en web | adaptador condicional (§9.5) |
| **`detectSessionInUrl`** | debe ser **`true`** en web para OAuth | `Platform.OS === 'web'` |
| **Splash animado ~3.5s** | ⚠️ retrasa el *first paint* / SEO | **saltar o acortar** en web (§9.6) |
| **`expo-notifications`** | API distinta (Web Push) | guard por plataforma (futuro) |
| **Layout** | pensado para ancho de móvil | **responsive** (§10) |

## 9. Pasos para habilitar la PWA

### 9.1 Salida web estática + metadatos (`app.json`)
El bloque `web` hoy solo tiene `favicon`. Ampliarlo:
```json
"web": {
  "favicon": "./assets/favicon.png",
  "output": "static",
  "bundler": "metro",
  "name": "Milink",
  "themeColor": "#10B981",
  "backgroundColor": "#0F1115"
}
```
`output: "static"` hace que Expo Router genere rutas HTML reales en `/dist` (mejor
para SEO que un SPA de un solo `index.html`).

### 9.2 Generar el build web
```bash
npx expo export -p web      # genera /dist con HTML/CSS/JS estáticos
npx expo start --web        # desarrollo local (ya lo usas con MCP)
```

### 9.3 Carpeta `public/` + manifest (`public/manifest.json`)
Expo copia `public/` tal cual a la raíz del sitio. Manifest con branding Milink:
```json
{
  "name": "Milink",
  "short_name": "Milink",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F1115",
  "theme_color": "#10B981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
- `theme_color` esmeralda = color de marca (barra del navegador / app instalada).
- `background_color` oscuro `#0F1115` **iguala el fondo del splash nativo** para que
  el arranque se sienta igual que en el móvil.
- Iconos generados desde `assets/icon1.png` (1024×1024) → `public/icons/`.

### 9.4 `<head>` PWA + registro del service worker (`app/+html.tsx`)
Expo Router permite un HTML root en `app/+html.tsx` que envuelve cada página del
export web. Ahí van los metadatos PWA y el registro del SW (ejemplo ilustrativo):
```tsx
<meta name="theme-color" content="#10B981" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<script dangerouslySetInnerHTML={{ __html:
  `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`
}} />
```

### 9.5 Service worker (`public/sw.js` — offline + instalable)
Expo **no** genera SW. Un SW mínimo *cache-first* (patrón de la skill
`progressive-web-app`): precache de la *app shell* + runtime caching de las imágenes
de Supabase. El SW + el manifest + HTTPS disparan el prompt "Instalar app" y dan
offline básico. Si crece, migrar a **Workbox** (`workbox-cli`).

### 9.6 Storage de sesión + OAuth condicionales
- **`src/lib/sessionStorage.ts` (nuevo):** SecureStore en nativo (con *chunking*
  para tokens >2KB), AsyncStorage en web. Cablearlo en `supabase.ts` como
  `auth.storage`. **Esto también cierra el hallazgo de seguridad 2.2.**
- En `supabase.ts`: `detectSessionInUrl: Platform.OS === "web"` para que el callback
  de OAuth funcione en el navegador (en nativo va por deep link).
- **Splash en web:** saltar o acortar `AnimatedSplashScreen` cuando
  `Platform.OS === "web"` en `app/_layout.tsx` (un overlay de 3.5s penaliza el
  *first paint* y el SEO en navegador).

## 10. Responsive: de móvil a escritorio

Las pantallas asumen ancho de teléfono. Para que la web no se vea "un móvil
estirado", **sin** forkear componentes (se mantiene el mismo árbol):
- Contenedor central con **ancho máximo** (`max-w-screen-md/lg`) y márgenes
  automáticos en pantallas grandes.
- **Grids adaptativos**: el feed mixto de `app/(tabs)/index.tsx` y las cards
  `VehicleCard`/`PropiedadCard` a 1 columna en móvil y 2–4 en escritorio
  (breakpoints NativeWind `sm:`/`md:`/`lg:` o `useWindowDimensions()`).
- La tab bar inferior (`CustomTabBar`, BlurView) funciona en móvil web y se mantiene
  por consistencia; una barra superior/lateral de escritorio es **pulido opcional**
  (vía `*.web.tsx`) y queda fuera de este alcance si compromete la paridad visual.
- Probar foco/teclado y estados hover (en web sí existen).

## 11. Despliegue de la PWA

- Hospeda `/dist` en **Vercel, Netlify o Cloudflare Pages** (todos sirven
  estáticos con HTTPS y CDN gratis). Cloudflare Pages o Vercel son ideales.
- Configura **redirects SPA** (todo a `index.html`) si usas `output: "single"`;
  con `"static"` Expo genera rutas reales (mejor para SEO).
- Esta misma web te da gratis: la **URL de Política de Privacidad** y la **URL de
  eliminación de cuenta** que Play exige en la Fase 1. 🎯
- CI: una GitHub Action que en cada push a `main` corra `expo export -p web` y
  despliegue.

## 12. Orden sugerido para la Fase 2

1. Activar `web.output: "static"` y lograr que `expo export -p web` compile sin
   errores (arreglar imports nativos no guardados).
2. Adaptador de storage condicional (sirve también para seguridad 2.2).
3. Responsive del feed y pantallas principales.
4. Manifest + íconos + service worker → PWA instalable.
5. Desplegar en Vercel/Cloudflare.
6. Reusar esa web para las URLs legales/eliminación de cuenta de Play.

---

## 13. Roadmap priorizado (qué hacer primero)

**🔴 Antes de enviar a Play (bloqueante):**
1. URL web pública de eliminación de cuenta (1.1).
2. Política de Privacidad en URL pública (1.3).
3. Data safety + clasificación + assets de ficha (1.4, 1.9).

**🟠 Muy recomendable antes o justo después de lanzar:**
4. Proteger PII de teléfono/nombre (2.1).
5. SecureStore para la sesión (2.2).
6. Activar confirmación de correo + recuperar contraseña + CAPTCHA (2.5).
7. Error Boundary + Sentry (3).

**🟡 Mejora continua:**
8. Limpiar dependencias muertas, thumbnails, tests, `.gitignore` de `.claude/`.
9. Reseñas (UI), push, chat in-app.
10. **Fase 2 (PWA)** — independiente y se puede arrancar en paralelo.

---

*Documento generado tras revisar el código real del repositorio. Las afirmaciones
sobre políticas de Google Play y niveles de API se verificaron con la documentación
oficial vigente a junio de 2026 (ver fuentes en la respuesta del chat).*
