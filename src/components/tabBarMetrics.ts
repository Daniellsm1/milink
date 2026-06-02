// Métricas del CustomTabBar para que las pantallas reserven el espacio que él
// ocupa visualmente (al estar `absolute bottom-0`, no lo ocupa por layout).
//
// La fórmula coincide con la altura real renderizada por CustomTabBar:
//   base + Math.max(insets.bottom, 12)
// donde "base" cubre: padding superior + iconos + label + borde superior.
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_BASE_HEIGHT = 64;

export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 12);
}
