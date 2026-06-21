# Milink — Plan de Publicación en Play Store y Estrategia PWA

> Hoja de ruta viva. Solo queda lo **pendiente**; lo resuelto está condensado en
> el §0. Severidad: 🔴 bloqueante · 🟠 importante · 🟡 mejora.
> Última revisión: junio 2026 (auditoría full-stack sobre el código real).

---

## 0. Lo que YA está resuelto (no tocar)

**Seguridad / backend**
- ✅ **PII del propietario protegida** (migración 0008): `telefono_contacto` y
  `nombre_propietario` ocultos a `anon` (REVOKE column-level); contacto vía RPC
  `obtener_contacto_publicacion` solo para `authenticated` + checkbox de
  consentimiento al publicar/editar.
- ✅ **Moderación por RPC** (migración 0009): `moderar_publicacion` SECURITY
  DEFINER; eliminadas las policies UPDATE amplias del admin. Motivo de rechazo.
- ✅ **Fotos de rechazadas eliminadas** (migración 0010): RPC limpia `imagenes`
  + policy DELETE admin en storage + borrado best-effort desde el cliente.
- ✅ **Cuota anti-spam** (migración 0011): trigger que bloquea > 5 publicaciones
  `pending_approval` por usuario.
- ✅ **Recuperar contraseña**: pantallas `auth/forgot-password` y
  `auth/reset-password` + deep link `scheme: "milink"` + `resetPasswordForEmail`.
- ✅ **Refresh token inválido manejado**: `getSession()` con `signOut()` limpio
  (evita el loop de `AuthApiError` tras pausar/reanudar el proyecto).
- ✅ **Búsqueda saneada**: `buscarMixto` quita `,()%` antes del `.or()` de
  PostgREST (sin inyección de filtros).
- ✅ **UGC moderable** (migración 0007): reportar publicación + bloquear usuario
  cableados en el detalle; RPC `eliminar_mi_cuenta`. Cumple requisito UGC de Play.
- ✅ Sesión cifrada (SecureStore chunked nativo / AsyncStorage web), anon key
  `sb_publishable_`, sin `service_role` en el bundle.

**PWA (Fase 2, §6–§10 + §12)**
- ✅ Export estático (`web.output: "static"`), `+html.tsx` con meta PWA + SW,
  `manifest.json`, iconos `public/icons/*`, SW (cache-first imágenes, network
  para auth/rest/realtime), responsive `useWebMaxWidth`/`useCardColumns`.
- ✅ **Botón "Instalar" PWA** (solo web): `usePwaInstall` + `InstallPwaButton`
  (prompt nativo en Android/escritorio, instrucciones en iOS, una sola vez).

**Ficha Play Store**
- ✅ **Data safety (§1.4)**: guía de declaración lista (correo, nombre, teléfono,
  fotos, ubicación aproximada, contenido; cifrado en tránsito; eliminación de
  cuenta). Es un formulario manual en Play Console — pendiente solo de pegarlo
  cuando exista la URL de eliminación (depende del deploy §11).
- ✅ **Target SDK (§1.5)**: Expo 54 / RN 0.81 apunta a API 35 → cumple hoy.

> **Atención migraciones:** 0001–0009 aplicadas en `mucpwtieilxgasxagujo`.
> **0010 y 0011 creadas pero pendientes de pegar en el SQL Editor.**

---

# PENDIENTE

## 1. 🔴 Bloqueantes de Play (todos dependen del deploy de la PWA, §11)

### 1.1 URL pública de eliminación de cuenta
El botón in-app ya existe (`profile.tsx` + RPC `eliminar_mi_cuenta`). Falta la
**URL web pública** con instrucciones + correo de contacto. La sirve la PWA (§11).

### 1.3 Política de Privacidad en URL pública
Existe in-app (`app/docs/politica-privacidad.tsx`). Play exige **URL accesible
sin login**, enlazada en la ficha y en la app. La sirve la PWA (§11).

### 1.9 Assets de ficha (manual, sin código)
Clasificación IARC, ícono 512×512, gráfico de funciones 1024×500, 2–8 capturas
por dispositivo, descripción corta y larga, categoría.

---

## 2. 🟠 Seguridad / robustez (antes o justo después de lanzar)

