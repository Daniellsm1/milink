import { useEffect } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../../src/lib/auth";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import { MisPublicacionesSkeleton } from "../../src/components/skeletons";
import { ClipboardList } from "../../src/components/icons";
import {
  getMisPublicaciones,
  type PublicacionPropia,
} from "../../src/services/misPublicaciones";
import { COLORS } from "../../src/theme/colors";
import { useWebMaxWidth } from "../../src/lib/responsive";

const STATUS_LABEL: Record<PublicacionPropia["status"], string> = {
  pending_approval: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const STATUS_STYLE: Record<
  PublicacionPropia["status"],
  { bg: string; text: string }
> = {
  pending_approval: { bg: "bg-amber-100", text: "text-amber-700" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { bg: "bg-red-100", text: "text-red-700" },
};

function formatearPrecio(valor: number) {
  return `$${valor.toLocaleString("es-CO")}`;
}

export default function MisPublicaciones() {
  const router = useRouter();
  const { session, user, loading: loadingSession } = useSession();
  const tabBarH = useTabBarHeight();
  const webMax = useWebMaxWidth(720);

  useEffect(() => {
    if (!loadingSession && !session) {
      router.replace("/auth/login");
    }
  }, [loadingSession, session, router]);

  const query = useQuery({
    queryKey: ["mis-publicaciones", user?.id],
    queryFn: () => getMisPublicaciones(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  if (!session || query.isLoading) {
    return (
      <View className="flex-1 bg-white">
        <MisPublicacionesSkeleton />
      </View>
    );
  }

  const items = query.data ?? [];
  const refrescando = query.isFetching && !query.isLoading;

  if (query.isError && items.length === 0) {
    return (
      <EmptyContainer paddingBottom={tabBarH + 16}>
        <ClipboardList size={64} color={COLORS.muted} />
        <Text className="font-quicksand-bold text-[17px] text-ink text-center mt-4">
          No pudimos cargar tus publicaciones
        </Text>
        <Text className="font-quicksand-medium text-[14px] text-muted text-center mt-2 leading-5">
          Revisa tu conexión a internet e inténtalo de nuevo.
        </Text>
        <Pressable
          onPress={() => query.refetch()}
          className="bg-accent rounded-full px-8 h-12 items-center justify-center mt-6 active:opacity-90"
        >
          <Text className="text-white font-quicksand-bold text-[14px]">
            Reintentar
          </Text>
        </Pressable>
      </EmptyContainer>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyContainer paddingBottom={tabBarH + 16}>
        <ClipboardList size={64} color={COLORS.muted} />
        <Text className="font-quicksand-medium text-[16px] text-ink text-center mt-4">
          Aún no tienes publicaciones
        </Text>
        <Text className="font-quicksand-medium text-[13px] text-muted text-center mt-2 leading-5">
          Publica tu primer vehículo o propiedad para empezar a recibir
          reservas.
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/publish")}
          className="bg-accent rounded-full px-8 h-12 items-center justify-center mt-6 active:opacity-90"
          style={{
            shadowColor: COLORS.accent,
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 5,
          }}
        >
          <Text className="text-white font-quicksand-bold text-[14px]">
            Publicar ahora
          </Text>
        </Pressable>
      </EmptyContainer>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 16,
          paddingBottom: tabBarH + 16,
          gap: 12,
          ...(webMax ?? {}),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => query.refetch()}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        renderItem={({ item }) => (
          <PublicacionCard
            item={item}
            onPress={() => router.push(`/vehicle/${item.id}`)}
            onEditar={() =>
              router.push(
                `/mis-publicaciones/editar/${item.tipo}/${item.id}` as never
              )
            }
          />
        )}
      />
    </View>
  );
}

function PublicacionCard({
  item,
  onPress,
  onEditar,
}: {
  item: PublicacionPropia;
  onPress: () => void;
  onEditar: () => void;
}) {
  const primeraImagen = item.imagenes[0];
  const tipoLabel = item.tipo === "vehiculo" ? "Vehículo" : "Propiedad";
  const status = STATUS_STYLE[item.status];
  const puedeEditar = item.status === "approved" || item.status === "rejected";

  return (
    <View
      className="bg-white rounded-2xl overflow-hidden border border-line"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={{ aspectRatio: 16 / 9, position: "relative" }}>
          {primeraImagen ? (
            <Image
              source={{ uri: primeraImagen }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View className="w-full h-full bg-line" />
          )}
          <View
            className="absolute top-2 left-2 rounded px-2 py-1"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <Text className="text-white font-quicksand-semibold text-[11px]">
              {tipoLabel}
            </Text>
          </View>
        </View>

        <View className="px-4 pt-3 pb-3" style={{ gap: 6 }}>
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="flex-1 font-quicksand-semibold text-[15px] text-ink"
              numberOfLines={1}
            >
              {item.titulo}
            </Text>
            <View className={`rounded-full px-2.5 py-1 ${status.bg}`}>
              <Text
                className={`font-quicksand-semibold text-[11px] ${status.text}`}
              >
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
          </View>
          <Text
            className="font-quicksand-medium text-[13px] text-muted"
            numberOfLines={1}
          >
            {item.ciudad} · {formatearPrecio(item.precio_alquiler_diario)}/día
          </Text>
          {item.status === "rejected" && item.motivo_rechazo ? (
            <View className="mt-1 rounded-lg bg-red-50 p-3">
              <Text className="font-quicksand-bold text-[12.5px] text-red-700 mb-1">
                Motivo del rechazo
              </Text>
              <Text className="font-quicksand-medium text-[13px] text-red-700 leading-5">
                {item.motivo_rechazo}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {puedeEditar ? (
        <View className="px-4 pb-3">
          <Pressable
            onPress={onEditar}
            accessibilityRole="button"
            accessibilityLabel="Editar publicación"
            className="rounded-full border border-accent h-10 items-center justify-center active:opacity-80"
          >
            <Text className="text-accent font-quicksand-bold text-[13px]">
              Editar
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function EmptyContainer({
  children,
  paddingBottom,
}: {
  children: React.ReactNode;
  paddingBottom: number;
}) {
  return (
    <View
      className="flex-1 bg-white items-center justify-center px-8"
      style={{ paddingBottom }}
    >
      {children}
    </View>
  );
}
