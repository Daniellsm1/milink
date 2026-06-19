// Helpers responsive para que la PWA no se vea "un móvil estirado" en escritorio,
// SIN alterar la app en móvil.
//
// Regla de oro (requisito del proyecto): el ancho máximo y las columnas extra
// SOLO se activan en **web ancha** (>= 768px). En un móvil (iPhone/Android,
// viewport < 768) y en la **app nativa** estos helpers devuelven exactamente los
// mismos valores de siempre → la visualización queda idéntica a la app móvil.
import { Platform, useWindowDimensions, type ViewStyle } from "react-native";

const WEB_BREAKPOINT = 768; // por debajo de esto (móvil) no se toca nada

// Estilo para centrar el contenido con un ancho máximo en escritorio web.
// Pensado para mezclarse dentro de `contentContainerStyle` de un ScrollView/FlatList.
// En móvil/nativo devuelve null (no aplica nada).
export function useWebMaxWidth(maxWidth = 600): ViewStyle | null {
  const { width } = useWindowDimensions();
  const wideWeb = Platform.OS === "web" && width >= WEB_BREAKPOINT;
  return wideWeb
    ? { maxWidth, width: "100%", marginHorizontal: "auto" }
    : null;
}

// Columnas para grids de tarjetas (feed, favoritos, categoría).
// Móvil/nativo → 2 (igual que la app). Web: 3 en tablet, 4 en escritorio.
export function useCardColumns(): number {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web") return 2;
  return width >= 1100 ? 4 : width >= WEB_BREAKPOINT ? 3 : 2;
}
