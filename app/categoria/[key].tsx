// Pantalla por categoría: muestra solo publicaciones reales aprobadas.
// Las 6 keys de CategoriaKey deciden si es vehículo o propiedad.
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin, Settings, Users } from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { VehicleCard } from "../../src/components/VehicleCard";
import { FiltrosSheet } from "../../src/components/FiltrosSheet";
import {
  listarPropiedadesAprobadas,
  listarVehiculosAprobados,
  type FiltrosPropiedad,
  type FiltrosVehiculo,
} from "../../src/services/feed";
import type {
  CategoriaKey,
} from "../../src/data/mock";
import type {
  PropiedadTipo,
  VehiculoCategoria,
} from "../../src/types/database";

// Mapeo de las 6 categorías a su modo.
const ES_VEHICULO: Record<CategoriaKey, boolean> = {
  camionetas: true,
  carros: true,
  motos: true,
  apartamentos: false,
  casas: false,
  fincas: false,
};

const KEY_A_CATEGORIA_VEH: Partial<Record<CategoriaKey, VehiculoCategoria>> = {
  camionetas: "camioneta",
  carros: "automovil",
  motos: "motocicleta",
};

const KEY_A_TIPO_PROP: Partial<Record<CategoriaKey, PropiedadTipo>> = {
  apartamentos: "apartamento",
  casas: "casa",
  fincas: "finca",
};

const LABELS: Record<CategoriaKey, string> = {
  camionetas: "Camionetas",
  carros: "Carros",
  motos: "Motos",
  apartamentos: "Apartamentos",
  casas: "Casas",
  fincas: "Fincas",
};

export default function CategoriaScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const categoriaKey = (key ?? "carros") as CategoriaKey;
  const esVehiculo = ES_VEHICULO[categoriaKey];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtrosVeh, setFiltrosVeh] = useState<FiltrosVehiculo>({
    categoria: KEY_A_CATEGORIA_VEH[categoriaKey],
  });
  const [filtrosProp, setFiltrosProp] = useState<FiltrosPropiedad>({
    tipoPropiedad: KEY_A_TIPO_PROP[categoriaKey],
  });

  const vehiculosQuery = useQuery({
    queryKey: ["vehiculos-aprobados", filtrosVeh],
    queryFn: () => listarVehiculosAprobados(filtrosVeh),
    enabled: esVehiculo,
  });

  const propiedadesQuery = useQuery({
    queryKey: ["propiedades-aprobadas", filtrosProp],
    queryFn: () => listarPropiedadesAprobadas(filtrosProp),
    enabled: !esVehiculo,
  });

  const cargando = esVehiculo
    ? vehiculosQuery.isLoading
    : propiedadesQuery.isLoading;
  const vacio = esVehiculo
    ? (vehiculosQuery.data ?? []).length === 0
    : (propiedadesQuery.data ?? []).length === 0;

  const filtrosActivos = useMemo(() => {
    const f = esVehiculo ? filtrosVeh : filtrosProp;
    const keys = Object.keys(f).filter((k) => {
      const v = (f as Record<string, unknown>)[k];
      // Ignorar la categoría/tipo fijo de la URL
      if (esVehiculo && k === "categoria") return false;
      if (!esVehiculo && k === "tipoPropiedad") return false;
      return v != null && v !== "";
    });
    return keys.length;
  }, [esVehiculo, filtrosVeh, filtrosProp]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 gap-2 bg-white border-b border-line">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
        >
          <ChevronLeft size={26} color={COLORS.text} />
        </Pressable>
        <Text className="flex-1 font-quicksand-bold text-[18px] text-ink">
          {LABELS[categoriaKey]}
        </Text>
        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Filtrar"
          className="h-10 px-4 rounded-full items-center justify-center flex-row gap-1.5 bg-accent active:opacity-90"
        >
          <Text className="font-quicksand-bold text-[13px] text-white">
            Filtrar{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
          </Text>
        </Pressable>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : vacio ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-quicksand-bold text-[16px] text-ink text-center">
            Aún no hay publicaciones en {LABELS[categoriaKey]}.
          </Text>
          <Text className="text-[13px] text-muted font-quicksand-medium text-center mt-1">
            {filtrosActivos > 0
              ? "Prueba quitando filtros o vuelve más tarde."
              : "Vuelve más tarde o publica el tuyo."}
          </Text>
        </View>
      ) : esVehiculo ? (
        <FlatList
          data={vehiculosQuery.data ?? []}
          keyExtractor={(v) => v.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => router.push(`/vehicle/${item.id}`)}
              onReservar={() => router.push(`/vehicle/${item.id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          data={propiedadesQuery.data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ gap: 12, padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/vehicle/${item.id}`)}
              className="rounded-2xl bg-white border border-line overflow-hidden"
              style={{
                shadowColor: "#0F172A",
                shadowOpacity: 0.05,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
              }}
            >
              <View className="flex-row">
                {item.imagen ? (
                  <Image
                    source={item.imagen}
                    style={{ width: 110, height: 110 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View
                    style={{
                      width: 110,
                      height: 110,
                      backgroundColor: COLORS.categoryBg,
                    }}
                  />
                )}
                <View className="flex-1 p-3">
                  <Text
                    className="font-quicksand-bold text-[15px] text-ink"
                    numberOfLines={1}
                  >
                    {item.titulo}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MapPin size={12} color={COLORS.muted} />
                    <Text className="text-[12px] text-muted font-quicksand-medium">
                      {item.ciudad}, {item.departamento}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3 mt-1.5">
                    <View className="flex-row items-center gap-1">
                      <Users size={12} color={COLORS.muted} />
                      <Text className="text-[12px] text-muted font-quicksand-medium">
                        {item.capacidad}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Settings size={12} color={COLORS.muted} />
                      <Text className="text-[12px] text-muted font-quicksand-medium">
                        {item.habitaciones} hab.
                      </Text>
                    </View>
                  </View>
                  <Text className="font-quicksand-bold text-[14px] text-accent mt-1.5">
                    ${item.precio}{" "}
                    <Text className="text-[11px] text-muted font-quicksand-medium">
                      /día
                    </Text>
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Sheet de filtros */}
      {esVehiculo ? (
        <FiltrosSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          mode="vehiculo"
          categoriaFija={KEY_A_CATEGORIA_VEH[categoriaKey]}
          value={filtrosVeh}
          onApply={setFiltrosVeh}
        />
      ) : (
        <FiltrosSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          mode="propiedad"
          tipoFijo={KEY_A_TIPO_PROP[categoriaKey]}
          value={filtrosProp}
          onApply={setFiltrosProp}
        />
      )}
    </SafeAreaView>
  );
}
