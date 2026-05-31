// Subida de imágenes al bucket 'publicaciones' de Supabase Storage.
// Estrategia cross-platform: comprimimos/normalizamos con expo-image-manipulator
// (devuelve base64) y subimos el ArrayBuffer decodificado. Funciona en web y nativo.
import { decode } from "base64-arraybuffer";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "../lib/supabase";

const BUCKET = "publicaciones";

/**
 * Sube una lista de imágenes locales (URIs del image picker) a Storage,
 * dentro de la carpeta del usuario: {userId}/{tipo}/{timestamp}-{i}.jpg
 * Devuelve las URLs públicas en el mismo orden.
 */
export async function subirImagenes(
  userId: string,
  tipo: "vehiculos" | "propiedades",
  uris: string[]
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < uris.length; i++) {
    const manipulated = await ImageManipulator.manipulateAsync(
      uris[i],
      [{ resize: { width: 1280 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulated.base64) {
      throw new Error("No se pudo procesar la imagen.");
    }

    const path = `${userId}/${tipo}/${Date.now()}-${i}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, decode(manipulated.base64), {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir la imagen ${i + 1}: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
