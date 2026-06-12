// Skeletons por pantalla: imitan la estructura real mientras cargan los datos.
// Todos comparten CardSkeleton (forma de VehicleCard/PropiedadCard).
import { ScrollView, View } from "react-native";
import { Skeleton } from "./Skeleton";

/** Card vertical que imita VehicleCard/PropiedadCard en gris. */
export function CardSkeleton() {
  return (
    <View className="flex-1 rounded-2xl overflow-hidden bg-white border border-line">
      {/* Imagen */}
      <Skeleton width="100%" height={120} borderRadius={0} />
      <View className="px-3 pt-2.5 pb-3" style={{ gap: 8 }}>
        {/* Título */}
        <Skeleton width="60%" height={16} />
        {/* Precio */}
        <Skeleton width="40%" height={14} />
        {/* Ubicación */}
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

/** Grid 2-col de cards skeleton (reutilizado por varias pantallas). */
function GridSkeleton({ filas }: { filas: number }) {
  return (
    <View style={{ gap: 12, paddingHorizontal: 20 }}>
      {Array.from({ length: filas }).map((_, i) => (
        <View key={i} className="flex-row" style={{ gap: 12 }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ))}
    </View>
  );
}

/** Skeleton de Explorar: carrusel + píldoras + grid (mismo orden que la pantalla). */
export function ExplorerSkeleton() {
  return (
    <View>
      {/* Nuevas entradas: 3 cards horizontales */}
      <View className="pt-2 pb-5">
        <View className="px-5 mb-3">
          <Skeleton width={150} height={20} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              className="rounded-2xl overflow-hidden bg-white border border-line"
              style={{ width: 200 }}
            >
              <Skeleton width="100%" height={120} borderRadius={0} />
              <View className="px-3 py-2.5" style={{ gap: 7 }}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="45%" height={12} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Categorías: 6 píldoras */}
      <View className="pb-6">
        <View className="px-5 mb-3">
          <Skeleton width={120} height={20} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} className="items-center" style={{ gap: 6 }}>
              <Skeleton width={58} height={82} borderRadius={29} />
              <Skeleton width={48} height={10} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Disponibles: grid de 4 cards */}
      <View className="px-5 mb-3">
        <Skeleton width={170} height={20} />
      </View>
      <GridSkeleton filas={2} />
    </View>
  );
}

/** Skeleton de Favoritos: grid 2-col de 4 cards. */
export function FavoritesSkeleton() {
  return (
    <View style={{ paddingTop: 16 }}>
      <GridSkeleton filas={2} />
    </View>
  );
}

/** Skeleton de Categoría: grid 2-col de 6 cards. */
export function CategoriaSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={{ paddingVertical: 16 }}
    >
      <GridSkeleton filas={3} />
    </ScrollView>
  );
}
