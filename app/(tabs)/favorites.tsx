import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { EmptyFavoritesIllustration } from "../../src/components/EmptyFavoritesIllustration";
import { VehicleCard } from "../../src/components/VehicleCard";
import type { Disponible } from "../../src/data/mock";
import { COLORS } from "../../src/theme/colors";

export default function Favoritos() {
  const router = useRouter();

  // Aún no hay store de favoritos persistente: lista vacía por ahora.
  const favorites: Disponible[] = [];
  const vacio = favorites.length === 0;

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

      {vacio ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="my-8 items-center">
            <EmptyFavoritesIllustration size={240} />
          </View>

          <Text className="font-quicksand-bold text-[17px] text-ink text-center">
            No tienes favoritos guardados en esta lista.
          </Text>
          <Text className="font-quicksand-medium text-[14px] text-muted text-center mt-2 leading-5">
            Usa el icono de favorito para guardar los anuncios que quieras ver
            más tarde.
          </Text>

          <Pressable
            onPress={() => router.push("/")}
            accessibilityRole="button"
            accessibilityLabel="Continuar buscando"
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
              Continuar buscando
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => router.push(`/vehicle/${item.id}`)}
              onReservar={() => router.push("/auth/login")}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
