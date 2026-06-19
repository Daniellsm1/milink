// Cliente Supabase para React Native + Web.
// Sesión persistida por plataforma (SecureStore nativo | AsyncStorage web, ver
// sessionStorage.ts) + url-polyfill para fetch en RN. Las credenciales vienen de
// .env vía EXPO_PUBLIC_* (expuestas en el bundle).
import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { sessionStorage } from "./sessionStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Falla temprano y claro si el .env no está bien configurado
  throw new Error(
    "Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Storage por plataforma: SecureStore (nativo, cifrado) | AsyncStorage (web).
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Solo en el navegador real (con window) parseamos el callback OAuth de
    // window.location; en SSR (render estático) y en nativo (deep link), no.
    detectSessionInUrl: Platform.OS === "web" && typeof window !== "undefined",
  },
});
