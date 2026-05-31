import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function Perfil() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center p-6 gap-4">
      <Text className="text-xl font-bold text-slate-900">Tu perfil</Text>
      <Text className="text-slate-500 text-center">
        Inicia sesión para ver tus publicaciones, reservas y calificaciones.
      </Text>
      <Pressable
        onPress={() => router.push("/auth/login")}
        className="bg-slate-900 rounded-xl px-6 py-3"
      >
        <Text className="text-white font-semibold">
          Iniciar sesión / Registrarse
        </Text>
      </Pressable>
    </View>
  );
}
