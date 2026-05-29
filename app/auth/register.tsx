import { Text, View } from "react-native";

export default function Register() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-xl font-bold text-slate-900">
        Registro y verificación militar
      </Text>
      <Text className="text-slate-500 mt-2 text-center">
        Formulario de registro con verificación de identidad militar. Se solicita
        solo al momento de reservar.
      </Text>
    </View>
  );
}