### 2.5 Confirmación de correo + CAPTCHA *(manual del usuario en el deploy)*
Activar confirmación de correo en Supabase Auth (hoy OFF, gotcha #7) y considerar
hCaptcha. **El usuario lo hará manualmente al desplegar.** Cuando se active la
confirmación, configurar también en Supabase **Auth → URL Configuration →
Redirect URLs**: `https://<dominio>/auth/reset-password`,
`milink://auth/reset-password` (sin esto, el enlace de recuperación no funciona).

### 2.6 Admin hardcodeado en dos sitios
`daniel200430@hotmail.com` en `src/lib/admins.ts` **y** en
`0003_admin_policies.sql`. A futuro: tabla `roles` o custom claim en el JWT en
vez de mantener dos listas sincronizadas. (No es secreto; el gate real es RLS.)

### 2.x Error Boundary global *(nuevo — alta relación valor/esfuerzo)*
Un error de render tumba toda la app. Añadir un `ErrorBoundary` en
`app/_layout.tsx` con UI de fallback amable. Es lo más barato y de mayor impacto.

### 2.x Reporte de crashes (Sentry)
Integrar `@sentry/react-native` (plugin Expo). Imprescindible post-lanzamiento
para ver errores reales en producción.

---

## 3. 🟡 Calidad / mantenimiento

- **Higiene del repo `.claude/`** *(nuevo)*: hay **~53 MB / 3591 archivos** de
  skills de Claude trackeados en git. Ya se añadió `.claude/` a `.gitignore`;
  falta sacarlos del índice una vez: `git rm -r --cached .claude` y commit.
- **Dependencias muertas** *(confirmado por grep en `app/` y `src/`)*:
  `react-hook-form`, `expo-notifications`, `expo-file-system` no se importan en
  ningún lado. Quitarlas (conservar `expo-notifications` solo si se hará push
  pronto). Reduce bundle y confusión.
- **Miniaturas del feed**: el grid baja las `publicUrl` completas (~1280px). Usar
  la transformación de Supabase (`?width=400`) para el grid. `expo-image` ya
  cachea; esto baja datos y memoria.
- **Sin tests**: mínimo smoke tests de `feed`, `publicaciones`, `validation` con
  Jest + `@testing-library/react-native` y validación de los esquemas Zod.

### PWA — afinaciones del Service Worker *(nuevo)*
- **Fallback offline impreciso**: en `public/sw.js` toda navegación se cachea bajo
  la clave `OFFLINE_URL` (`/`), así que el fallback offline puede mostrar la
  última ruta visitada en vez de la home. Cachear bajo `request.url` o solo
  cuando la navegación sea realmente a `/`.
- **Versionado manual del SW**: `VERSION = "milink-v1"` no se autobumpea. Al
  desplegar conviene subir la versión (o automatizarlo) para invalidar el shell
  precacheado; los bundles con hash ya se renuevan por SWR.

---

## 4. Cómo compilar y publicar en Google Play — paso a paso (referencia)

> Usa **EAS Build** (nube de Expo); no necesitas Android Studio. `app.json` ya
> tiene `android.package: "com.danielkmm.milink"`. `eas.json` ya maneja
> `versionCode` (`autoIncrement` + `appVersionSource: "remote"`).

0. **Una sola vez:** cuenta Play Console (USD 25, posible verificación de
   identidad + pruebas cerradas ~12–20 testers/14 días para cuentas personales
   nuevas). Cuenta Expo + `npm i -g eas-cli && eas login`.
1. **Variables en EAS** (las del `.env`, son `EXPO_PUBLIC_*`):
   `eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "..." --environment production`
   (y la anon key). EAS gestiona el keystore — guárdalo bien.
2. **Build:** `eas build --profile production --platform android` → genera `.aab`.
3. **Probar:** `eas build --profile preview --platform android` (APK) o canal de
   pruebas internas en Play Console.
4. **Crear app en Play Console** y completar fichas: Política de Privacidad
   (§1.3), Data safety (§0/§1.4), IARC, público objetivo (mayores de edad),
   ícono/gráfico/capturas (§1.9), URL eliminación de cuenta (§1.1).
5. **Subir binario:** manual (arrastra `.aab`) o `eas submit`.
6. **Pruebas cerradas → Producción.** Primera revisión: horas a varios días.
7. **Post-lanzamiento:** vigila Android vitals; planifica **API 36 (Android 16)**
   antes del **31-ago-2026** (subir a Expo SDK 55+) si publicas cerca de esa fecha.

---

## 5. Futuro (post-lanzamiento)

- **Notificaciones push**: avisar al dueño cuando se aprueba/rechaza su
  publicación (requiere `expo-notifications` + plugin en `app.json` + tabla de
  tokens). Si no se hace pronto, quitar la dep (ver §3).
- **Chat in-app** en vez de saltar a WhatsApp: más seguro, moderable y reduce la
  exposición de teléfonos.
- **Reseñas (UI)**: la tabla `resenas` ya existe en el esquema.

---

## 11. 🔴 Despliegue de la PWA (desbloquea 1.1 y 1.3)

`dist/` y `public/` listos para CDN estático.
- Hospedar en **Vercel / Cloudflare Pages / Netlify** (HTTPS + CDN gratis).
- Con `web.output: "static"` Expo genera rutas reales — sin redirects SPA.
- Esta misma web sirve **gratis** la URL de Política de Privacidad (1.3) y la de
  eliminación de cuenta (1.1). 🎯
- Tras desplegar: registrar las Redirect URLs de recuperación de contraseña en
  Supabase (ver §2.5).
- CI opcional: GitHub Action que en cada push a `main` corra
  `npx expo export -p web` y despliegue.

---

## Orden sugerido

1. **Desplegar PWA (§11)** → da las URLs y desbloquea 1.1 y 1.3.
2. **Pegar migraciones 0010 y 0011** en el SQL Editor.
3. Completar ficha de Play: Data safety + IARC + assets (1.9).
4. Activar confirmación de correo + Redirect URLs + (CAPTCHA) (2.5).
5. Error Boundary + Sentry (2.x).
6. Higiene: `git rm -r --cached .claude`, quitar deps muertas, thumbnails, tests.

---

*Las afirmaciones sobre políticas de Google Play y niveles de API se verificaron
con la documentación oficial vigente a junio de 2026.*
