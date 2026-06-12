// Skeleton base con efecto shimmer hecho con Reanimated puro (sin librerías).
// La barra de brillo recorre el contenedor de izquierda a derecha en loop.
import { useEffect, useState } from "react";
import { View, type DimensionValue, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Props = {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

const SHIMMER_DURACION = 1200;

export function Skeleton({ width, height, borderRadius = 8, style }: Props) {
  // Ancho real medido (necesario cuando width es porcentaje).
  const [anchoMedido, setAnchoMedido] = useState(0);
  const progreso = useSharedValue(0);

  useEffect(() => {
    progreso.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURACION, easing: Easing.linear }),
      -1,
      false
    );
  }, [progreso]);

  const brilloStyle = useAnimatedStyle(() => {
    const w = anchoMedido || 100;
    const barra = w * 0.6;
    return {
      transform: [
        { translateX: -barra + progreso.value * (w + barra * 2) },
      ],
    };
  }, [anchoMedido]);

  return (
    <View
      className="bg-line"
      onLayout={(e) => setAnchoMedido(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius, overflow: "hidden" }, style]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: (anchoMedido || 100) * 0.6,
            backgroundColor: "#FFFFFF",
            opacity: 0.3,
          },
          brilloStyle,
        ]}
      />
    </View>
  );
}
