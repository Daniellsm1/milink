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

export const ChevronLeft = (p: IconProps) => (
  <Stroke {...p}>
    <Polyline points="15 18 9 12 15 6" />
  </Stroke>
);

export const ChevronDown = (p: IconProps) => (
  <Stroke {...p}>
    <Polyline points="6 9 12 15 18 9" />
  </Stroke>
);

export const ChevronUp = (p: IconProps) => (
  <Stroke {...p}>
    <Polyline points="18 15 12 9 6 15" />
  </Stroke>
);

export const Trash = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M3 6h18" />
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <Line x1="10" y1="11" x2="10" y2="17" />
    <Line x1="14" y1="11" x2="14" y2="17" />
  </Stroke>
);

export const Mail = (p: IconProps) => (
  <Stroke {...p}>
    <Rect x="2" y="4" width="20" height="16" rx="2" />
    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Stroke>
);

export const Lock = (p: IconProps) => (
  <Stroke {...p}>
    <Rect x="3" y="11" width="18" height="11" rx="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Stroke>
);

export const Eye = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <Circle cx="12" cy="12" r="3" />
  </Stroke>
);

export const Check = (p: IconProps) => (
  <Stroke {...p}>
    <Polyline points="20 6 9 17 4 12" />
  </Stroke>
);

export const X = (p: IconProps) => (
  <Stroke {...p}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Stroke>
);

export const Plus = (p: IconProps) => (
  <Stroke {...p}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Stroke>
);

export const Camera = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <Circle cx="12" cy="13" r="3" />
  </Stroke>
);

export const Seat = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
    <Path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
    <Path d="M5 18v2" />
    <Path d="M19 18v2" />
  </Stroke>
);

export const Calendar = (p: IconProps) => (
  <Stroke {...p}>
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="3" y1="10" x2="21" y2="10" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="16" y1="2" x2="16" y2="6" />
  </Stroke>
);

export const Gauge = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="m12 14 4-4" />
    <Path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </Stroke>
);

export const EyeOff = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
    <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <Line x1="2" y1="2" x2="22" y2="22" />
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

// ─── Marcas sociales (multicolor) ──────────────────────────────────
export const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.88Z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.7-4.94H1.29v3.09A12 12 0 0 0 12 24Z"
    />
    <Path
      fill="#FBBC05"
      d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.62H1.29a12 12 0 0 0 0 10.77L5.3 14.3Z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62L5.3 9.7C6.24 6.86 8.88 4.75 12 4.75Z"
    />
  </Svg>
);

export const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#1877F2"
      d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.38C19.61 22.95 24 17.99 24 12Z"
    />
  </Svg>
);

export const AppleIcon = ({
  size = 24,
  color = "#000000",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.78 1.3 10.32.86 1.24 1.89 2.64 3.23 2.59 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.38.81 1.4-.02 2.28-1.27 3.13-2.52.99-1.44 1.4-2.84 1.42-2.91-.03-.01-2.72-1.04-2.75-4.13M14.46 4.39c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44"
    />
  </Svg>
);

// Estrella llena (calificaciones)
export const Star = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.8l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5Z" />
  </Filled>
);

// Corazón lleno (favorito activo)
export const HeartFilled = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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

// ─── Iconos de la sección "¿Por qué MiLink?" ───────────────────────

// Insignia con signo de dólar — mejores precios
export const BadgeDolar = (p: IconProps) => (
  <Filled {...p}>
    <Circle cx="12" cy="12" r="10" />
    <Path
      d="M12.7 6.6v1.1c1.5.16 2.6.95 2.85 2.18.06.32-.18.62-.5.62h-.8c-.26 0-.46-.18-.55-.42-.18-.5-.7-.86-1.55-.86-1.02 0-1.55.45-1.55 1.05 0 .55.36.86 1.55 1.15l1.05.26c1.95.45 2.85 1.32 2.85 2.65 0 1.45-1.15 2.45-2.85 2.65v1.1c0 .3-.25.55-.55.55h-.7a.55.55 0 0 1-.55-.55v-1.1c-1.6-.18-2.75-1-3-2.3-.06-.32.18-.6.5-.6h.8c.26 0 .46.16.55.4.18.55.75.95 1.7.95 1.05 0 1.65-.45 1.65-1.1 0-.55-.36-.86-1.45-1.13l-1.15-.28c-1.85-.45-2.85-1.3-2.85-2.65 0-1.35 1.1-2.32 2.7-2.55V6.6c0-.3.25-.55.55-.55h.7c.3 0 .55.25.55.55Z"
      fill={DARK}
      opacity={0.92}
    />
  </Filled>
);

