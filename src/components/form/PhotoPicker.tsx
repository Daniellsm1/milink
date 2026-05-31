import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, Plus, X } from "../icons";
import { COLORS } from "../../theme/colors";

const SLOTS = [0, 1, 2];

export function PhotoPicker({
  uris,
  onChange,
}: {
  uris: string[];
  onChange: (uris: string[]) => void;
}) {
  const pickAt = async (index: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus fotos para adjuntar las imágenes."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.[0]) return;

    const next = [...uris];
    next[index] = result.assets[0].uri;
    // compactar para no dejar huecos
    onChange(next.filter(Boolean));
  };

  const removeAt = (index: number) => {
    onChange(uris.filter((_, i) => i !== index));
  };

  return (
    <View className="mb-4">
      <Text className="text-[13px] text-ink font-quicksand-semibold mb-1.5">
        Fotografías (exactamente 3)
      </Text>
      <View className="flex-row gap-3">
        {SLOTS.map((slot) => {
          const uri = uris[slot];
          if (uri) {
            return (
              <View key={slot} className="flex-1 aspect-square">
                <Image
                  source={uri}
                  style={{ width: "100%", height: "100%", borderRadius: 16 }}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => removeAt(slot)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar foto ${slot + 1}`}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(15,23,42,0.7)" }}
                >
                  <X size={15} color={COLORS.white} />
                </Pressable>
              </View>
            );
          }
          const isNext = slot === uris.length;
          return (
            <Pressable
              key={slot}
              onPress={() => (isNext ? pickAt(slot) : undefined)}
              disabled={!isNext}
              accessibilityRole="button"
              accessibilityLabel={`Agregar foto ${slot + 1}`}
              className="flex-1 aspect-square rounded-2xl items-center justify-center bg-[#F1F5F9] border border-dashed border-line"
              style={{ opacity: isNext ? 1 : 0.5 }}
            >
              {isNext ? (
                <Camera size={24} color={COLORS.muted} />
              ) : (
                <Plus size={22} color={COLORS.muted} />
              )}
              <Text className="text-[11px] text-muted font-quicksand-medium mt-1">
                Foto {slot + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="text-[12px] text-muted font-quicksand-medium mt-1.5">
        {uris.length}/3 fotos seleccionadas
      </Text>
    </View>
  );
}
