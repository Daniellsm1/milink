// Variante del PhotoPicker para edición: distingue fotos existentes (URL remota)
// de fotos nuevas (URI local del image picker). Slots posicionales: no compacta
// al borrar, para mantener el orden de las imágenes.
import { Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "../icons";
import { COLORS } from "../../theme/colors";

export type FotoEdit =
  | { tipo: "existente"; url: string }
  | { tipo: "nueva"; uri: string };

const SLOTS = [0, 1, 2];

type Props = {
  fotos: (FotoEdit | null)[];
  onChange: (fotos: (FotoEdit | null)[]) => void;
};

export function PhotoPickerEdit({ fotos, onChange }: Props) {
  const pickAt = async (index: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus fotos para reemplazar las imágenes."
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

    const next = [...fotos];
    next[index] = { tipo: "nueva", uri: result.assets[0].uri };
    onChange(next);
  };

  const removeAt = (index: number) => {
    const next = [...fotos];
    next[index] = null;
    onChange(next);
  };

  const cantidad = fotos.filter((f) => f !== null).length;

  return (
    <View className="mb-4">
      <Text className="text-[13px] text-ink font-quicksand-semibold mb-1.5">
        Fotografías (exactamente 3)
      </Text>
      <View className="flex-row gap-3">
        {SLOTS.map((slot) => {
          const foto = fotos[slot];
          if (foto) {
            const source =
              foto.tipo === "existente" ? foto.url : { uri: foto.uri };
            return (
              <View key={slot} className="flex-1 aspect-square">
                <Image
                  source={source}
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
                <Pressable
                  onPress={() => pickAt(slot)}
                  accessibilityRole="button"
                  accessibilityLabel={`Cambiar foto ${slot + 1}`}
                  className="absolute bottom-1.5 left-1.5 right-1.5 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(15,23,42,0.7)" }}
                >
                  <Text className="text-[11px] text-white font-quicksand-bold">
                    Cambiar
                  </Text>
                </Pressable>
              </View>
            );
          }
          return (
            <Pressable
              key={slot}
              onPress={() => pickAt(slot)}
              accessibilityRole="button"
              accessibilityLabel={`Agregar foto ${slot + 1}`}
              className="flex-1 aspect-square rounded-2xl items-center justify-center bg-[#F1F5F9] border border-dashed border-line"
            >
              <Camera size={24} color={COLORS.muted} />
              <Text className="text-[11px] text-muted font-quicksand-medium mt-1">
                Foto {slot + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="text-[12px] text-muted font-quicksand-medium mt-1.5">
        {cantidad}/3 fotos seleccionadas
      </Text>
    </View>
  );
}
