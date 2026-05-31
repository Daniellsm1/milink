import { Pressable, Text, View } from "react-native";
import { Check } from "../icons";
import { COLORS } from "../../theme/colors";

export function Checkbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      className="flex-row items-start gap-3 py-2"
    >
      <View
        className={`w-6 h-6 rounded-md items-center justify-center mt-0.5 ${
          checked ? "bg-accent" : "bg-white border-2 border-line"
        }`}
      >
        {checked ? <Check size={16} color={COLORS.white} /> : null}
      </View>
      <Text className="flex-1 text-[13.5px] text-ink font-quicksand-medium leading-5">
        {label}
      </Text>
    </Pressable>
  );
}
