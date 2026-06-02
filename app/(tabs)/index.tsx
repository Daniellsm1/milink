import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SearchBar } from "../../src/components/SearchBar";
import { SectionHeader } from "../../src/components/SectionHeader";
import { NewArrivalsCarousel } from "../../src/components/NewArrivalsCarousel";
import { CategoryPill } from "../../src/components/CategoryPill";
import { VehicleCard } from "../../src/components/VehicleCard";
import { Heart, Share2, User } from "../../src/components/icons";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import { COLORS } from "../../src/theme/colors";
import { CATEGORIAS, DISPONIBLES, NUEVAS } from "../../src/data/mock";

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

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <FlatList
        data={DISPONIBLES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 12, paddingBottom: tabBarH + 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push(`/vehicle/${item.id}`)}
            onReservar={() => router.push("/auth/register")}
          />
        )}
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
                <View className="flex-row items-center gap-2">
                  <HeaderIconButton label="Favoritos">
                    <Heart size={17} color={COLORS.text} />
                  </HeaderIconButton>
                  <HeaderIconButton label="Compartir">
                    <Share2 size={17} color={COLORS.text} />
                  </HeaderIconButton>
                  <HeaderIconButton
                    label="Perfil"
                    onPress={() => router.push("/profile")}
                  >
                    <User size={17} color={COLORS.text} />
                  </HeaderIconButton>
                </View>
              </View>
              <SearchBar />
            </View>

            {/* Nuevas entradas */}
            <View className="pt-2 pb-5">
              <SectionHeader title="Nuevas entradas" />
              <NewArrivalsCarousel
                data={NUEVAS}
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
                  <CategoryPill key={cat.key} category={cat} />
                ))}
              </ScrollView>
            </View>

            {/* Disponibles (encabezado; la grilla es el FlatList) */}
            <SectionHeader title="Disponibles para ti" action="Filtrar" />
          </View>
        }
      />
    </SafeAreaView>
  );
}
