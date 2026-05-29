import { Text, View } from "react-native";

export default function Favoritos() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-xl font-bold text-slate-900">Favoritos</Text>
      <Text className="text-slate-500 mt-2 text-center">
        Aquí aparecerán los vehículos que guardes como favoritos.
      </Text>
    </View>
  );
}
