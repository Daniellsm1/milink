import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { Heart, MapPin, Users, Settings, Fuel, Zap, WhatsApp } from "./icons";
import { COLORS } from "../theme/colors";
import type { Disponible } from "../data/mock";

type Props = {
  vehicle: Disponible;
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

export function VehicleCard({ vehicle, onPress, onReservar }: Props) {
  const transLabel =
    vehicle.trans === "Automático"
      ? "Auto"
      : vehicle.trans === "Manual"
      ? "Man"
      : "Sec";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${vehicle.brand} ${vehicle.model}, ${vehicle.loc}`}
      className="flex-1 rounded-2xl overflow-hidden bg-white border border-line"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      {/* Imagen + badges */}
      <View
        className="h-[120px]"
        style={{ backgroundColor: COLORS.imagePlaceholder }}
      >
        <Image
          source={vehicle.img}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <View
          className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          <Heart size={13} color={COLORS.text} />
        </View>
        <View className="absolute bottom-2 left-2 right-2 flex-row gap-1">
          <Pill>
            {vehicle.fuel === "Eléctrico" ? (
              <Zap size={11} color={COLORS.text} />
            ) : (
              <Fuel size={11} color={COLORS.text} />
            )}
            <Text className="text-[9px] font-quicksand-bold text-ink">
              {vehicle.fuel}
            </Text>
          </Pill>
          <Pill>
            <Users size={11} color={COLORS.text} />
            <Text className="text-[9px] font-quicksand-bold text-ink">
              {vehicle.seats}
            </Text>
          </Pill>
          <Pill>
            <Settings size={11} color={COLORS.text} />
            <Text className="text-[9px] font-quicksand-bold text-ink">
              {transLabel}
            </Text>
          </Pill>
        </View>
      </View>

      {/* Marca + modelo */}
      <View className="px-3 pt-2.5">
        <Text className="text-[10px] font-quicksand-semibold uppercase tracking-wider text-muted">
          {vehicle.brand}
        </Text>
        <Text className="font-quicksand-bold text-[15px] text-ink">
          {vehicle.model}
        </Text>
      </View>

      {/* Precio + ubicación */}
      <View className="px-3 pt-1.5 pb-2.5">
        <View className="flex-row items-baseline gap-1">
          <Text className="font-quicksand-bold text-[15px] text-ink">
            ${vehicle.price}
          </Text>
          <Text className="text-[10px] font-quicksand-medium text-muted">
            pesos/día
          </Text>
        </View>
        <View className="flex-row items-center gap-1 mt-0.5">
          <MapPin size={10} color={COLORS.muted} />
          <Text className="text-[10.5px] font-quicksand-medium text-muted">
            {vehicle.loc}
          </Text>
        </View>
      </View>

      {/* Botón Reservar */}
      <Pressable
        onPress={onReservar}
        accessibilityRole="button"
        accessibilityLabel={`Reservar ${vehicle.brand} ${vehicle.model}`}
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
    </Pressable>
  );
}
