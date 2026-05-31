import { Pressable, Text, View } from "react-native";

export type SelectOption<T extends string> = { value: T; label: string };

export function FormSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  error?: string | null;
}) {
  return (
    <View className="mb-4">
      <Text className="text-[13px] text-ink font-quicksand-semibold mb-1.5">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`px-4 py-2.5 rounded-full border ${
                active
                  ? "bg-accent border-accent"
                  : "bg-white border-line"
              }`}
            >
              <Text
                className={`text-[13px] font-quicksand-semibold ${
                  active ? "text-white" : "text-ink"
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text className="text-[12px] text-red-500 font-quicksand-medium mt-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
