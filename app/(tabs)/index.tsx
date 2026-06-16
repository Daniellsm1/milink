import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchBar } from "../../src/components/SearchBar";
import { SectionHeader } from "../../src/components/SectionHeader";
import { NewArrivalsCarousel } from "../../src/components/NewArrivalsCarousel";
import { BeneficiosCarousel } from "../../src/components/BeneficiosCarousel";
import { CategoryPill } from "../../src/components/CategoryPill";
import { VehicleCard } from "../../src/components/VehicleCard";
import { PropiedadCard } from "../../src/components/PropiedadCard";
import { FiltrosSheet } from "../../src/components/FiltrosSheet";
import { Heart, Menu } from "../../src/components/icons";
import { DrawerMenu } from "../../src/components/DrawerMenu";
import { ExplorerSkeleton } from "../../src/components/skeletons";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import { COLORS } from "../../src/theme/colors";
import { CATEGORIAS, DISPONIBLES, NUEVAS } from "../../src/data/mock";
import {
  buscarMixto,
  listarMixtoAprobado,
  listarNuevasEntradas,
  listarVehiculosAprobados,
  type DisponibleMixto,
  type FiltrosVehiculo,
} from "../../src/services/feed";

function HeaderIconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-9 h-9 rounded-full items-center justify-center bg-white border border-line"
    >
      {children}
    </Pressable>
  );
}

