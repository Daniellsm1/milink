import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { CATEGORY_ICONS } from "./icons";
import { COLORS } from "../theme/colors";
import type { Categoria } from "../data/mock";

type Props = {
  category: Categoria;
  onPress?: () => void;
};

export function CategoryPill({ category, onPress }: Props) {
  const Icon = CATEGORY_ICONS[category.key];
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
        {category.key === "camionetas" ? (
          <Image
            source={require("../../assets/camionetas.webp")}
            style={{ width: 44, height: 44 }}
            contentFit="contain"
          />
        ) : (
          <Icon size={32} color={COLORS.accent} />
        )}
      </View>
      <Text className="text-[10.5px] font-quicksand-semibold text-center text-ink">
        {category.label}
      </Text>
    </Pressable>
  );
}
