import { ScrollView, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function DetalleVehiculo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 gap-4">
        <View className="w-full h-48 bg-slate-200 rounded-xl items-center justify-center">
          <Text className="text-slate-500">Galería de fotos</Text>
        </View>

        <Text className="text-2xl font-bold text-slate-900">
          Vehículo {id}
        </Text>

        <View className="gap-1">
          <Text className="text-lg font-semibold text-slate-900">
            Ficha técnica
          </Text>
          <Text className="text-slate-500">
            Marca · modelo · año · tipo de caja · combustible · cilindraje ·
            puertas · pasajeros · SOAT · tecnomecánica
          </Text>
        </View>

        <View className="gap-1">
          <Text className="text-lg font-semibold text-slate-900">
            Disponibilidad
          </Text>
          <Text className="text-slate-500">Calendario de fechas</Text>
        </View>

        <View className="gap-1">
          <Text className="text-lg font-semibold text-slate-900">
            Calificaciones y reseñas
          </Text>
          <Text className="text-slate-500">⭐⭐⭐⭐⭐</Text>
        </View>

        <View className="flex-row gap-3 mt-2">
          <Pressable className="flex-1 bg-green-600 rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">WhatsApp</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/auth/register")}
            className="flex-1 bg-slate-900 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-semibold">Reservar</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
