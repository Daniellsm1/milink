// Avatar ilustrado (vector), nunca una foto real de persona.
// Silueta estilizada sobre fondo suave; el color se puede personalizar.
import Svg, { Circle, ClipPath, Defs, G, Path } from "react-native-svg";
import { COLORS } from "../theme/colors";

export function Avatar({
  size = 48,
  bg = COLORS.accentSoft,
  fg = COLORS.accent,
}: {
  size?: number;
  bg?: string;
  fg?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="avatarClip">
          <Circle cx="24" cy="24" r="24" />
        </ClipPath>
      </Defs>
      <Circle cx="24" cy="24" r="24" fill={bg} />
      <G clipPath="url(#avatarClip)">
        {/* Hombros / cuerpo */}
        <Path d="M7 48a17 17 0 0 1 34 0Z" fill={fg} />
        {/* Cabeza */}
        <Circle cx="24" cy="19" r="9" fill={fg} />
      </G>
    </Svg>
  );
}
