// Hook para invitar a instalar la PWA. SOLO web — en nativo no hace nada.
//
// Mecánica:
//  • Android Chrome/Edge + escritorio Chrome/Edge: el navegador dispara
//    `beforeinstallprompt`. Lo capturamos, evitamos el banner nativo, y al
//    pulsar el botón llamamos prompt().
//  • iOS Safari: NO existe ese evento; la instalación es manual
//    (Compartir → Añadir a inicio). Mostramos instrucciones (platform="ios").
//  • Ya instalada (standalone) o ya descartada (localStorage) → no se muestra.
//
// SSR-safe (gotcha #14 del CLAUDE.md): nada que toque `window` corre fuera de
// useEffect, y el estado inicial es `visible=false` para que el render del
// servidor y la primera hidratación coincidan.
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const DISMISS_KEY = "milink:pwa-install-dismissed";

// El evento beforeinstallprompt no está tipado en lib.dom estándar.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaPlatform = "prompt" | "ios";

export type UsePwaInstall = {
  visible: boolean;
  platform: PwaPlatform | null;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
};

function estaEnStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia?.("(display-mode: standalone)");
  // navigator.standalone es propio de iOS Safari (no está en el tipo estándar).
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean })
    .standalone;
  return Boolean(mql?.matches || iosStandalone);
}

function esIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function usePwaInstall(): UsePwaInstall {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<PwaPlatform | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    // Ya instalada o ya descartada → nunca mostrar.
    if (estaEnStandalone()) return;
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // localStorage puede no existir (modo privado); seguimos sin flag.
    }

    // iOS: sin evento de instalación → ofrecemos instrucciones.
    if (esIOS()) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    // Android/escritorio: esperamos el evento del navegador.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // evita el mini-banner nativo
      setDeferred(e as BeforeInstallPromptEvent);
      setPlatform("prompt");
      setVisible(true);
    };
    const onInstalled = () => {
      persistirDescarte();
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // Si el navegador rechaza el prompt, igual lo damos por visto.
    } finally {
      // "Una sola vez": tras interactuar (acepte o cancele) no vuelve a salir.
      persistirDescarte();
      setVisible(false);
      setDeferred(null);
    }
  };

  const dismiss = () => {
    persistirDescarte();
    setVisible(false);
  };

  return { visible, platform, promptInstall, dismiss };
}

function persistirDescarte() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // sin localStorage no persiste, pero no rompe el flujo.
  }
}
