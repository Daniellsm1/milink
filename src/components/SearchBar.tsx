import { Pressable, TextInput, View } from "react-native";
import { Search } from "./icons";
import { COLORS } from "../theme/colors";

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
};

export function SearchBar({ value, onChangeText, onSubmit }: Props) {
  return (
    <View
      className="flex-row items-center gap-2.5 rounded-2xl px-4 h-12 bg-white border border-line"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      <Search size={18} color={COLORS.muted} />
      <TextInput
        className="flex-1 text-[14px] text-ink font-quicksand-medium"
        placeholder="Busca carros, fincas, apartamentos…"
        placeholderTextColor={COLORS.muted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      <Pressable
        onPress={onSubmit}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Buscar"
        className="w-8 h-8 rounded-xl items-center justify-center bg-accent"
      >
        <Search size={15} color={COLORS.white} />
      </Pressable>
    </View>
  );
}
