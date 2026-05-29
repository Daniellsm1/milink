import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Heart, MapPin } from "./icons";
import { COLORS } from "../theme/colors";
import type { NuevaEntrada } from "../data/mock";

type Props = {
  item: NuevaEntrada;
  onPress?: () => void;
};

export function NewArrivalCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.loc}, $${item.price} por día`}
      className="w-[200px] rounded-2xl overflow-hidden bg-white border border-line"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      <View
        className="h-[120px]"
        style={{ backgroundColor: COLORS.imagePlaceholder }}
      >
        <Image
          source={item.img}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <View className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-accent">
          <Text className="text-[9px] font-quicksand-bold tracking-wider text-white">
            {item.tag}
          </Text>
        </View>
        <View
          className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          <Heart size={13} color={COLORS.text} />
        </View>
      </View>
      <View className="p-3">
        <Text
          numberOfLines={1}
          className="font-quicksand-bold text-[13.5px] text-ink"
        >
          {item.name}
        </Text>
        <View className="flex-row items-center gap-1 mt-1">
          <MapPin size={11} color={COLORS.muted} />
          <Text className="text-[11px] text-muted font-quicksand">
            {item.loc}
          </Text>
        </View>
        <View className="mt-2 flex-row items-baseline gap-1">
          <Text className="font-quicksand-bold text-[14px] text-accent">
            ${item.price}
          </Text>
          <Text className="text-[10px] font-quicksand-medium text-muted">
            /día
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
