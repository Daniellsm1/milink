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
`sb_publishable_` correcta (no se filtra `service_role`), operaciones sensibles
de admin detrás de RPCs `SECURITY DEFINER` gateadas por `es_admin()`, y sesión
cifrada con SecureStore (nativo) + AsyncStorage (web). La base de seguridad del
backend y del cliente es sólida.

Lo que **bloquea la publicación hoy** no es la calidad del código, son **requisitos
de política de Google Play** que el proyecto aún no cumple:

1. 🔴 **Falta URL web pública de eliminación de cuenta.** El botón in-app ya está
   implementado; Google exige también una URL accesible sin la app instalada.
2. 🔴 **Sin Política de Privacidad publicada en una URL pública** (la tienes
   in-app pero Play exige URL accesible desde la ficha y la app).
3. 🟠 **PII expuesta a anónimos:** teléfono y nombre del propietario son legibles
   sin login → cosechables por scrapers (riesgo Habeas Data, Ley 1581/2012).

El resto son mejoras de calidad, rendimiento y futuro. Abajo está todo detallado
y, al final, el **roadmap priorizado** y el **§11 despliegue de la PWA** (único
paso de la Fase 2 aún pendiente).

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
  §11, o un Google Site / Notion público) con instrucciones y un correo de
  contacto para solicitar borrado.

### 1.3 🔴 Política de Privacidad en URL pública — *bloqueante*

Tienes el documento in-app (`app/docs/politica-privacidad.tsx`) pero Play exige
una **URL accesible públicamente** (sin login) tanto en la ficha de la tienda
como enlazada dentro de la app. Hospédala (el despliegue de §11 la sirve
automáticamente) y enlázala desde la ficha y el perfil.

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
- mostrar el teléfono solo al pulsar "Contactar" (lazy + auth gate), no en el
  payload inicial.
- Mínimo: documentar este tratamiento en la Política de Privacidad y obtener
  consentimiento explícito al publicar (checkbox "acepto que mi teléfono será
  visible para contactarme").

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

- El correo del admin (`daniel200430@hotmail.com`) está hardcodeado en
  `admins.ts` y en `0003_admin_policies.sql`. No es un secreto crítico (el gate
  real es server-side) pero a futuro conviene una **tabla `roles`** o un *custom
  claim* en el JWT en vez de listas en dos sitios que hay que mantener
  sincronizadas.

> **Nota positiva:** la anon key es del tipo `sb_publishable_` (diseñada para ir
> en el cliente), no hay `service_role` en el bundle, la autoridad real vive en
> RLS + RPCs `SECURITY DEFINER`, y la sesión ya está cifrada con SecureStore
> (nativo, chunking ~1.8KB) / AsyncStorage (web). 👍

---

## 3. Rendimiento y calidad de código

- 🟡 **Dependencias muertas:** `react-hook-form`, `expo-notifications` y
  `expo-file-system` no se importan en `app/`/`src/` (verificado por grep).
  Pesan en el bundle y confunden. Decide: **úsalas o quítalas**.
  (`expo-notifications` consérvala solo si vas a implementar push pronto.
  `expo-secure-store` **ya se usa** — cierra el hallazgo 2.2.)
- 🟡 **Sin Error Boundary global:** un error de render tumba toda la app. Añade un
  `ErrorBoundary` en `app/_layout.tsx` con UI de fallback amable.
- 🟡 **Sin reporte de crashes:** integra **Sentry** (`@sentry/react-native`,
  plugin de Expo) para ver errores en producción. Imprescindible post-lanzamiento.
- 🟡 **Miniaturas del feed:** el grid carga las `publicUrl` completas (1280px).
  Usa la **transformación de imágenes de Supabase** (`?width=400`) o genera
  thumbnails para el grid; `expo-image` ya cachea, pero bajarás datos y memoria.
- 🟡 **Sin tests:** no hay ninguna prueba. Mínimo: smoke tests de los servicios
  (`feed`, `publicaciones`, `validation`) con Jest + `@testing-library/react-native`,
  y validar los esquemas Zod.
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

### Paso 1 — Identidad (ya lista)
`app.json` tiene `android.package: "com.danielkmm.milink"` y `name: "Milink"`.
Están correctos — no cambiar.

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
- **Política de Privacidad** (URL del paso 1.3 — servida por la PWA de §11).
- **Data safety** (sección 1.4).
- **Clasificación de contenido** (IARC).
- **Público objetivo y contenido** (mayores de edad).
- **Ficha principal**: ícono 512×512, gráfico de funciones 1024×500, capturas,
  descripción corta y larga.
- **URL de eliminación de cuenta** (paso 1.1 — servida por la PWA de §11).

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

# FASE 2 — PWA instalable

> ✅ **§6–§10 y §12 completados** (junio 2026). La PWA comparte el mismo código
> que la app móvil: mismas fuentes Quicksand, misma paleta esmeralda `#10B981`,
> mismas rutas y funciones. En dispositivos móviles (iPhone ~390px) se ve
> idéntica a la app nativa. En escritorio (≥768px) aplica ancho máximo adaptativo
> por pantalla via `useWebMaxWidth()` / `useCardColumns()` en `src/lib/responsive.ts`.
> El único paso pendiente es el despliegue (§11).

## 11. Despliegue de la PWA

El `dist/` y `public/` ya están listos para servir desde un CDN estático.

- Hospeda `/dist` en **Vercel, Netlify o Cloudflare Pages** (todos sirven
  estáticos con HTTPS y CDN gratis). Cloudflare Pages o Vercel son ideales.
- Con `web.output: "static"` (ya configurado en `app.json`) Expo genera rutas
  reales — no hace falta configurar redirects SPA.
- Esta misma web sirve gratis: la **URL de Política de Privacidad** y la
  **URL de eliminación de cuenta** que Play exige en los ítems 1.1 y 1.3. 🎯
- CI opcional: una GitHub Action que en cada push a `main` corra
  `npx expo export -p web` y despliegue a Vercel/Cloudflare.

---

## 13. Roadmap priorizado (qué hacer primero)

**🔴 Antes de enviar a Play (bloqueante):**
1. Desplegar la PWA (§11) → da las URLs públicas para 1.1 y 1.3.
2. Completar Data safety + clasificación IARC + assets de ficha (1.4, 1.9).

**🟠 Muy recomendable antes o justo después de lanzar:**
3. Proteger PII de teléfono/nombre (2.1).
4. Activar confirmación de correo + recuperar contraseña + CAPTCHA (2.5).
5. Error Boundary + Sentry (3).

**🟡 Mejora continua:**
6. Limpiar dependencias muertas (react-hook-form, expo-file-system, expo-notifications si no se usan), thumbnails, tests, `.gitignore` de `.claude/`.
7. RPC `moderar_publicacion` para restringir UPDATE del admin (2.3).
8. Limpiar fotos al rechazar publicación (2.4).
9. Reseñas (UI), push, chat in-app (§5).

---

*Documento actualizado tras revisar el código real del repositorio. Las afirmaciones
sobre políticas de Google Play y niveles de API se verificaron con la documentación
oficial vigente a junio de 2026.*
