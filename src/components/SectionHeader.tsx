import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "./icons";
import { COLORS } from "../theme/colors";

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, action = "Ver todo", onAction }: Props) {
  return (
    <View className="flex-row items-end justify-between px-5 mb-3">
      <Text className="font-quicksand-bold text-[20px] text-ink">{title}</Text>
      <Pressable
        onPress={onAction}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={action}
        className="flex-row items-center gap-0.5"
      >
        <Text className="font-quicksand-semibold text-[12px] text-accent">
          {action}
        </Text>
        <ChevronRight size={14} color={COLORS.accent} />
      </Pressable>
    </View>
  );
}
