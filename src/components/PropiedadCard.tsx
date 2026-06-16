import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Heart, HeartFilled, MapPin, Personas, Puerta, WhatsApp } from "./icons";
import { COLORS } from "../theme/colors";
import type { PropiedadListado } from "../services/feed";
import { useSession } from "../lib/auth";
import { useFavoritos } from "../lib/favoritos";

type Props = {
  propiedad: PropiedadListado;
  onPress?: () => void;
  onReservar?: () => void;
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <BlurView
      intensity={30}
      tint="light"
      className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-full overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
    >
      {children}
    </BlurView>
  );
}

const TIPO_LABEL: Record<PropiedadListado["tipo"], string> = {
  finca: "Finca",
  apartamento: "Apto",
  casa: "Casa",
};

export function PropiedadCard({ propiedad, onPress, onReservar }: Props) {
  const router = useRouter();
  const { user } = useSession();
  const { esFavorito, toggleFavorito } = useFavoritos();
  const favorito = esFavorito(propiedad.id);

  const onPressFavorito = () => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Necesitas una cuenta para guardar favoritos",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar sesión", onPress: () => router.push("/auth/login") },
        ]
      );
      return;
    }
    void toggleFavorito(propiedad.id, "propiedad");
  };

  return (
    <View
      className="flex-1 rounded-2xl overflow-hidden bg-white border border-line"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${propiedad.titulo}, ${propiedad.ciudad}`}
      >
        {/* Imagen + badges */}
        <View
          className="h-[120px]"
          style={{ backgroundColor: COLORS.imagePlaceholder }}
        >
          {propiedad.imagen ? (
            <Image
              source={propiedad.imagen}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : null}
          <View className="absolute bottom-2 left-2 right-2 flex-row gap-1">
            <Pill>
              <Personas size={11} color={COLORS.text} />
              <Text className="text-[9px] font-quicksand-bold text-ink">
                {propiedad.capacidad}
              </Text>
            </Pill>
            <Pill>
              <Puerta size={11} color={COLORS.text} />
              <Text className="text-[9px] font-quicksand-bold text-ink">
                {propiedad.habitaciones} hab
              </Text>
            </Pill>
            <Pill>
              <Text className="text-[9px] font-quicksand-bold text-ink">
                {TIPO_LABEL[propiedad.tipo]}
              </Text>
            </Pill>
          </View>
        </View>

        {/* Tipo (línea superior pequeña) + título */}
        <View className="px-3 pt-2.5">
          <Text className="text-[10px] font-quicksand-semibold uppercase tracking-wider text-muted">
            {TIPO_LABEL[propiedad.tipo]}
          </Text>
          <Text
            className="font-quicksand-bold text-[15px] text-ink"
            numberOfLines={1}
          >
            {propiedad.titulo}
          </Text>
        </View>

        {/* Precio + ubicación */}
        <View className="px-3 pt-1.5 pb-2.5">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-quicksand-bold text-[15px] text-ink">
              ${propiedad.precio}
            </Text>
            <Text className="text-[10px] font-quicksand-medium text-muted">
              pesos/día
            </Text>
          </View>
          <View className="flex-row items-center gap-1 mt-0.5">
            <MapPin size={10} color={COLORS.muted} />
            <Text
              className="text-[10.5px] font-quicksand-medium text-muted"
              numberOfLines={1}
            >
              {propiedad.ciudad}, {propiedad.departamento}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Botón de favorito — sibling del Pressable principal para evitar anidar buttons */}
      <Pressable
        onPress={onPressFavorito}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
      >
        {favorito ? (
          <HeartFilled size={13} color={COLORS.accent} />
        ) : (
          <Heart size={13} color={COLORS.text} />
        )}
      </Pressable>

      {/* Botón Reservar */}
      <Pressable
        onPress={onReservar}
        accessibilityRole="button"
        accessibilityLabel={`Reservar ${propiedad.titulo}`}
        className="mx-3 mb-3 mt-auto flex-row items-center justify-center gap-1.5 h-9 rounded-xl bg-accent"
        style={{
          shadowColor: COLORS.accent,
          shadowOpacity: 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <WhatsApp size={14} color={COLORS.white} />
        <Text className="font-quicksand-bold text-[12.5px] text-white">
          Reservar
        </Text>
      </Pressable>
    </View>
  );
}