export default function Explorar() {
  const router = useRouter();
  const tabBarH = useTabBarHeight();

  const [filtros, setFiltros] = useState<FiltrosVehiculo>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Búsqueda libre: input inmediato + valor debounced (350ms) para la query.
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(busquedaInput.trim()), 350);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  const filtrosActivos = useMemo(
    () =>
      Object.values(filtros).filter((v) => v != null && v !== "").length,
    [filtros]
  );

  // Carrusel "Nuevas entradas": últimas 5 publicaciones aprobadas (veh + prop).
  const nuevasQuery = useQuery({
    queryKey: ["nuevas-entradas"],
    queryFn: () => listarNuevasEntradas(5),
    staleTime: 30_000,
  });
  const nuevasReales = nuevasQuery.data ?? [];
  // Si no hay datos reales, caen los mocks (NUEVAS) como fallback.
  const nuevas = nuevasReales.length > 0 ? nuevasReales : NUEVAS;

  // "Disponibles para ti": sin filtros → mixto veh+prop reales;
  // con filtros → solo vehículos filtrados.
  const mixtoQuery = useQuery({
    queryKey: ["mixto-aprobado"],
    queryFn: () => listarMixtoAprobado(40),
    staleTime: 30_000,
    enabled: filtrosActivos === 0,
  });
  const filtradosQuery = useQuery({
    queryKey: ["vehiculos-filtrados", filtros],
    queryFn: () => listarVehiculosAprobados(filtros, 40),
    staleTime: 30_000,
    enabled: filtrosActivos > 0,
  });

  // Búsqueda libre sobre el feed mixto (server-side, separada de filtros).
  const buscando = busqueda.length > 0;
  const busquedaQuery = useQuery({
    queryKey: ["busqueda-mixta", busqueda],
    queryFn: () => buscarMixto(busqueda, 40),
    staleTime: 30_000,
    enabled: buscando,
    placeholderData: keepPreviousData,
  });

  // Mientras cargan las queries iniciales mostramos skeletons (no mocks).
  const cargandoExplorar =
    filtrosActivos === 0 && (mixtoQuery.isLoading || nuevasQuery.isLoading);

  // Lista final de cards mixtas. Si no hay filtros y la consulta mixta terminó
  // vacía, caemos a los mocks (vehículos) para que la pantalla no quede vacía.
  const disponibles: DisponibleMixto[] = useMemo(() => {
    if (buscando) return busquedaQuery.data ?? [];
    if (filtrosActivos > 0) {
      return (filtradosQuery.data ?? []).map((v) => ({
        kind: "vehiculo",
        data: v,
      }));
    }
    if (cargandoExplorar) return [];
    const mixto = mixtoQuery.data ?? [];
    if (mixto.length > 0) return mixto;
    return DISPONIBLES.map((v) => ({ kind: "vehiculo", data: v }));
  }, [
    buscando,
    busquedaQuery.data,
    filtrosActivos,
    cargandoExplorar,
    filtradosQuery.data,
    mixtoQuery.data,
  ]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <FlatList
        data={disponibles}
        keyExtractor={(item) => `${item.kind}-${item.data.id}`}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 12, paddingBottom: tabBarH + 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          item.kind === "vehiculo" ? (
            <VehicleCard
              vehicle={item.data}
              onPress={() => router.push(`/vehicle/${item.data.id}`)}
              onReservar={() => router.push("/auth/register")}
            />
          ) : (
            <PropiedadCard
              propiedad={item.data}
              onPress={() => router.push(`/vehicle/${item.data.id}`)}
              onReservar={() => router.push("/auth/register")}
            />
          )
        }
        ListHeaderComponent={
          <View>
            {/* Hero */}
            <View className="px-5 pt-3 pb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2.5">
                  <Image
                    source={require("../../assets/milink-icon.png")}
                    style={{ width: 40, height: 40, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <Text className="font-quicksand-bold text-[19px] text-ink">
                    Milink
                  </Text>
                </View>
                <View className="flex-row items-center gap-2.5">
                  <HeaderIconButton
                    label="Favoritos"
                    onPress={() => router.push("/(tabs)/favorites")}
                  >
                    <Heart size={17} color={COLORS.text} />
                  </HeaderIconButton>
                  <HeaderIconButton
                    label="Menú"
                    onPress={() => setDrawerOpen(true)}
                  >
                    <Menu size={20} color={COLORS.text} />
                  </HeaderIconButton>
                </View>
              </View>
              <SearchBar
                value={busquedaInput}
                onChangeText={setBusquedaInput}
                onSubmit={() => setBusqueda(busquedaInput.trim())}
              />
            </View>

            {cargandoExplorar ? (
              // Skeletons mientras cargan las queries iniciales
              <ExplorerSkeleton />
            ) : buscando ? (
              <SectionHeader
                title={`Resultados para "${busqueda}"`}
                hideAction
              />
            ) : (
              <View>
                {/* Nuevas entradas */}
                <View className="pt-2 pb-5">
                  <SectionHeader title="Nuevas entradas" />
                  <NewArrivalsCarousel
                    data={nuevas}
                    onPressItem={(item) => router.push(`/vehicle/${item.id}`)}
                  />
                </View>

                {/* Categorías */}
                <View className="pb-6">
                  <SectionHeader title="Categorías" action="Explorar" />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                  >
                    {CATEGORIAS.map((cat) => (
                      <CategoryPill
                        key={cat.key}
                        category={cat}
                        onPress={() => router.push(`/categoria/${cat.key}`)}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* Disponibles (encabezado; la grilla es el FlatList) */}
                <SectionHeader
                  title="Disponibles para ti"
                  action={
                    filtrosActivos > 0
                      ? `Filtrar (${filtrosActivos})`
                      : "Filtrar"
                  }
                  onAction={() => setSheetOpen(true)}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          buscando && !busquedaQuery.isFetching && disponibles.length === 0 ? (
            <View className="items-center mt-20 px-6">
              <Text className="font-quicksand-bold text-[16px] text-ink text-center">
                No encontramos resultados
              </Text>
              <Text className="text-[13px] text-muted font-quicksand-medium text-center mt-1">
                Intenta con otro nombre, marca o ciudad.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          cargandoExplorar || buscando ? null : (
            <View className="pt-6 pb-2">
              <SectionHeader title="¿Por qué MiLink?" hideAction />
              <BeneficiosCarousel />
            </View>
          )
        }
      />

      {/* Sheet de filtros para "Disponibles para ti" */}
      <FiltrosSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        mode="vehiculo"
        value={filtros}
        onApply={setFiltros}
      />

      {/* Drawer lateral con navegación a docs y cuenta */}
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </SafeAreaView>
  );
}
