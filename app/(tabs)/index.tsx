import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

const VEHICULOS_DEMO = ["1", "2", "3"];

export default function Explorar() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 gap-4">
        <View className="bg-slate-100 rounded-xl p-4">
          <Text className="text-slate-400">Buscar por ciudad…</Text>
        </View>

        <View>
          <Text className="text-lg font-bold text-slate-900 mb-2">
            Nuevos ingresos
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {VEHICULOS_DEMO.map((id) => (
                <View
                  key={id}
                  className="w-40 h-28 bg-slate-200 rounded-xl items-center justify-center"
                >
                  <Text className="text-slate-500">Vehículo {id}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View>
          <Text className="text-lg font-bold text-slate-900 mb-2">
            Catálogo
          </Text>
          <Text className="text-slate-400 mb-3">
            Filtros: ciudad · fechas · tipo · precio
          </Text>
          <View className="gap-3">
            {VEHICULOS_DEMO.map((id) => (
              <Pressable
                key={id}
                onPress={() => router.push(`/vehicle/${id}`)}
                className="bg-slate-100 rounded-xl p-4"
              >
                <Text className="font-semibold text-slate-900">
                  Vehículo {id}
                </Text>
                <Text className="text-slate-500">Toca para ver detalle</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