// Escudo con check — sin cargos ocultos / seguridad
export const ShieldCheck = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M12 2.2 4 5v6.2c0 4.3 3.1 8.3 8 10.6 4.9-2.3 8-6.3 8-10.6V5l-8-2.8Z" />
    <Path
      d="m9 12 2.2 2.2L15.2 10"
      stroke={DARK}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={0.92}
    />
  </Filled>
);

// Portapapeles con líneas — información clara
export const ClipboardList = (p: IconProps) => (
  <Stroke {...p}>
    <Rect x="5" y="4" width="14" height="17" rx="2" />
    <Rect x="9" y="2.5" width="6" height="3.5" rx="1" />
    <Line x1="8.5" y1="11" x2="15.5" y2="11" />
    <Line x1="8.5" y1="14.5" x2="15.5" y2="14.5" />
    <Line x1="8.5" y1="18" x2="13" y2="18" />
  </Stroke>
);

// Bocadillo redondo — contacto directo
export const MessageCircle = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  </Stroke>
);

// Móvil con detalle de pantalla — 100% en línea
export const Smartphone = (p: IconProps) => (
  <Filled {...p}>
    <Rect x="6" y="2.3" width="12" height="19.4" rx="2.6" />
    <Rect
      x="7.6"
      y="4.6"
      width="8.8"
      height="13"
      rx="0.8"
      fill={DARK}
      opacity={0.18}
    />
    <Circle cx="12" cy="19.4" r="0.95" fill={DARK} opacity={0.55} />
  </Filled>
);

// ─── Iconos del drawer lateral ─────────────────────────────────────

// Hamburguesa moderna: 3 líneas, la del medio más corta (estilo Phosphor)
export const Menu = (p: IconProps) => (
  <Stroke {...p}>
    <Line x1="3.5" y1="6.5" x2="20.5" y2="6.5" />
    <Line x1="3.5" y1="12" x2="16" y2="12" />
    <Line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
  </Stroke>
);

// Círculo con "i" — "Sobre nosotros"
export const InfoCircle = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="12" cy="12" r="9.5" />
    <Line x1="12" y1="11" x2="12" y2="16.5" />
    <Circle cx="12" cy="7.7" r="0.6" fill={p.color ?? "currentColor"} stroke="none" />
  </Stroke>
);

// Destellos celebratorios — "Beneficios"
export const Sparkles = (p: IconProps) => (
  <Filled {...p}>
    <Path d="M12 2.5 13.7 8.4 19.5 10.1 13.7 11.9 12 17.8 10.3 11.9 4.5 10.1 10.3 8.4 12 2.5Z" />
    <Path d="M19 14.2 19.8 16.6 22.2 17.4 19.8 18.2 19 20.6 18.2 18.2 15.8 17.4 18.2 16.6 19 14.2Z" />
    <Path d="M5.3 15 5.9 16.9 7.8 17.5 5.9 18.1 5.3 20 4.7 18.1 2.8 17.5 4.7 16.9 5.3 15Z" />
  </Filled>
);

// Círculo con "?" — "Preguntas frecuentes"
export const HelpCircle = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="12" cy="12" r="9.5" />
    <Path d="M9.2 9.2a3 3 0 0 1 5.6 1.2c0 1.5-2.3 2.3-2.8 3.6" />
    <Circle cx="12" cy="17.2" r="0.6" fill={p.color ?? "currentColor"} stroke="none" />
  </Stroke>
);

// Documento con hoja doblada — "Términos y condiciones"
export const FileText = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5L14 2.5Z" />
    <Polyline points="14 2.5 14 7.5 19 7.5" />
    <Line x1="8.5" y1="12.5" x2="15.5" y2="12.5" />
    <Line x1="8.5" y1="15.5" x2="15.5" y2="15.5" />
    <Line x1="8.5" y1="18.5" x2="13" y2="18.5" />
  </Stroke>
);

// Flecha saliendo de una caja — "Cerrar sesión"
export const LogOut = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <Polyline points="15 16 20 12 15 8" />
    <Line x1="20" y1="12" x2="9" y2="12" />
  </Stroke>
);
