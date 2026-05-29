import { Text, View } from "react-native";

export default function Publicar() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-xl font-bold text-slate-900">Publicar vehículo</Text>
      <Text className="text-slate-500 mt-2 text-center">
        Formulario con los datos técnicos del vehículo y carga de hasta 3 fotos.
      </Text>
    </View>
  );
}
