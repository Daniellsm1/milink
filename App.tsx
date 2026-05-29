import "./global.css";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center p-6">
      <Text className="text-white text-2xl font-bold text-center">
        ¡MiLink App Funcionando!
      </Text>
      <Text className="text-slate-400 text-sm mt-2 text-center">
        SDK 54 + NativeWind estable
      </Text>
    </View>
  );
}