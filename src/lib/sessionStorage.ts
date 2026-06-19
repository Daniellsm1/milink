// Almacenamiento de la sesión de Supabase por plataforma.
//
//  • Nativo (iOS/Android): SecureStore (Keychain/Keystore) → cifrado en reposo.
//    SecureStore limita ~2KB por valor y el token de Supabase puede superarlo,
//    así que partimos el valor en chunks (cierra el hallazgo de seguridad 2.2).
//  • Web: AsyncStorage (localStorage) → SecureStore no existe en navegador.
//
// La forma del objeto coincide con lo que espera `auth.storage` de supabase-js.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// < 2048 bytes por valor; los tokens son ASCII (JWT/base64) → 1 char = 1 byte.
const CHUNK_SIZE = 1800;
const countKey = (k: string) => `${k}.chunks`;
const partKey = (k: string, i: number) => `${k}.${i}`;

const secureStorage: StorageLike = {
  async getItem(key) {
    const countRaw = await SecureStore.getItemAsync(countKey(key));
    // Sin metadato de chunks: valor antiguo no particionado (o ausente).
    if (countRaw == null) return SecureStore.getItemAsync(key);

    const count = parseInt(countRaw, 10);
    let out = "";
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(partKey(key, i));
      if (part == null) return null; // estado corrupto → forzar re-login
      out += part;
    }
    return out;
  },

  async setItem(key, value) {
    const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    await SecureStore.setItemAsync(countKey(key), String(count));
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(
        partKey(key, i),
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      );
    }
    // Limpia un posible valor antiguo no particionado bajo la misma clave.
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },

  async removeItem(key) {
    const countRaw = await SecureStore.getItemAsync(countKey(key));
    const count = countRaw ? parseInt(countRaw, 10) : 0;
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(partKey(key, i)).catch(() => {});
    }
    await SecureStore.deleteItemAsync(countKey(key)).catch(() => {});
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

// En web, AsyncStorage usa localStorage, que NO existe durante el render estático
// en Node (`web.output: "static"`). Si no hay window devolvemos un storage no-op:
// en el servidor no hay sesión que recuperar; el cliente la lee al hidratar.
const webHasStorage =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const webStorage: StorageLike = webHasStorage
  ? {
      getItem: (k) => AsyncStorage.getItem(k),
      setItem: (k, v) => AsyncStorage.setItem(k, v),
      removeItem: (k) => AsyncStorage.removeItem(k),
    }
  : {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };

export const sessionStorage: StorageLike =
  Platform.OS === "web" ? webStorage : secureStorage;
