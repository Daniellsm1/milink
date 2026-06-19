import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSession } from "../../src/lib/auth";
import { esAdmin } from "../../src/lib/admins";
import {
  ChevronRight,
  ClipboardList,
  User,
  Users,
} from "../../src/components/icons";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import { COLORS } from "../../src/theme/colors";
import { useEliminarCuenta } from "../../src/lib/eliminarCuentaFlow";

const DANGER = "#DC2626";

export default function Perfil() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const tabBarH = useTabBarHeight();
  const eliminarCuenta = useEliminarCuenta();

  if (!user) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center p-6 gap-4"
        style={{ paddingBottom: tabBarH + 16 }}
      >
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
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          padding: 24,
          gap: 16,
          paddingBottom: tabBarH + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center mt-6">
          <User size={36} color={COLORS.accent} />
        </View>
        {nombre ? (
          <Text className="font-quicksand-bold text-xl text-ink">{nombre}</Text>
        ) : null}
        <Text className="text-muted font-quicksand-medium">{user.email}</Text>

        <View className="w-full mt-6 gap-3">
          <Pressable
            onPress={() => router.push("/mis-publicaciones")}
            className="rounded-2xl px-5 py-4 flex-row items-center gap-3 border border-line"
          >
            <ClipboardList size={22} color={COLORS.accent} />
            <Text className="flex-1 text-ink font-quicksand-semibold">
              Mis publicaciones
            </Text>
            <ChevronRight size={18} color={COLORS.muted} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/publish")}
            className="bg-accent rounded-2xl px-6 py-4 items-center"
          >
            <Text className="text-white font-quicksand-bold">
              Publicar un bien
            </Text>
          </Pressable>
          {esAdmin(user) ? (
            <Pressable
              onPress={() => router.push("/admin")}
              className="rounded-2xl px-6 py-4 items-center border-2"
              style={{ borderColor: COLORS.accent }}
            >
              <Text className="text-accent font-quicksand-bold">
                Panel de moderación
              </Text>
            </Pressable>
          ) : null}
          {esAdmin(user) ? (
            <Pressable
              onPress={() => router.push("/admin/usuarios")}
              className="rounded-2xl px-5 py-4 flex-row items-center gap-3 border-2"
              style={{ borderColor: COLORS.accent }}
            >
              <Users size={22} color={COLORS.accent} />
              <Text className="flex-1 text-accent font-quicksand-bold">
                Usuarios registrados
              </Text>
              <ChevronRight size={18} color={COLORS.accent} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={signOut}
            className="rounded-2xl px-6 py-4 items-center border border-line"
          >
            <Text className="text-ink font-quicksand-semibold">
              Cerrar sesión
            </Text>
          </Pressable>
          <Pressable
            onPress={eliminarCuenta.trigger}
            accessibilityRole="button"
            accessibilityLabel="Eliminar mi cuenta"
            className="rounded-2xl px-6 py-4 items-center border"
            style={{ borderColor: DANGER }}
          >
            <Text className="font-quicksand-bold" style={{ color: DANGER }}>
              Eliminar mi cuenta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      {eliminarCuenta.modal}
    </SafeAreaView>
  );
}
