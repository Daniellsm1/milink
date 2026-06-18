// Splash animado de MiLink: el logo se dibuja línea a línea (stroke draw),
// brilla con efecto neon, aparece el círculo verde y termina como badge sólido.
//
// El logo está redibujado a mano como SVG limpio de 5 formas (techo superior,
// techo inferior, chimenea y dos eslabones) para poder animar por partes.
import { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

type Props = {
  onFinish: () => void;
};

// ─── Geometría del logo (viewBox 0 0 100 100) ───────────────────────
// Chevrones del techo (el pico apunta arriba, ligeramente a la izquierda).
const TECHO_SUP = "M 14 40 L 47 14 L 80 40";
const TECHO_INF = "M 19 50 L 47 28 L 75 50";
// Chimenea: sube desde la pendiente derecha del techo superior.
const CHIMENEA = "M 62 26 L 62 11 L 70 11 L 70 32";
// Eslabones: cuadrados redondeados rotados 45°, entrelazados en el centro.
const ESLABON = { w: 22, h: 22, rx: 7 };
const ESLABON_IZQ = { cx: 40, cy: 67 };
const ESLABON_DER = { cx: 58, cy: 67 };

// Longitudes estimadas de cada trazo (para strokeDasharray).
const LARGO_TECHO_SUP = 90;
const LARGO_TECHO_INF = 78;
const LARGO_CHIMENEA = 50;
const LARGO_ESLABON = 80;

const LOGO_SIZE = 180;
const FONDO = "#0F1115";
const GRID_COLOR = "#1A1D24";
const VERDE = "#10B981";
// 45 deja margen para el overshoot del spring (el viewBox recorta en r=50).
const RADIO_FINAL = 45;

// Capas de glow simulado (react-native-svg no soporta blur nativo).
const GLOW_CAPAS = [
  { strokeWidth: 6, opacidad: 0.15 },
  { strokeWidth: 10, opacidad: 0.08 },
  { strokeWidth: 14, opacidad: 0.04 },
] as const;

// ─── Formas del logo, parametrizadas por capa ───────────────────────
type CapaProps = {
  stroke: string;
  strokeWidth: number;
  // Solo anima `opacity` (común a Path y Rect); el tipo exacto de
  // useAnimatedProps difiere entre ambos y no aporta seguridad aquí.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animatedProps?: any;
};

/** Renderiza las 5 formas del logo con el mismo estilo de capa. */
function FormasLogo({ stroke, strokeWidth, animatedProps }: CapaProps) {
  const comun = {
    stroke,
    strokeWidth,
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    animatedProps,
  };
  return (
    <>
      <AnimatedPath d={TECHO_SUP} {...comun} />
      <AnimatedPath d={TECHO_INF} {...comun} />
      <AnimatedPath d={CHIMENEA} {...comun} />
      <AnimatedRect
        x={ESLABON_IZQ.cx - ESLABON.w / 2}
        y={ESLABON_IZQ.cy - ESLABON.h / 2}
        width={ESLABON.w}
        height={ESLABON.h}
        rx={ESLABON.rx}
        transform={`rotate(45 ${ESLABON_IZQ.cx} ${ESLABON_IZQ.cy})`}
        {...comun}
      />
      <AnimatedRect
        x={ESLABON_DER.cx - ESLABON.w / 2}
        y={ESLABON_DER.cy - ESLABON.h / 2}
        width={ESLABON.w}
        height={ESLABON.h}
        rx={ESLABON.rx}
        transform={`rotate(45 ${ESLABON_DER.cx} ${ESLABON_DER.cy})`}
        {...comun}
      />
    </>
  );
}

// ─── Sparkle: diamante de 4 puntas que pulsa en loop ─────────────────
function Sparkle({
  x,
  y,
  tam,
  delay,
}: {
  x: number;
  y: number;
  tam: number;
  delay: number;
}) {
  const opacidad = useSharedValue(0);

  useEffect(() => {
    opacidad.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.1, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [delay, opacidad]);

  const estilo = useAnimatedStyle(() => ({ opacity: opacidad.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", left: x, top: y }, estilo]}
    >
      <Svg width={tam} height={tam} viewBox="0 0 10 10">
        <Path
          d="M5 0 L6.3 3.7 L10 5 L6.3 6.3 L5 10 L3.7 6.3 L0 5 L3.7 3.7 Z"
          fill="#E5E7EB"
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Grid de fondo estático ──────────────────────────────────────────
function GridFondo({ ancho, alto }: { ancho: number; alto: number }) {
  const paso = 56;
  const verticales = Math.ceil(ancho / paso);
  const horizontales = Math.ceil(alto / paso);
  return (
    <Svg
      width={ancho}
      height={alto}
      style={{ position: "absolute" }}
      pointerEvents="none"
    >
      <G stroke={GRID_COLOR} strokeWidth={1} opacity={0.4}>
        {Array.from({ length: verticales }).map((_, i) => (
          <Line key={`v${i}`} x1={i * paso} y1={0} x2={i * paso} y2={alto} />
        ))}
        {Array.from({ length: horizontales }).map((_, i) => (
          <Line key={`h${i}`} x1={0} y1={i * paso} x2={ancho} y2={i * paso} />
        ))}
      </G>
    </Svg>
  );
}

// ─── Splash principal ────────────────────────────────────────────────
export function AnimatedSplashScreen({ onFinish }: Props) {
  const { width: anchoPantalla, height: altoPantalla } = useWindowDimensions();

  // Fase 1: un dashoffset por forma (largo → 0 = dibujado).
  const dashTechoSup = useSharedValue(LARGO_TECHO_SUP);
  const dashTechoInf = useSharedValue(LARGO_TECHO_INF);
  const dashChimenea = useSharedValue(LARGO_CHIMENEA);
  const dashEslabonIzq = useSharedValue(LARGO_ESLABON);
  const dashEslabonDer = useSharedValue(LARGO_ESLABON);
  // Fase 2/5: glow compartido por las 3 capas.
  const glow = useSharedValue(0);
  // Fase 4: radio del círculo verde.
  const radio = useSharedValue(0);
  // Fase 5: opacidad del set sólido.
  const solido = useSharedValue(0);
  // Fase 6: fade-out del contenedor completo.
  const opacidadRaiz = useSharedValue(1);

  useEffect(() => {
    // SLOW: multiplicador temporal de verificación visual (dejar en 1).
    const SLOW = 1;
    const easing = Easing.inOut(Easing.ease);
    const dibujo = { duration: 1500 * SLOW, easing };

    // Fase 1 — dibujo escalonado
    dashTechoSup.value = withTiming(0, dibujo);
    dashTechoInf.value = withDelay(200 * SLOW, withTiming(0, dibujo));
    dashChimenea.value = withDelay(400 * SLOW, withTiming(0, dibujo));
    dashEslabonIzq.value = withDelay(600 * SLOW, withTiming(0, dibujo));
    dashEslabonDer.value = withDelay(800 * SLOW, withTiming(0, dibujo));

    // Fase 2 — glow: pulso 0 → 1 → 0.5, luego (fase 5) fade-out a 0
    glow.value = withDelay(
      800 * SLOW,
      withSequence(
        withTiming(1, { duration: 500 * SLOW, easing }),
        withTiming(0.5, { duration: 500 * SLOW, easing }),
        withTiming(0.5, { duration: 400 * SLOW }), // hold hasta ~2200ms
        withTiming(0, { duration: 600 * SLOW, easing })
      )
    );

    // Fase 4 — círculo verde con rebote suave
    radio.value = withDelay(
      2000 * SLOW,
      withSpring(RADIO_FINAL, { damping: 12, stiffness: 100 })
    );

    // Fase 5 — logo sólido (trazos gruesos tipo banda)
    solido.value = withDelay(
      2200 * SLOW,
      withTiming(1, { duration: 600 * SLOW, easing })
    );

    // Fase 6 — hold + fade-out de toda la pantalla
    opacidadRaiz.value = withDelay(
      3000 * SLOW,
      withTiming(0, { duration: 400 * SLOW, easing }, (terminada) => {
        if (terminada) runOnJS(onFinish)();
      })
    );
  }, [
    dashTechoSup,
    dashTechoInf,
    dashChimenea,
    dashEslabonIzq,
    dashEslabonDer,
    glow,
    radio,
    solido,
    opacidadRaiz,
    onFinish,
  ]);

  // animatedProps del dibujado (uno por forma)
  const propsTechoSup = useAnimatedProps(() => ({
    strokeDashoffset: dashTechoSup.value,
  }));
  const propsTechoInf = useAnimatedProps(() => ({
    strokeDashoffset: dashTechoInf.value,
  }));
  const propsChimenea = useAnimatedProps(() => ({
    strokeDashoffset: dashChimenea.value,
  }));
  const propsEslabonIzq = useAnimatedProps(() => ({
    strokeDashoffset: dashEslabonIzq.value,
  }));
  const propsEslabonDer = useAnimatedProps(() => ({
    strokeDashoffset: dashEslabonDer.value,
  }));

  // animatedProps de las capas de glow (compartidos por las 5 formas de cada capa)
  const propsGlow1 = useAnimatedProps(() => ({
    opacity: glow.value * GLOW_CAPAS[0].opacidad,
  }));
  const propsGlow2 = useAnimatedProps(() => ({
    opacity: glow.value * GLOW_CAPAS[1].opacidad,
  }));
  const propsGlow3 = useAnimatedProps(() => ({
    opacity: glow.value * GLOW_CAPAS[2].opacidad,
  }));

  // Círculo verde y set sólido
  const propsCirculo = useAnimatedProps(() => ({ r: radio.value }));
  const propsSolido = useAnimatedProps(() => ({ opacity: solido.value }));

  const estiloRaiz = useAnimatedStyle(() => ({
    opacity: opacidadRaiz.value,
  }));

  // Renderiza las 5 formas con el trazado animado (mismos dashoffsets que la
  // capa fina, compartidos): así el glow "sigue" al dibujo en vez de mostrar
  // la silueta completa desde el inicio.
  const renderFormasDibujo = (strokeWidth: number) => {
    const comun = {
      stroke: "#FFFFFF",
      strokeWidth,
      fill: "none" as const,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
    };
    return (
      <>
        <AnimatedPath
          d={TECHO_SUP}
          {...comun}
          strokeDasharray={LARGO_TECHO_SUP}
          animatedProps={propsTechoSup}
        />
        <AnimatedPath
          d={TECHO_INF}
          {...comun}
          strokeDasharray={LARGO_TECHO_INF}
          animatedProps={propsTechoInf}
        />
        <AnimatedPath
          d={CHIMENEA}
          {...comun}
          strokeDasharray={LARGO_CHIMENEA}
          animatedProps={propsChimenea}
        />
        <AnimatedRect
          x={ESLABON_IZQ.cx - ESLABON.w / 2}
          y={ESLABON_IZQ.cy - ESLABON.h / 2}
          width={ESLABON.w}
          height={ESLABON.h}
          rx={ESLABON.rx}
          transform={`rotate(45 ${ESLABON_IZQ.cx} ${ESLABON_IZQ.cy})`}
          {...comun}
          strokeDasharray={LARGO_ESLABON}
          animatedProps={propsEslabonIzq}
        />
        <AnimatedRect
          x={ESLABON_DER.cx - ESLABON.w / 2}
          y={ESLABON_DER.cy - ESLABON.h / 2}
          width={ESLABON.w}
          height={ESLABON.h}
          rx={ESLABON.rx}
          transform={`rotate(45 ${ESLABON_DER.cx} ${ESLABON_DER.cy})`}
          {...comun}
          strokeDasharray={LARGO_ESLABON}
          animatedProps={propsEslabonDer}
        />
      </>
    );
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: FONDO,
          alignItems: "center",
          justifyContent: "center",
        },
        estiloRaiz,
      ]}
    >
      {/* Fondo: grid estático */}
      <GridFondo ancho={anchoPantalla} alto={altoPantalla} />

      {/* Sparkles pulsantes en posiciones fijas */}
      <Sparkle x={anchoPantalla * 0.18} y={altoPantalla * 0.22} tam={9} delay={0} />
      <Sparkle x={anchoPantalla * 0.78} y={altoPantalla * 0.18} tam={7} delay={500} />
      <Sparkle x={anchoPantalla * 0.85} y={altoPantalla * 0.62} tam={8} delay={1000} />
      <Sparkle x={anchoPantalla * 0.12} y={altoPantalla * 0.72} tam={6} delay={1500} />

      {/* Logo (zIndex: en web los hermanos absolute pintan encima si no) */}
      <Svg
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        viewBox="0 0 100 100"
        style={{ zIndex: 1 }}
      >
        {/* Fase 4: círculo verde detrás del logo */}
        <AnimatedCircle
          cx={50}
          cy={50}
          fill={VERDE}
          animatedProps={propsCirculo}
        />

        {/* Fase 2: capas de glow (siguen el trazado; opacidad por capa) */}
        <AnimatedG animatedProps={propsGlow3}>
          {renderFormasDibujo(GLOW_CAPAS[2].strokeWidth)}
        </AnimatedG>
        <AnimatedG animatedProps={propsGlow2}>
          {renderFormasDibujo(GLOW_CAPAS[1].strokeWidth)}
        </AnimatedG>
        <AnimatedG animatedProps={propsGlow1}>
          {renderFormasDibujo(GLOW_CAPAS[0].strokeWidth)}
        </AnimatedG>

        {/* Fase 5: set sólido (bandas gruesas, como el badge final) */}
        <FormasLogo
          stroke="#FFFFFF"
          strokeWidth={7}
          animatedProps={propsSolido}
        />

        {/* Fase 1: trazos finos que se dibujan */}
        {renderFormasDibujo(2.5)}
      </Svg>
    </Animated.View>
  );
}
