import { Text, TextInput, View } from "react-native";
import { COLORS } from "../../theme/colors";

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  keyboardType?: "default" | "numeric" | "email-address";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View className="mb-4">
      <Text className="text-[13px] text-ink font-quicksand-semibold mb-1.5">
        {label}
      </Text>
      <TextInput
        className={`rounded-2xl px-4 text-[15px] text-ink font-quicksand-medium bg-[#F1F5F9] ${
          error ? "border border-red-400" : ""
        }`}
        style={{
          height: multiline ? 100 : 52,
          textAlignVertical: multiline ? "top" : "center",
          paddingTop: multiline ? 12 : 0,
        }}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
      />
      {error ? (
        <Text className="text-[12px] text-red-500 font-quicksand-medium mt-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
