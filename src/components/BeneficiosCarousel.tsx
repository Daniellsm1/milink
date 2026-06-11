import { useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
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

const CARD_WIDTH = 260;
const GAP = 12;
const STEP = CARD_WIDTH + GAP;
const INTERVAL_MS = 3000;

function BeneficioCard({ item }: { item: Beneficio }) {
  const Icon = item.Icon;
  return (
    <View
      style={{
        width: CARD_WIDTH,
        backgroundColor: COLORS.categoryBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
      }}
    >
      <Icon size={56} color={COLORS.accent} />
      <Text className="font-quicksand-bold text-[16px] text-ink text-center mt-3">
        {item.titulo}
      </Text>
      <Text
        className="font-quicksand text-[13px] text-muted text-center mt-1.5 leading-5"
        numberOfLines={3}
      >
        {item.descripcion}
      </Text>
    </View>
  );
}

export function BeneficiosCarousel() {
  const listRef = useRef<FlatList<Beneficio>>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userDraggingRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    if (BENEFICIOS.length <= 1) return;
    timerRef.current = setInterval(() => {
      const next =
        indexRef.current >= BENEFICIOS.length - 1 ? 0 : indexRef.current + 1;
      indexRef.current = next;
      listRef.current?.scrollToOffset({
        offset: next * STEP,
        animated: true,
      });
    }, INTERVAL_MS);
  }, [stop]);

  useEffect(() => {
    indexRef.current = 0;
    start();
    return stop;
  }, [start, stop]);

  const onMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!userDraggingRef.current) return;
    userDraggingRef.current = false;
    const offsetX = e.nativeEvent.contentOffset.x;
    indexRef.current = Math.max(0, Math.round(offsetX / STEP));
  };

  const onBeginDrag = () => {
    userDraggingRef.current = true;
    stop();
  };

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={BENEFICIOS}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={STEP}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: 20, gap: GAP }}
      onScrollBeginDrag={onBeginDrag}
      onScrollEndDrag={start}
      onMomentumScrollEnd={onMomentumScrollEnd}
      renderItem={({ item }) => <BeneficioCard item={item} />}
    />
  );
}
