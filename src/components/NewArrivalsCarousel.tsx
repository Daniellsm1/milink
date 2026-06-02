import { useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { NewArrivalCard } from "./NewArrivalCard";
import type { NuevaEntrada } from "../data/mock";

type Props = {
  data: NuevaEntrada[];
  onPressItem?: (item: NuevaEntrada) => void;
  /** Tiempo entre avances automáticos. Por defecto 2.5 s. */
  intervalMs?: number;
};

const CARD_WIDTH = 200;
const GAP = 12;
const STEP = CARD_WIDTH + GAP;

export function NewArrivalsCarousel({
  data,
  onPressItem,
  intervalMs = 2500,
}: Props) {
  const listRef = useRef<FlatList<NuevaEntrada>>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Distingue un scroll programático (auto-avance) de uno hecho por el usuario:
  // sólo sincronizamos el índice con el offset real cuando el origen es el dedo.
  const userDraggingRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    // Evita timers duplicados.
    stop();
    if (data.length <= 1) return;

    timerRef.current = setInterval(() => {
      // Próximo índice o vuelta al inicio cuando llegamos al final.
      const next =
        indexRef.current >= data.length - 1 ? 0 : indexRef.current + 1;
      indexRef.current = next;
      listRef.current?.scrollToOffset({
        offset: next * STEP,
        animated: true,
      });
    }, intervalMs);
  }, [data.length, intervalMs, stop]);

  // Arranca al montar / al cambiar data o intervalo. Limpia en unmount.
  useEffect(() => {
    indexRef.current = 0;
    start();
    return stop;
  }, [start, stop]);

  // Sólo sincronizamos el índice tras un drag del usuario (no tras auto-scroll),
  // porque el auto-scroll ya dejó el índice "lógico" actualizado y el offset real
  // puede quedarse pegado en el máximo cuando intentamos avanzar más allá.
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
      data={data}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={STEP}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: 20, gap: GAP }}
      // UX: pausa el auto-scroll mientras el usuario arrastra; reanuda al soltar.
      onScrollBeginDrag={onBeginDrag}
      onScrollEndDrag={start}
      onMomentumScrollEnd={onMomentumScrollEnd}
      renderItem={({ item }) => (
        <NewArrivalCard item={item} onPress={() => onPressItem?.(item)} />
      )}
    />
  );
}
