// Iconos de Milink traducidos a react-native-svg desde la maqueta (Milink html/icons.jsx).
// Lineales: estilo Lucide (stroke 2px, round). Llenos: para categorías.
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Polyline,
  Polygon,
  G,
} from "react-native-svg";

export type IconProps = {
  size?: number;
  color?: string;
};

type StrokeIconProps = IconProps & { strokeWidth?: number };

// ─── Lineales (stroke) ───────────────────────────────────────────────
const Stroke = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  children,
}: StrokeIconProps & { children: React.ReactNode }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export const Heart = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Stroke>
);

export const Share2 = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Stroke>
);

export const User = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Stroke>
);

export const Search = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Stroke>
);

export const MapPin = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z" />
    <Circle cx="12" cy="10" r="3" />
  </Stroke>
);

export const LayoutGrid = (p: IconProps) => (
  <Stroke {...p}>
    <Rect x="3" y="3" width="7" height="7" rx="1" />
    <Rect x="14" y="3" width="7" height="7" rx="1" />
    <Rect x="14" y="14" width="7" height="7" rx="1" />
    <Rect x="3" y="14" width="7" height="7" rx="1" />
  </Stroke>
);

export const PlusCircle = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="16" />
    <Line x1="8" y1="12" x2="16" y2="12" />
  </Stroke>
);

export const Fuel = (p: IconProps) => (
  <Stroke {...p}>
    <Line x1="3" y1="22" x2="15" y2="22" />
    <Line x1="4" y1="9" x2="14" y2="9" />
    <Path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
    <Path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
  </Stroke>
);

export const Users = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Stroke>
);

export const Settings = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
    <Circle cx="12" cy="12" r="3" />
  </Stroke>
);

export const Zap = (p: IconProps) => (
  <Stroke {...p}>
    <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Stroke>
);

export const ChevronRight = (p: IconProps) => (
  <Stroke {...p}>
    <Polyline points="9 18 15 12 9 6" />
  </Stroke>
);

// ─── Llenos (fill) para categorías ──────────────────────────────────
const Filled = ({
  size = 24,
  color = "currentColor",
  children,
}: IconProps & { children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    {children}
  </Svg>
);

const DARK = "#0F172A";

// SUV / Camionetas — vista lateral
export const Truck = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M2.8 15V12.4c0-1 .55-1.55 1.55-1.75L6 10.3l1.85-3.05A2.4 2.4 0 0 1 9.9 6h6.05a2.4 2.4 0 0 1 1.9.9l2.3 2.9 1.35.45c.8.27 1.1.85 1.1 1.65V15a.7.7 0 0 1-.7.7h-1.45a3 3 0 0 0-6 0h-2.1a3 3 0 0 0-6 0H3.5a.7.7 0 0 1-.7-.7Z" />
    <Path d="M13.4 7.1h2.4c.4 0 .7.18.92.5l1.5 2.2H13.4V7.1Z" fill={DARK} opacity={0.45} />
    <Circle cx="7" cy="16.5" r="2.6" />
    <Circle cx="7" cy="16.5" r="1.05" fill={DARK} opacity={0.5} />
    <Circle cx="17" cy="16.5" r="2.6" />
    <Circle cx="17" cy="16.5" r="1.05" fill={DARK} opacity={0.5} />
  </Filled>
);

// Carro — vista frontal
export const Car = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M4 12.5c0-1 .35-1.6 1-2.5l2-3a3 3 0 0 1 2.5-1.3h5a3 3 0 0 1 2.5 1.3l2 3c.65.9 1 1.5 1 2.5V17a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.7H7.5V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4.5Z" />
    <Path d="M8.2 8.2 9.5 6.4a1.5 1.5 0 0 1 1.25-.7h2.5a1.5 1.5 0 0 1 1.25.7l1.3 1.8c.3.4 0 .9-.5.9H8.7c-.5 0-.8-.5-.5-.9Z" fill={DARK} opacity={0.42} />
    <Circle cx="7.3" cy="13" r="0.95" fill={DARK} opacity={0.45} />
    <Circle cx="16.7" cy="13" r="0.95" fill={DARK} opacity={0.45} />
    <Rect x="5.5" y="14.5" width="1.5" height="1" rx="0.3" fill={DARK} opacity={0.3} />
    <Rect x="17" y="14.5" width="1.5" height="1" rx="0.3" fill={DARK} opacity={0.3} />
  </Filled>
);

// Moto deportiva
export const Bike = (p: IconProps) => (
  <Filled {...p}>
    <Circle cx="5.5" cy="16.5" r="3.5" />
    <Circle cx="5.5" cy="16.5" r="1.3" fill={DARK} opacity={0.45} />
    <Circle cx="18.5" cy="16.5" r="3.5" />
    <Circle cx="18.5" cy="16.5" r="1.3" fill={DARK} opacity={0.45} />
    <Path d="M9.5 7.5h3.8l2.4 3.6 1.9 3.5H15l-1.8-3.3h-2.5l-2.6 3.3H5.4l3.3-4.1L8 8.6h1.5l.0-1.1Z" />
    <Path d="M14.5 5.5h3.2a.9.9 0 0 1 .9.9v.5h-1.4l-.5 1.2h-2.2V5.5Z" />
  </Filled>
);

// Edificio de apartamentos
export const Building2 = (p: IconProps) => (
  <Filled {...p}>
    <Rect x="4" y="3.2" width="10.5" height="17.8" rx="0.8" />
    <Rect x="14" y="8" width="6" height="13" rx="0.8" />
    {[5.2, 8.6, 12, 15.4].map((y, i) => (
      <G key={i}>
        <Rect x="6" y={y} width="2.1" height="2.1" rx="0.3" fill={DARK} opacity={0.5} />
        <Rect x="10.3" y={y} width="2.1" height="2.1" rx="0.3" fill={DARK} opacity={0.5} />
      </G>
    ))}
    {[10, 13, 16].map((y, i) => (
      <Rect key={i} x="15.4" y={y} width="1.8" height="1.8" rx="0.3" fill={DARK} opacity={0.5} />
    ))}
    <Rect x="9" y="18.5" width="2.6" height="2.5" rx="0.3" fill={DARK} opacity={0.55} />
  </Filled>
);

// Casa
export const Home = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M11.34 2.95a1 1 0 0 1 1.32 0l8.5 7.65a1 1 0 0 1-.67 1.75H20v8.4a1 1 0 0 1-1 1h-4v-5.6a3 3 0 0 0-6 0V21.75H5a1 1 0 0 1-1-1v-8.4H2.51a1 1 0 0 1-.67-1.75l8.5-7.65Z" />
  </Filled>
);

// Fincas — dos casas sobre colina
export const Trees = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M1.5 18c4-3 6.5-3 11-3s7 0 11 3v2.5a.7.7 0 0 1-.7.7H2.2a.7.7 0 0 1-.7-.7V18Z" />
    <Path d="M14 15.5V11l3-3 3 3v4.5h-6Z" />
    <Path d="M5 16.5V10.2L9.5 5.7l4.5 4.5V16.5H5Z" />
    <Rect x="8.4" y="13.2" width="2.2" height="3.3" rx="0.3" fill={DARK} opacity={0.45} />
  </Filled>
);

// WhatsApp (marca, fill)
export const WhatsApp = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.695.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </Filled>
);

// Mapa categoría -> icono lleno
export const CATEGORY_ICONS = {
  camionetas: Truck,
  carros: Car,
  motos: Bike,
  apartamentos: Building2,
  casas: Home,
  fincas: Trees,
} as const;
