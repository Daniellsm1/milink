/* Milink — Service Worker (PWA Fase 2)
 *
 * Estrategia mínima y segura para una app Expo Router exportada estática:
 *  - Navegaciones (HTML): network-first con fallback a la home cacheada (offline).
 *  - Imágenes públicas de Supabase Storage: cache-first (stale-while-revalidate).
 *  - Estáticos del propio origen (_expo, assets, iconos): stale-while-revalidate.
 *  - NUNCA cacheamos las llamadas a la API de Supabase (auth/rest/realtime):
 *    deben ir siempre a la red para no servir datos de sesión/datos obsoletos.
 *
 * Si esto crece, migrar a Workbox (ver §9.5 del plan).
 */
const VERSION = "milink-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = "/";

// Precache mínimo de la app shell. Los bundles de Expo llevan hash en el nombre,
// así que no se precachean aquí; se cachean en runtime al vuelo.
const SHELL_ASSETS = ["/", "/manifest.json", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isSupabaseImage(url) {
  return (
    url.hostname.endsWith(".supabase.co") &&
    url.pathname.includes("/storage/v1/object/public/")
  );
}

function isSupabaseApi(url) {
  return (
    url.hostname.endsWith(".supabase.co") &&
    (url.pathname.startsWith("/auth/") ||
      url.pathname.startsWith("/rest/") ||
      url.pathname.startsWith("/realtime/"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) API de Supabase → siempre red, sin tocar caché.
  if (isSupabaseApi(url)) return;

  // 2) Navegaciones → network-first con fallback offline a la home.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(OFFLINE_URL, copy));
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL).then((r) => r || caches.match("/")))
    );
    return;
  }

  // 3) Imágenes públicas de Supabase → cache-first + revalidación en segundo plano.
  if (isSupabaseImage(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 4) Estáticos del mismo origen → stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }
});

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}
