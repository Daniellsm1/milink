// Cliente Supabase para React Native.
// Patrón oficial: AsyncStorage para la sesión + url-polyfill para fetch en RN.
// Las credenciales vienen de .env vía EXPO_PUBLIC_* (expuestas en el bundle).
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

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
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En RN no hay URL del navegador: no intentes parsear el callback OAuth de window.location.
    detectSessionInUrl: false,
  },
});
