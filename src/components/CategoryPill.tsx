import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "../theme/colors";
import type { Categoria, CategoriaKey } from "../data/mock";

type Props = {
  category: Categoria;
  onPress?: () => void;
};

const CATEGORY_IMAGES: Record<CategoriaKey, number> = {
  camionetas: require("../../assets/camionetas.webp"),
  carros: require("../../assets/carros.webp"),
  motos: require("../../assets/motos.webp"),
  apartamentos: require("../../assets/apartamentos.webp"),
  casas: require("../../assets/casas.webp"),
  fincas: require("../../assets/fincas.webp"),
};

const BASE_IMAGE_SIZE = 44;
// camionetas y carros se ven un poco más pequeñas que el resto
// (mucho aire interno en el WebP) → escalamos +10%.
const CATEGORY_IMAGE_SIZE: Partial<Record<CategoriaKey, number>> = {
  camionetas: BASE_IMAGE_SIZE * 1.1,
  carros: BASE_IMAGE_SIZE * 1.1,
};

export function CategoryPill({ category, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      className="items-center gap-1.5"
    >
      <View
        className="w-[58px] h-[82px] items-center justify-center rounded-full"
        style={{
          backgroundColor: COLORS.categoryBg,
          borderWidth: 1.5,
          borderColor: COLORS.accent,
          // glow verde (aprox. del box-shadow del mockup)
          shadowColor: COLORS.accent,
          shadowOpacity: 0.3,
          shadowRadius: 9,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }}
      >
        <Image
          source={CATEGORY_IMAGES[category.key]}
          style={{
            width: CATEGORY_IMAGE_SIZE[category.key] ?? BASE_IMAGE_SIZE,
            height: CATEGORY_IMAGE_SIZE[category.key] ?? BASE_IMAGE_SIZE,
          }}
          contentFit="contain"
        />
      </View>
      <Text className="text-[10.5px] font-quicksand-semibold text-center text-ink">
        {category.label}
      </Text>
    </Pressable>
  );
}
