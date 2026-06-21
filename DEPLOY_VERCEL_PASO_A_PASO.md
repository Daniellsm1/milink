# Desplegar la PWA de Milink en Vercel — Guía paso a paso

> Para alguien que **nunca** lo ha hecho. Vamos de cero a tener tu app en una URL
> pública tipo `https://milink.vercel.app`, con **despliegue automático**: cada vez
> que subas cambios a GitHub, Vercel reconstruye y publica solo.
>
> **El plan en una frase:** subes tu código a GitHub → conectas GitHub con Vercel
> → Vercel compila la web y la publica → cargas las claves de Supabase → listo.
>
> **Tiempo estimado:** 20–30 minutos la primera vez.

---

## ✅ Antes de empezar — lo que ya está listo

No tienes que tocar el código. Ya quedó preparado:

- `vercel.json` creado en la raíz (le dice a Vercel cómo compilar: `expo export -p web`,
  carpeta de salida `dist`, y el `rewrite` para que las rutas dinámicas como
  `/vehicle/123` funcionen).
- `app.json` con `web.output: "static"` (genera HTML real por pantalla).
- `public/` con `manifest.json`, `sw.js` e iconos → instalable como PWA.
- `.gitignore` ya excluye lo que NO debe subir: `node_modules/`, `dist/`, `.env`
  y `.claude/`.
- **Verificado:** el build web compila y genera los HTML correctamente.

> ⚠️ **Lo ÚNICO crítico que no viaja con el código:** las claves de Supabase
> (están en `.env`, que está gitignored a propósito). Tendrás que pegarlas a mano
> en Vercel (Paso 3.4). Si lo olvidas, la web carga en blanco. Es el error #1 de
> todos los que despliegan por primera vez.

---

## Requisitos (cuentas gratuitas)

1. **Cuenta de GitHub** → https://github.com/signup (si ya tienes, úsala).
2. **Cuenta de Vercel** → https://vercel.com/signup → elige **"Continue with
   GitHub"** (así quedan conectadas desde el inicio, te ahorra pasos).
3. **Git instalado** en tu PC. Para comprobar, abre la terminal y escribe:
   ```bash
   git --version
   ```
   Si no aparece una versión, instálalo desde https://git-scm.com/download/win

---

## PASO 1 — Dejar el código commiteado

Abre una terminal **en la carpeta del proyecto**
(`C:\Users\danie\Desktop\develop\Milink\milinkApp`).

> Tip: en el Explorador de Windows, entra a la carpeta, haz clic en la barra de
> ruta, escribe `cmd` y Enter — abre la terminal ya ubicada ahí.

1. Mira qué hay sin guardar:
   ```bash
   git status
   ```
2. Asegúrate de que `.claude/` ya no se trackea (debe salir de la lista). Si aún
   apareciera, sácalo una vez:
   ```bash
   git rm -r --cached .claude
   ```
3. Guarda todo en un commit:
   ```bash
   git add -A
   git commit -m "configuracionDespliegueVercel"
   ```
   (Si dice "nothing to commit", perfecto, ya estaba todo guardado.)

> **Comprueba que `.env` NO está en la lista de `git status`.** Nunca debe subir.
> Si por error aparece, detente y avísame.

---

## PASO 2 — Subir el proyecto a GitHub

### 2.1 Crear el repositorio (vacío) en GitHub
1. Entra a https://github.com/new
2. **Repository name:** `milink` (o el que quieras).
3. **Visibilidad:** Private (recomendado) o Public, da igual para Vercel.
4. **NO** marques "Add a README", "Add .gitignore" ni "license" — déjalo vacío
   (ya tienes esos archivos localmente).
5. Clic en **Create repository**.

### 2.2 Conectar tu carpeta local con ese repo
GitHub te mostrará una URL tipo `https://github.com/TU_USUARIO/milink.git`.
En la terminal del proyecto (ya estás en la rama `main`):

```bash
git remote add origin https://github.com/TU_USUARIO/milink.git
git push -u origin main
```

- Te pedirá iniciar sesión en GitHub la primera vez (se abre una ventana del
  navegador; autoriza y listo).
- Si ya tenías un `origin` configurado, usa
  `git remote set-url origin https://github.com/TU_USUARIO/milink.git` en vez del
  `git remote add`.

Recarga la página de GitHub: ya deberías ver tus archivos. **Confirma que NO
aparezcan `node_modules/`, `dist/`, `.env` ni `.claude/`.** ✅

---

## PASO 3 — Importar y desplegar en Vercel

### 3.1 Importar el repo
1. Entra a https://vercel.com/new (logueado con GitHub).
2. La primera vez, Vercel pide permiso para acceder a tus repos: dáselo (puedes
   limitarlo solo al repo `milink`).
3. Busca `milink` en la lista y clic en **Import**.

### 3.2 Configuración del proyecto
Vercel **lee tu `vercel.json` automáticamente**, así que casi todo viene
pre-rellenado. Verifica que quede así (si algún campo está vacío, complétalo):

