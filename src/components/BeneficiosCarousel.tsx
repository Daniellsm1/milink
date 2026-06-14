import { Text, View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  BadgeDolar,
  ShieldCheck,
  ClipboardList,
  MessageCircle,
  Smartphone,
  type IconProps,
} from "./icons";
import { COLORS } from "../theme/colors";

type Beneficio = {
  id: string;
  Icon: (p: IconProps) => React.ReactElement;
  titulo: string;
  descripcion: string;
};

const BENEFICIOS: Beneficio[] = [
  {
    id: "precios",
    Icon: BadgeDolar,
    titulo: "Los mejores precios del mercado",
    descripcion:
      "Trato directo con el propietario. Sin comisiones ni intermediarios que encarezcan el alquiler.",
  },
  {
    id: "sin-cargos",
    Icon: ShieldCheck,
    titulo: "Sin cargos ocultos",
    descripcion:
      "No cobramos comisiones ni gastos de reserva por usar la plataforma.",
  },
  {
    id: "info-clara",
    Icon: ClipboardList,
    titulo: "Información clara",
    descripcion:
      "Listados con detalles de kilometraje, características y estado del bien.",
  },
  {
    id: "contacto",
    Icon: MessageCircle,
    titulo: "Contacto directo",
    descripcion:
      "Te comunicas con el propietario por WhatsApp para resolver dudas y acordar la entrega.",
  },
  {
    id: "online",
    Icon: Smartphone,
    titulo: "Proceso 100% en línea",
    descripcion: "Buscar, comparar y contactar, todo desde la app.",
  },
];

const CARD_MARGIN = 8;

// Paleta "Atardecer": dos colores que contrastan (ámbar → coral). Hace que el
// ícono esmeralda resalte por contraste complementario y mantiene legible el
// texto oscuro encima.
const GRAD_INICIO = "#FBBF24"; // ámbar
const GRAD_FIN = "#FB7185"; // coral / rosa

// Fondo gradiente diagonal con expo-linear-gradient (módulo nativo:
// Android usa android.graphics.LinearGradient, iOS usa CAGradientLayer,
// web usa CSS linear-gradient). Continuo en todas las plataformas.
// react-native-svg renderiza gradientes en bloques en Android cuando se
// combina viewBox + preserveAspectRatio="none", por eso evitamos SVG.
function GradientBackground() {
  return (
    <LinearGradient
      colors={[GRAD_INICIO, GRAD_FIN]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

function BeneficioCard({
  item,
  cardWidth,
}: {
  item: Beneficio;
  cardWidth: number;
}) {
  const Icon = item.Icon;
  return (
    // Capa externa: sombra/elevation sobre fondo sólido (sin overflow), para que
    // en Android la sombra se pinte limpia y no genere el marco gris.
    <View
      style={{
        width: cardWidth,
        marginHorizontal: CARD_MARGIN,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      }}
    >
      {/* Capa interna: recorta el gradiente a las esquinas redondeadas. */}
      <View
        style={{
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
          backgroundColor: GRAD_INICIO,
          padding: 20,
          alignItems: "center",
        }}
      >
        <GradientBackground />
        <Icon size={56} color={COLORS.accent} />
        <Text className="font-quicksand-bold text-[16px] text-ink text-center mt-3">
          {item.titulo}
        </Text>
        <Text
          className="font-quicksand text-[13px] text-center mt-1.5 leading-5"
          style={{ color: COLORS.text, opacity: 0.7 }}
          numberOfLines={3}
        >
          {item.descripcion}
        </Text>
      </View>
    </View>
  );
}

function CoverflowCard({
  index,
  scrollX,
  step,
  children,
}: {
  index: number;
  scrollX: SharedValue<number>;
  step: number;
  children: React.ReactNode;
}) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * step, index * step, (index + 1) * step];
    // Vecinas más chicas y atenuadas: se leen como "fondo" para invitar a
    // deslizar. Centro a tamaño natural para no tapar el peek de los lados.
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.55, 1, 0.55],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }], opacity };
  });

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

export function BeneficiosCarousel() {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);

  // La card activa ocupa ~70% del ancho → deja ~15% por lado para asomar las
  // cards vecinas (efecto peek que invita a deslizar).
  const cardWidth = Math.min(width * 0.7, 290);
  const step = cardWidth + CARD_MARGIN * 2;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: (width - step) / 2,
        paddingVertical: 20,
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {BENEFICIOS.map((item, index) => (
        <CoverflowCard key={item.id} index={index} scrollX={scrollX} step={step}>
          <BeneficioCard item={item} cardWidth={cardWidth} />
        </CoverflowCard>
      ))}
    </Animated.ScrollView>
  );
}
