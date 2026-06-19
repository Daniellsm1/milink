import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../../src/lib/auth";
import { esAdmin } from "../../src/lib/admins";
import { COLORS } from "../../src/theme/colors";
import { ChevronLeft, ChevronRight, Flag, MapPin } from "../../src/components/icons";
import { listarPendientes } from "../../src/services/moderacion";

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading } = useSession();

  const admin = esAdmin(user);

  // Redirige si no es admin (o si no hay sesión).
  useEffect(() => {
    if (loading) return;
    if (!user || !admin) {
      router.replace("/(tabs)");
    }
  }, [loading, user, admin, router]);

  const pendientesQuery = useQuery({
    queryKey: ["pendientes"],
    queryFn: listarPendientes,
    enabled: admin,
  });

  if (!user || !admin) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-2 gap-2 border-b border-line">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={26} color={COLORS.text} />
        </Pressable>
        <View className="flex-1">
          <Text className="font-quicksand-bold text-[18px] text-ink">
            Panel de moderación
          </Text>
          <Text className="text-[12px] text-muted font-quicksand-medium">
            Publicaciones pendientes de aprobación
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/admin/reportes")}
          accessibilityRole="button"
          accessibilityLabel="Reportes de UGC"
          hitSlop={8}
          className="flex-row items-center gap-1.5 rounded-full px-3 h-9 border border-line"
        >
          <Flag size={16} color="#DC2626" />
          <Text className="text-[13px] font-quicksand-bold text-ink">
            Reportes
          </Text>
        </Pressable>
      </View>

      {/* Lista */}
      <FlatList
        data={pendientesQuery.data ?? []}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={pendientesQuery.isRefetching}
            onRefresh={() => pendientesQuery.refetch()}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={
          pendientesQuery.isLoading ? (
            <View className="items-center mt-20">
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : (
            <View className="items-center mt-20 px-6">
              <Text className="font-quicksand-bold text-[16px] text-ink text-center">
                ¡Todo al día!
              </Text>
              <Text className="text-[13px] text-muted font-quicksand-medium text-center mt-1">
                No hay publicaciones pendientes de revisión.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push(`/admin/moderar/${item.tipo}/${item.id}`)
            }
            accessibilityRole="button"
            accessibilityLabel={`Moderar ${item.titulo}`}
            className="rounded-2xl bg-white border border-line overflow-hidden active:opacity-80"
            style={{
              shadowColor: "#0F172A",
              shadowOpacity: 0.05,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              {item.imagenes[0] ? (
                <Image
                  source={item.imagenes[0]}
                  style={{ width: 100, height: 100 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View
                  className="items-center justify-center"
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: COLORS.categoryBg,
                  }}
                >
                  <Text className="text-[10px] text-muted font-quicksand-medium">
                    Sin foto
                  </Text>
                </View>
              )}
              <View className="flex-1 p-3">
                <Text className="text-[10px] uppercase tracking-wider font-quicksand-semibold text-accent">
                  {item.tipo === "vehiculo" ? "Vehículo" : "Propiedad"}
                </Text>
                <Text
                  className="font-quicksand-bold text-[15px] text-ink mt-0.5"
                  numberOfLines={1}
                >
                  {item.titulo}
                </Text>
                <Text
                  className="text-[11.5px] text-muted font-quicksand-medium mt-0.5"
                  numberOfLines={1}
                >
                  Por {item.nombre_propietario ?? "Propietario"}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <MapPin size={12} color={COLORS.muted} />
                  <Text className="text-[12px] text-muted font-quicksand-medium">
                    {item.ciudad}
                  </Text>
                </View>
                <Text className="font-quicksand-bold text-[13px] text-ink mt-1">
                  {item.precio.toLocaleString("es-CO")} COP{" "}
                  <Text className="text-[11px] text-muted font-quicksand-medium">
                    / día
                  </Text>
                </Text>
              </View>
              <View className="pr-3">
                <ChevronRight size={20} color={COLORS.muted} />
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
