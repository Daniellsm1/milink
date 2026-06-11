import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyFavoritesIllustration } from "../../src/components/EmptyFavoritesIllustration";
import { VehicleCard } from "../../src/components/VehicleCard";
import { PropiedadCard } from "../../src/components/PropiedadCard";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import { useFavoritos } from "../../src/lib/favoritos";
import {
  listarVehiculosPorIds,
  listarPropiedadesPorIds,
  type PropiedadListado,
} from "../../src/services/feed";
import type { Disponible } from "../../src/data/mock";
import { COLORS } from "../../src/theme/colors";

type ItemFavorito =
  | { kind: "vehiculo"; data: Disponible; addedAt: number }
  | { kind: "propiedad"; data: PropiedadListado; addedAt: number };

export default function Favoritos() {
  const router = useRouter();
  const tabBarH = useTabBarHeight();
  const { favoritos, loading: loadingFav } = useFavoritos();

  const vehiculoIds = useMemo(
    () => favoritos.filter((f) => f.tipo === "vehiculo").map((f) => f.id),
    [favoritos]
  );
  const propiedadIds = useMemo(
    () => favoritos.filter((f) => f.tipo === "propiedad").map((f) => f.id),
    [favoritos]
  );

  const vehQuery = useQuery({
    queryKey: ["favoritos-vehiculos", vehiculoIds],
    queryFn: () => listarVehiculosPorIds(vehiculoIds),
    enabled: vehiculoIds.length > 0,
    staleTime: 30_000,
  });

  const propQuery = useQuery({
    queryKey: ["favoritos-propiedades", propiedadIds],
    queryFn: () => listarPropiedadesPorIds(propiedadIds),
    enabled: propiedadIds.length > 0,
    staleTime: 30_000,
  });

  // Construye la lista final ordenada por addedAt descendente (más recientes primero).
  const items: ItemFavorito[] = useMemo(() => {
    const veh = vehQuery.data ?? [];
    const props = propQuery.data ?? [];
    const lookupVeh = new Map(veh.map((v) => [v.id, v]));
    const lookupProp = new Map(props.map((p) => [p.id, p]));

    return favoritos
      .map((f): ItemFavorito | null => {
        if (f.tipo === "vehiculo") {
          const d = lookupVeh.get(f.id);
          return d ? { kind: "vehiculo", data: d, addedAt: f.addedAt } : null;
        }
        const d = lookupProp.get(f.id);
        return d ? { kind: "propiedad", data: d, addedAt: f.addedAt } : null;
      })
      .filter((x): x is ItemFavorito => x !== null)
      .sort((a, b) => b.addedAt - a.addedAt);
  }, [favoritos, vehQuery.data, propQuery.data]);

  const cargando =
    loadingFav ||
    (vehiculoIds.length > 0 && vehQuery.isLoading) ||
    (propiedadIds.length > 0 && propQuery.isLoading);

  const tieneFavoritos = favoritos.length > 0;
  const ambasFallaron =
    (vehiculoIds.length === 0 || vehQuery.isError) &&
    (propiedadIds.length === 0 || propQuery.isError) &&
    tieneFavoritos &&
    (vehQuery.isError || propQuery.isError);

  const refetchTodo = () => {
    if (vehiculoIds.length > 0) vehQuery.refetch();
    if (propiedadIds.length > 0) propQuery.refetch();
  };

  const refrescando =
    (vehQuery.isFetching && !vehQuery.isLoading) ||
    (propQuery.isFetching && !propQuery.isLoading);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* Header */}
      <View className="pb-3 border-b border-line">
        <Text className="font-quicksand-bold text-[18px] text-ink text-center">
          Favoritos
        </Text>
      </View>

      {/* Subtítulo + badge */}
      <View className="flex-row items-center gap-2.5 px-5 pt-4 pb-2">
        <Text className="font-quicksand-bold text-[20px] text-ink">
          Todos los favoritos
        </Text>
        <View className="bg-accent rounded-full px-3 py-1">
          <Text className="text-white font-quicksand-semibold text-[11px]">
            Predeterminado
          </Text>
        </View>
      </View>

      {!tieneFavoritos && !cargando ? (
        <EmptyState
          title="No tienes favoritos guardados en esta lista."
          subtitle="Usa el icono de favorito para guardar los anuncios que quieras ver más tarde."
          ctaLabel="Continuar buscando"
          onCta={() => router.push("/")}
          paddingBottom={tabBarH + 16}
        />
      ) : ambasFallaron && items.length === 0 ? (
        <EmptyState
          title="No pudimos cargar tus favoritos."
          subtitle="Revisa tu conexión a internet e inténtalo de nuevo."
          ctaLabel="Reintentar"
          onCta={refetchTodo}
          paddingBottom={tabBarH + 16}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.kind}-${item.data.id}`}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{
            gap: 12,
            paddingTop: 8,
            paddingBottom: tabBarH + 16,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={refetchTodo}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
          renderItem={({ item }) =>
            item.kind === "vehiculo" ? (
              <VehicleCard
                vehicle={item.data}
                onPress={() => router.push(`/vehicle/${item.data.id}`)}
                onReservar={() => router.push("/auth/login")}
              />
            ) : (
              <PropiedadCard
                propiedad={item.data}
                onPress={() => router.push(`/vehicle/${item.data.id}`)}
                onReservar={() => router.push("/auth/login")}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

function EmptyState({
  title,
  subtitle,
  ctaLabel,
  onCta,
  paddingBottom,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
  paddingBottom: number;
}) {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingBottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="my-8 items-center">
        <EmptyFavoritesIllustration size={240} />
      </View>

      <Text className="font-quicksand-bold text-[17px] text-ink text-center">
        {title}
      </Text>
      <Text className="font-quicksand-medium text-[14px] text-muted text-center mt-2 leading-5">
        {subtitle}
      </Text>

      <Pressable
        onPress={onCta}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        className="bg-accent rounded-full px-8 h-14 items-center justify-center mt-8 active:opacity-90"
        style={{
          shadowColor: COLORS.accent,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <Text className="text-white font-quicksand-bold text-[15px]">
          {ctaLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
