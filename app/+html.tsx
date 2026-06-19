// HTML root del export web de Expo Router (`web.output: "static"`).
// Este archivo SOLO afecta a la web: en nativo Expo lo ignora. Aquí inyectamos
// los metadatos PWA (manifest, theme-color, apple-touch-icon) y registramos el
// service worker. El estilo/identidad visual sigue viniendo de NativeWind +
// Quicksand, igual que en la app móvil.
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const registerSW = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW registro falló',e);});});}`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA */}
        <meta name="theme-color" content="#10B981" />
        <meta
          name="description"
          content="Alquiler de vehículos y propiedades entre miembros de las Fuerzas Militares de Colombia."
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Milink" />

        {/* Reset recomendado por Expo: evita el scroll del body, deja que las
            vistas de RN-web manejen el scroll igual que en móvil. */}
        <ScrollViewStyleReset />

        <script dangerouslySetInnerHTML={{ __html: registerSW }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
