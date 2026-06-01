// Ilustración vectorial plana para el estado vacío de Favoritos.
// Aproxima la referencia (tablero con tarjetas + corazón + figura) en la
// paleta de la app. Es un vector, nunca una foto real.
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { COLORS } from "../theme/colors";

export function EmptyFavoritesIllustration({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      {/* Tablero / panel de anuncios */}
      <Rect x="92" y="40" width="120" height="150" rx="12" fill="#F1F5F9" />
      <Rect
        x="92"
        y="40"
        width="120"
        height="150"
        rx="12"
        stroke={COLORS.border}
        strokeWidth="2"
      />
      {/* Barra superior del panel */}
      <Circle cx="104" cy="52" r="2.5" fill={COLORS.border} />
      <Circle cx="113" cy="52" r="2.5" fill={COLORS.border} />
      <Circle cx="122" cy="52" r="2.5" fill={COLORS.border} />

      {/* 4 tarjetas placeholder */}
      <G>
        <Rect x="104" y="66" width="44" height="50" rx="6" fill="#FFFFFF" />
        <Rect x="104" y="66" width="44" height="50" rx="6" stroke={COLORS.border} strokeWidth="1.5" />
        <Rect x="110" y="104" width="26" height="3" rx="1.5" fill={COLORS.border} />

        <Rect x="156" y="66" width="44" height="50" rx="6" fill="#FFFFFF" />
        <Rect x="156" y="66" width="44" height="50" rx="6" stroke={COLORS.border} strokeWidth="1.5" />
        <Rect x="162" y="104" width="26" height="3" rx="1.5" fill={COLORS.border} />

        <Rect x="104" y="124" width="44" height="50" rx="6" fill="#FFFFFF" />
        <Rect x="104" y="124" width="44" height="50" rx="6" stroke={COLORS.border} strokeWidth="1.5" />
        <Rect x="110" y="162" width="26" height="3" rx="1.5" fill={COLORS.border} />

        <Rect x="156" y="124" width="44" height="50" rx="6" fill="#FFFFFF" />
        <Rect x="156" y="124" width="44" height="50" rx="6" stroke={COLORS.border} strokeWidth="1.5" />
        <Rect x="162" y="162" width="26" height="3" rx="1.5" fill={COLORS.border} />
      </G>

      {/* Corazones pequeños flotando */}
      <Path d="M196 150c1-1 2-2.1 2-3.5a1.8 1.8 0 0 0-3-1.3 1.8 1.8 0 0 0-3 1.3c0 1.4 1 2.5 2 3.5l1 1 1-1Z" fill={COLORS.accentSoft} />
      <Path d="M78 96c1.2-1.2 2.5-2.5 2.5-4.2a2.2 2.2 0 0 0-3.7-1.6 2.2 2.2 0 0 0-3.7 1.6c0 1.7 1.3 3 2.5 4.2l1.2 1.2 1.2-1.2Z" fill={COLORS.border} />

      {/* Sombra de la figura */}
      <Circle cx="78" cy="196" r="26" fill="#EEF2F7" />

      {/* Figura estilizada (silueta plana, no humana realista) */}
      <G>
        {/* piernas */}
        <Path d="M64 152h22l-2 44h-7l-3-30-3 30h-7l-2-44Z" fill="#3B5B8C" />
        {/* zapatos */}
        <Rect x="55" y="194" width="16" height="6" rx="3" fill={COLORS.text} />
        <Rect x="79" y="194" width="16" height="6" rx="3" fill={COLORS.text} />
        {/* torso / camisa */}
        <Path d="M62 110c0-7 6-13 13-13s13 6 13 13v34a4 4 0 0 1-4 4H66a4 4 0 0 1-4-4v-34Z" fill="#FFFFFF" stroke={COLORS.border} strokeWidth="2" />
        {/* brazo extendido hacia el corazón */}
        <Path d="M86 116c8 1 18 3 26 8" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
        <Path d="M86 116c8 1 18 3 26 8" stroke={COLORS.border} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* cabeza */}
        <Circle cx="75" cy="86" r="13" fill="#F2C9A0" />
        {/* cabello */}
        <Path d="M62 84a13 13 0 0 1 26 0c0-2-3-9-13-9s-13 7-13 9Z" fill={COLORS.text} />
      </G>

      {/* Corazón principal (al frente) */}
      <Path
        d="M120 132c-9-8-22-16-22-29a14 14 0 0 1 22-11 14 14 0 0 1 22 11c0 13-13 21-22 29Z"
        fill="#EF4444"
      />
    </Svg>
  );
}
