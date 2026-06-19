import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../src/lib/auth";
import { esAdmin } from "../../src/lib/admins";
import { COLORS } from "../../src/theme/colors";
import { ChevronLeft, Check, ChevronRight, Flag } from "../../src/components/icons";
import {
  listarReportes,
  marcarReporteResuelto,
  type ReporteAdmin,
} from "../../src/services/reportes";
import { useWebMaxWidth } from "../../src/lib/responsive";

const DANGER = "#DC2626";

export default function ReportesAdmin() {
  const router = useRouter();
  const { user, loading } = useSession();
  const admin = esAdmin(user);
  const queryClient = useQueryClient();
  const webMax = useWebMaxWidth(820);

  useEffect(() => {
    if (loading) return;
    if (!user || !admin) router.replace("/(tabs)");
  }, [loading, user, admin, router]);

  const reportesQuery = useQuery({
    queryKey: ["reportes"],
    queryFn: listarReportes,
    enabled: admin,
  });

  const resolverMutation = useMutation({
    mutationFn: (id: string) => marcarReporteResuelto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportes"] });
    },
    onError: (e) => {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "No se pudo marcar como resuelto."
      );
    },
  });

  const verPublicacion = (r: ReporteAdmin) => {
    // El detalle es la misma ruta para vehículo y propiedad.
    router.push(`/vehicle/${r.objeto_id}`);
  };

  if (!user || !admin) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 pt-2 pb-2 gap-2 border-b border-line"
        style={webMax ?? undefined}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={26} color={COLORS.text} />
        </Pressable>
        <View>
          <Text className="font-quicksand-bold text-[18px] text-ink">
            Reportes de UGC
          </Text>
          <Text className="text-[12px] text-muted font-quicksand-medium">
            Contenido reportado por usuarios
          </Text>
        </View>
      </View>

      <FlatList
        data={reportesQuery.data ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, gap: 12, ...(webMax ?? {}) }}
        refreshControl={
          <RefreshControl
            refreshing={reportesQuery.isRefetching}
            onRefresh={() => reportesQuery.refetch()}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={
          reportesQuery.isLoading ? (
            <View className="items-center mt-20">
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : (
            <View className="items-center mt-20 px-6">
              <Text className="font-quicksand-bold text-[16px] text-ink text-center">
                Sin reportes
              </Text>
              <Text className="text-[13px] text-muted font-quicksand-medium text-center mt-1">
                Cuando alguien reporte una publicación aparecerá aquí.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View
            className="rounded-2xl bg-white border border-line p-4 gap-2"
            style={{
              shadowColor: "#0F172A",
              shadowOpacity: 0.05,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
              opacity: item.resuelto ? 0.6 : 1,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Flag size={16} color={DANGER} />
              <Text
                className="text-[10px] uppercase tracking-wider font-quicksand-semibold"
                style={{ color: DANGER }}
              >
                {item.tipo}
              </Text>
              {item.resuelto ? (
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#DCFCE7" }}
                >
                  <Text
                    className="text-[10px] font-quicksand-bold"
                    style={{ color: "#15803D" }}
                  >
                    RESUELTO
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="font-quicksand-bold text-[15px] text-ink" numberOfLines={1}>
              {item.resumen ?? "Publicación eliminada"}
            </Text>
            <Text className="text-[13.5px] text-muted font-quicksand-medium leading-5">
              {item.motivo}
            </Text>
            <Text className="text-[11.5px] text-muted font-quicksand-medium">
              Reportado por {item.reportante_email || "usuario eliminado"}
            </Text>
            <View className="flex-row gap-2 mt-2">
              <Pressable
                onPress={() => verPublicacion(item)}
                className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl px-4 py-2.5 border border-line"
              >
                <Text className="text-ink font-quicksand-semibold text-[13px]">
                  Ver publicación
                </Text>
                <ChevronRight size={16} color={COLORS.text} />
              </Pressable>
              {item.resuelto ? null : (
                <Pressable
                  onPress={() => resolverMutation.mutate(item.id)}
                  disabled={resolverMutation.isPending}
                  className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl px-4 py-2.5 bg-accent"
                  style={{ opacity: resolverMutation.isPending ? 0.7 : 1 }}
                >
                  <Check size={16} color={COLORS.white} />
                  <Text className="text-white font-quicksand-bold text-[13px]">
                    Marcar resuelto
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
