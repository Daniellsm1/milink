# Pruebas reales contra Supabase

Este documento te lleva paso a paso por una prueba end-to-end real del flujo
de publicación, moderación y feed contra tu base de datos en Supabase.

## 0. Preparación (una sola vez)

### 0.1 Aplicar la migración 0003 (admin policies)
1. Abre el SQL Editor de tu Supabase.
2. Crea una nueva query y pega TODO el contenido de
   `supabase/migrations/0003_admin_policies.sql`.
3. Run.

Esto agrega la función `public.es_admin()` y las policies para que el correo
`daniel200430@hotmail.com` pueda aprobar/rechazar publicaciones.

> Si más adelante quieres agregar otro admin: edita el array dentro de
> `public.es_admin()` en SQL y también `ADMIN_EMAILS` en `src/lib/admins.ts`.
> Ambas listas deben coincidir.

### 0.2 Desactivar "Confirm email" (para acelerar pruebas)
Dashboard → **Authentication → Sign In / Providers → Email** → busca el toggle
**"Confirm email"** y déjalo OFF. Guarda.

### 0.3 (Solo Web) Levantar el preview
- `npx expo start --web --port 8095` o usa el preview MCP del proyecto.

### 0.4 (Solo Celular) Asegúrate de tener el dev build instalado
Si nunca lo hiciste o si agregamos paquetes nativos nuevos:
`eas build --profile development --platform android`.

> **Importante:** las claves de Supabase se incrustan en el build a partir de
> `.env`. Si cambias `EXPO_PUBLIC_SUPABASE_URL` o `EXPO_PUBLIC_SUPABASE_ANON_KEY`
> después de un build, tienes que rebuildar.

## 1. Caso de prueba: publicación → moderación → feed

### Paso 1. Registrarse / iniciar sesión
- Abre la app → tab **Perfil** → "Iniciar sesión / Registrarse" → "Regístrate".
- Crea cuenta con `daniel200430@hotmail.com` (o inicia sesión si ya existe).

✅ **Esperado:** quedas con sesión activa. En Perfil aparecen tus datos,
botones "Publicar un bien", **"Panel de moderación"** (solo si tu correo es
admin) y "Cerrar sesión".

### Paso 2. Publicar un vehículo
- Tab **Publicar** → lee los términos → marca los 3 checkboxes →
  "Continuar al formulario".
- Llena todos los campos del formulario (selecciona "Vehículo").
- Carga **exactamente 3 fotos** desde tu galería / filesystem.
- "Guardar publicación".

✅ **Esperado:**
- Modal verde con "Solicitud recibida" y el mensaje de verificación.
- Botón "Entendido" → vuelve a Explorar.
- En Supabase → Table Editor → **vehiculos** debería aparecer 1 fila con tu
  `usuario_id`, todos los campos, `status: pending_approval`, y `imagenes`
  con 3 URLs públicas del bucket `publicaciones`.

⚠️ **No debe aparecer en el feed público de Explorar todavía** porque está
pendiente de aprobación.

### Paso 3. Verificar las fotos en Storage
- Dashboard → **Storage → publicaciones** → entra a la carpeta con tu UUID →
  `vehiculos/` → deberías ver 3 archivos `.jpg`.
- Abre una en una pestaña nueva → debería renderizar tu foto.

✅ **Esperado:** las 3 imágenes son accesibles vía URL pública.

### Paso 4. Aprobar desde el panel de admin
- Tab **Perfil** → botón **"Panel de moderación"**.
- Verás tu publicación pendiente con foto, título, ciudad y precio.
- Botón **Aprobar**.

✅ **Esperado:**
- La fila desaparece del panel.
- En Supabase, el `status` de esa fila cambia a `approved`.

### Paso 5. Verificar en el feed
- Vuelve al tab **Explorar**.
- Tira de la lista hacia abajo para refrescar (o cierra y abre la app).

✅ **Esperado:** tu publicación aprobada ahora aparece en la grilla
"Disponibles para ti", **antes** de los datos mock. Toca la tarjeta → entra al
detalle con el carrusel mostrando las 3 fotos reales, la ficha técnica
generada desde la DB, el botón WhatsApp y el modal de verificación.

## 2. Casos extras

### Rechazar
- Repite el flujo y desde el panel pulsa **Rechazar**. El `status` queda en
  `rejected`. La publicación no aparece en el feed ni en el panel.

### Vista del dueño
- Como dueño autenticado, tu publicación pendiente debería ser visible en una
  futura sección "Mis publicaciones" del perfil. Ya está habilitado a nivel
  RLS (`select_aprobado_o_propio`).

### Probar como usuario no-admin
- Cierra sesión, crea otra cuenta cualquiera.
- Ve a `/admin` manualmente → la app te redirige a Explorar (gate del frontend).
- Si intentaras hacer un UPDATE de `status` desde el cliente → la policy de RLS
  lo bloquea (gate del backend).

## 3. Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| "Error al subir la imagen N" | Bucket `publicaciones` no existe o usuario no autenticado | Verifica que la migración 0002 esté aplicada y que tengas sesión activa |
| "Debes iniciar sesión para publicar" | No hay sesión | Login primero |
| Modal de verificación pero la fila no aparece en Table Editor | RLS bloqueó el insert | Confirma que `auth.uid()` coincide con `usuario_id` (lo hace el servicio) |
| Panel admin redirige a Explorar | Tu correo no está en `ADMIN_EMAILS` | Edita `src/lib/admins.ts` y la función `es_admin()` en SQL |
| Aprobaste pero no aparece en el feed | Cache de React Query | Pull-to-refresh en Explorar o espera 30s (staleTime) |
| Las imágenes salen rotas en el feed | URL pública mal armada | Verifica el bucket marcado como Public y que las policies de Storage existan |
| Registro pide confirmación de correo | "Confirm email" sigue ON | Apágalo en Authentication → Sign In / Providers → Email |
