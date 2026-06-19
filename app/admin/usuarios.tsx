// Administración de usuarios registrados (solo admin).
// Lista todos los usuarios de auth.users (vía RPC) con su resumen de publicaciones
// y permite eliminarlos en cascada. El admin no puede eliminarse a sí mismo.
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../src/lib/auth";
import { esAdmin } from "../../src/lib/admins";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Trash,
  Users,
  WhatsApp,
} from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { UsuariosSkeleton } from "../../src/components/skeletons";
import {
  eliminarUsuario,
  listarUsuariosRegistrados,
} from "../../src/services/adminUsuarios";
import type { UsuarioRegistrado } from "../../src/types/database";
import { useWebMaxWidth } from "../../src/lib/responsive";

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const headerOptions = (
  <Stack.Screen
    options={{
      title: "Usuarios registrados",
      headerStyle: { backgroundColor: COLORS.bg },
      headerTintColor: COLORS.accent,
      headerTitleStyle: {
        fontFamily: "Quicksand_700Bold",
        color: COLORS.text,
      },
    }}
  />
);

export default function UsuariosAdmin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useSession();

  const admin = esAdmin(user);
  const tabBarH = useTabBarHeight();
  const webMax = useWebMaxWidth(820);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !admin) router.replace("/(tabs)");
  }, [loading, user, admin, router]);

  const usuariosQuery = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: listarUsuariosRegistrados,
    enabled: admin,
  });

  const eliminarMut = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
    },
    onError: (e) =>
      Alert.alert(
        "No se pudo eliminar",
        e instanceof Error ? e.message : "Inténtalo de nuevo."
      ),
    onSettled: () => setEliminandoId(null),
  });

  const confirmarEliminar = (u: UsuarioRegistrado) => {
    Alert.alert(
      "Eliminar usuario",
      `Esto borrará permanentemente a ${
        u.nombre || u.email
      } y todas sus publicaciones, fotos y reseñas. Esta acción es irreversible. ¿Continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setEliminandoId(u.id);
            eliminarMut.mutate(u.id);
          },
        },
      ]
    );
  };

  if (!admin) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {headerOptions}
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (usuariosQuery.isLoading) {
    return (
      <View className="flex-1 bg-white">
        {headerOptions}
        <UsuariosSkeleton />
      </View>
    );
  }

  if (usuariosQuery.isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        {headerOptions}
        <Text className="font-quicksand-bold text-[17px] text-ink text-center">
          No pudimos cargar los usuarios
        </Text>
        <Pressable
          onPress={() => usuariosQuery.refetch()}
          className="bg-accent rounded-full px-8 h-12 items-center justify-center mt-6"
        >
          <Text className="text-white font-quicksand-bold text-[14px]">
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  const usuarios = usuariosQuery.data ?? [];

  if (usuarios.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        {headerOptions}
        <View className="w-20 h-20 rounded-full bg-accentSoft items-center justify-center">
          <Users size={36} color={COLORS.accent} />
        </View>
        <Text className="font-quicksand-bold text-[17px] text-ink text-center mt-5">
          No hay usuarios registrados
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {headerOptions}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: tabBarH + 24,
          gap: 12,
          ...(webMax ?? {}),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={usuariosQuery.isRefetching}
            onRefresh={() => usuariosQuery.refetch()}
            tintColor={COLORS.accent}
          />
        }
      >
        {usuarios.map((u) => (
          <UsuarioCard
            key={u.id}
            usuario={u}
            esYo={u.id === user?.id}
            eliminando={eliminandoId === u.id}
            onEliminar={() => confirmarEliminar(u)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function UsuarioCard({
  usuario,
  esYo,
  eliminando,
  onEliminar,
}: {
  usuario: UsuarioRegistrado;
  esYo: boolean;
  eliminando: boolean;
  onEliminar: () => void;
}) {
  const [expandido, setExpandido] = useState(false);

  const nombre = usuario.nombre || usuario.email;
  const inicial = (nombre || "?").trim().charAt(0).toUpperCase() || "?";
  const telLimpio = usuario.telefono
    ? usuario.telefono.replace(/\D/g, "")
    : "";

  const abrirWhatsApp = async () => {
    if (!telLimpio) return;
    try {
      await Linking.openURL(`https://wa.me/${telLimpio}`);
    } catch {
      Alert.alert(
        "No se pudo abrir WhatsApp",
        "Verifica que tengas WhatsApp instalado."
      );
    }
  };

  const total = usuario.total_publicaciones;
  const pubs = usuario.publicaciones ?? [];

  return (
    <View
      className="bg-white border border-line rounded-2xl p-4"
      style={{ opacity: eliminando ? 0.5 : 1 }}
    >
      <View className="flex-row items-center" style={{ gap: 12 }}>
        {/* Avatar iniciales */}
        <View className="w-12 h-12 rounded-full bg-accentSoft items-center justify-center">
          <Text className="font-quicksand-bold text-[18px] text-accent">
            {inicial}
          </Text>
        </View>

        {/* Nombre + email */}
        <View style={{ flex: 1 }}>
          <Text
            className="font-quicksand-bold text-ink text-[15px]"
            numberOfLines={1}
          >
            {nombre}
          </Text>
          <Text className="text-muted text-sm font-quicksand-medium" numberOfLines={1}>
            {usuario.email}
          </Text>
        </View>

        {/* Acción derecha: Tú (admin) o caneca */}
        {esYo ? (
          <View className="items-center" style={{ gap: 2 }}>
            <ShieldCheck size={22} color={COLORS.accent} />
            <Text className="text-[11px] text-muted font-quicksand-semibold">
              Tú
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onEliminar}
            disabled={eliminando}
            accessibilityRole="button"
            accessibilityLabel="Eliminar usuario"
            className="w-11 h-11 rounded-xl items-center justify-center active:opacity-70"
            style={{ backgroundColor: "#FEF2F2" }}
          >
            {eliminando ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Trash size={20} color="#DC2626" />
            )}
          </Pressable>
        )}
      </View>

      {/* Teléfono */}
      <View className="mt-3">
        {telLimpio ? (
          <Pressable
            onPress={abrirWhatsApp}
            accessibilityRole="button"
            accessibilityLabel="Contactar por WhatsApp"
            className="flex-row items-center active:opacity-70"
            style={{ gap: 6 }}
          >
            <WhatsApp size={16} color={COLORS.accent} />
            <Text className="text-[13.5px] text-accent font-quicksand-semibold">
              {usuario.telefono}
            </Text>
          </Pressable>
        ) : (
          <Text className="text-[13.5px] text-muted font-quicksand-medium">
            Sin teléfono
          </Text>
        )}
      </View>

      {/* Publicaciones */}
      <View className="mt-2">
        {total === 0 ? (
          <Text className="text-[13.5px] text-muted font-quicksand-medium">
            Sin publicaciones
          </Text>
        ) : total === 1 ? (
          <Text className="text-[13.5px] text-ink font-quicksand-medium">
            {capitalize(pubs[0].categoria)}: {pubs[0].resumen}
          </Text>
        ) : (
          <>
            <Pressable
              onPress={() => setExpandido((v) => !v)}
              accessibilityRole="button"
              className="flex-row items-center active:opacity-70"
              style={{ gap: 6 }}
            >
              <Text className="text-[13.5px] text-ink font-quicksand-semibold">
                {total} publicaciones
              </Text>
              {expandido ? (
                <ChevronUp size={16} color={COLORS.muted} />
              ) : (
                <ChevronDown size={16} color={COLORS.muted} />
              )}
            </Pressable>
            {expandido ? (
              <View className="mt-2" style={{ gap: 4 }}>
                {pubs.map((p) => (
                  <Text
                    key={p.id}
                    className="text-sm text-muted font-quicksand-medium"
                  >
                    {capitalize(p.categoria)}: {p.resumen}
                  </Text>
                ))}
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
