import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { ChevronDown } from "../icons";
import { COLORS } from "../../theme/colors";
import { COUNTRY_CODES } from "../../lib/validation/publicacion";

export function CountryCodeSelect({
  value,
  onChange,
  error,
}: {
  value: string; // dial, ej. "+57"
  onChange: (dial: string) => void;
  error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const actual = COUNTRY_CODES.find((c) => c.dial === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Indicativo de país"
        className={`flex-row items-center gap-1.5 rounded-2xl px-3 bg-[#F1F5F9] ${
          error ? "border border-red-400" : ""
        }`}
        style={{ height: 52 }}
      >
        <Text className="text-[16px]">{actual?.flag ?? "🏳️"}</Text>
        <Text className="text-[15px] text-ink font-quicksand-semibold">
          {value}
        </Text>
        <ChevronDown size={16} color={COLORS.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15,23,42,0.5)" }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl pt-3 pb-6"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center pb-2">
              <View className="w-10 h-1 rounded-full bg-line" />
            </View>
            <Text className="font-quicksand-bold text-[16px] text-ink text-center mb-2">
              Indicativo de país
            </Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(c) => c.dial}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => {
                const activo = item.dial === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.dial);
                      setOpen(false);
                    }}
                    className="flex-row items-center gap-3 px-6 py-3.5 active:opacity-60"
                  >
                    <Text className="text-[20px]">{item.flag}</Text>
                    <Text className="flex-1 text-[15px] text-ink font-quicksand-medium">
                      {item.label}
                    </Text>
                    <Text
                      className={`text-[15px] font-quicksand-bold ${
                        activo ? "text-accent" : "text-muted"
                      }`}
                    >
                      {item.dial}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
