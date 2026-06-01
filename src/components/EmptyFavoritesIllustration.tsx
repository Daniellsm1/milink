// Ilustración del estado vacío de Favoritos.
// Renderiza la imagen proporcionada por el usuario en assets/favoritosvacio.png.
import { Image } from "expo-image";

export function EmptyFavoritesIllustration({ size = 240 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/favoritosvacio.png")}
      style={{ width: size, height: size }}
      contentFit="contain"
      transition={150}
    />
  );
}
