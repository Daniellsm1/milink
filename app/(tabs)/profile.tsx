import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSession } from "../../src/lib/auth";
import { User } from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";

export default function Perfil() {
  const router = useRouter();
  const { user, signOut } = useSession();

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6 gap-4">
        <Text className="font-quicksand-bold text-xl text-ink">Tu perfil</Text>
        <Text className="text-muted font-quicksand-medium text-center">
          Inicia sesión para ver tus publicaciones, reservas y calificaciones.
        </Text>
        <Pressable
          onPress={() => router.push("/auth/login")}
          className="bg-accent rounded-full px-6 py-3"
        >
          <Text className="text-white font-quicksand-bold">
            Iniciar sesión / Registrarse
          </Text>
        </Pressable>
      </View>
    );
  }

  const nombre = (user.user_metadata?.nombre as string | undefined) ?? null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1 items-center p-6 gap-4">
        <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center mt-6">
          <User size={36} color={COLORS.accent} />
        </View>
        {nombre ? (
          <Text className="font-quicksand-bold text-xl text-ink">{nombre}</Text>
        ) : null}
        <Text className="text-muted font-quicksand-medium">{user.email}</Text>

        <View className="w-full mt-6 gap-3">
          <Pressable
            onPress={() => router.push("/publish")}
            className="bg-accent rounded-2xl px-6 py-4 items-center"
          >
            <Text className="text-white font-quicksand-bold">
              Publicar un bien
            </Text>
          </Pressable>
          <Pressable
            onPress={signOut}
            className="rounded-2xl px-6 py-4 items-center border border-line"
          >
            <Text className="text-ink font-quicksand-semibold">
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