| Campo | Valor |
|---|---|
| **Framework Preset** | Other (o "No Framework") |
| **Build Command** | `expo export -p web` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (por defecto) |

> No cambies "Root Directory": déjalo en la raíz (`./`).

### 3.3 ⛔ NO le des "Deploy" todavía — primero las variables

### 3.4 Variables de entorno (¡el paso que todos olvidan!)
En la misma pantalla, despliega **Environment Variables** y agrega estas dos
(las mismas de tu archivo `.env` local):

| Name | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://mucpwtieilxgasxagujo.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | *(copia el valor `sb_publishable_...` de tu `.env`)* |

- Escribe el `Name` exacto (respeta mayúsculas y el prefijo `EXPO_PUBLIC_`).
- Pega el valor y clic en **Add** por cada una.
- Déjalas para todos los entornos (Production, Preview, Development).

> Estas claves son **públicas por diseño** (van dentro del bundle del navegador);
> la seguridad real está en las reglas RLS de Supabase. Por eso no hay problema en
> pegarlas aquí.

### 3.5 Deploy
Clic en **Deploy**. Vercel hará: `npm install` (en Linux, con los binarios
correctos) → `expo export -p web` → publicar la carpeta `dist`. Tarda 2–5 min.

Al terminar verás confeti 🎉 y una URL tipo **`https://milink.vercel.app`**.
Ábrela: deberías ver tu app. En Chrome de escritorio/Android aparecerá el botón
**Instalar**; en iPhone, "Compartir → Agregar a inicio".

---

## PASO 4 — Después del primer deploy (importante)

### 4.1 Conectar la URL con Supabase (recuperar contraseña / OAuth)
Para que el enlace de "recuperar contraseña" funcione en la web:
1. Entra a tu proyecto en https://supabase.com → **Authentication → URL
   Configuration**.
2. En **Site URL** pon tu dominio: `https://milink.vercel.app`
3. En **Redirect URLs** agrega:
   - `https://milink.vercel.app/auth/reset-password`
   - `milink://auth/reset-password` (para la app nativa)
4. Guarda.

### 4.2 Activar confirmación de correo (producción)
En **Authentication → Providers → Email**, activa "Confirm email" (hoy está OFF
para pruebas). Considera también el CAPTCHA (hCaptcha) que Supabase trae integrado.

### 4.3 Usar la URL para los requisitos de Play Store
Ya tienes las dos URLs públicas que Play exige:
- **Política de Privacidad:** `https://milink.vercel.app/docs/politica-privacidad`
- **Eliminación de cuenta:** la pantalla/sección correspondiente de tu web.

Pégalas en Play Console → ficha de la app y en el formulario **Data safety**.

---

## PASO 5 — Cómo publicar cambios a partir de ahora

Es lo mejor de Vercel: **no repites nada de lo anterior.** Cada vez que cambies
algo:

```bash
git add -A
git commit -m "descripcionDelCambio"
git push
```

Vercel detecta el push, recompila y actualiza la web sola en un par de minutos.
(Los `git push` a otras ramas generan "Preview Deployments" con URL propia para
probar antes de pasar a producción.)

---

## (Opcional) Dominio propio

Si más adelante compras un dominio (ej. `milink.com.co`):
Vercel → tu proyecto → **Settings → Domains → Add** → sigue las instrucciones
(apuntar los DNS). El SSL/HTTPS es automático y gratis. Luego actualiza el Site
URL y las Redirect URLs en Supabase (Paso 4.1) con el dominio nuevo.

---

## Atajo: desplegar sin GitHub (Vercel CLI)

Si algún día quieres un deploy rápido sin pasar por GitHub:
```bash
npm install -g vercel@latest
vercel            # primera vez: responde las preguntas (usa los valores del vercel.json)
vercel --prod     # despliega a producción
```
Igual tendrás que cargar las variables de entorno (`vercel env add ...` o desde el
dashboard). Para el día a día, **el flujo de GitHub del Paso 5 es más cómodo.**

---

## Solución de problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Pantalla en blanco / "Faltan EXPO_PUBLIC_…" | No cargaste las variables | Paso 3.4 y re-deploy (Deployments → ⋯ → Redeploy) |
| Build falla en Vercel | Caché o deps | Settings → borra y vuelve a desplegar; revisa el log del build |
| `/vehicle/123` da 404 al recargar | Falta el rewrite | Confirma que `vercel.json` está en el repo (ya lo está) |
| `git push` rechazado | El repo remoto tenía commits | `git pull --rebase origin main` y vuelve a `git push` |
| El enlace de recuperar contraseña no abre | Redirect URLs sin configurar | Paso 4.1 en Supabase |
| El Service Worker sirve versión vieja | SW cacheado | Sube `VERSION` en `public/sw.js`, commit y push |

---

*Generado para Milink (Expo SDK 54 · web.output: static). Build web verificado
antes de escribir esta guía. Config de Vercel basada en la documentación oficial
de Expo (publishing-websites), vigente a junio de 2026.*
