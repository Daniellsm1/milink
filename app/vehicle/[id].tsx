import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, Keyframe } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Fuel,
  Gauge,
  Heart,
  HeartFilled,
  MapPin,
  Seat,
  Settings,
  Share2,
  Star,
  WhatsApp,
} from "../../src/components/icons";
import { Avatar } from "../../src/components/Avatar";
import { COLORS } from "../../src/theme/colors";
import {
  getDetalleById,
  type CaracteristicaIcono,
} from "../../src/data/detail";

// Animación "hero": la imagen del detalle aparece con fade + un leve zoom,
// evocando un shared element (la tarjeta que "crece" hacia el detalle).
const heroEnter = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 1.08 }] },
  100: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(380);

const ICONO_CARACTERISTICA: Record<
  CaracteristicaIcono,
  (p: { size?: number; color?: string }) => React.ReactNode
> = {
  combustible: (p) => <Fuel {...p} />,
  transmision: (p) => <Settings {...p} />,
  asientos: (p) => <Seat {...p} />,
  ano: (p) => <Calendar {...p} />,
  kilometraje: (p) => <Gauge {...p} />,
  ubicacion: (p) => <MapPin {...p} />,
};

export default function DetalleVehiculo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const item = getDetalleById(id ?? "");
  const [favorito, setFavorito] = useState(false);
  const [carruselW, setCarruselW] = useState(0);
  const [indice, setIndice] = useState(0);

  if (!item) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6 gap-4">
        <Text className="font-quicksand-bold text-lg text-ink">
          No encontramos esta publicación.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-accent rounded-full px-6 py-3"
        >
          <Text className="text-white font-quicksand-bold">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const compartir = async () => {
    try {
      await Share.share({
        message: `${item.titulo} en ${item.ubicacion} por $${item.precioDia} COP/día. ¡Mira esta publicación en Milink!`,
      });
    } catch {
      // el usuario canceló o no hay apps para compartir
    }
  };

  const reservarPorWhatsApp = async () => {
    const mensaje = `Hola, estoy interesado en reservar ${item.titulo} visto en la app Milink. ¿Sigue disponible?`;
    const url = `https://wa.me/${item.propietario.telefono}?text=${encodeURIComponent(
      mensaje
    )}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "No se pudo abrir WhatsApp",
        "Verifica que tengas WhatsApp instalado."
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Carrusel de imágenes. El contenedor externo NO lleva transform
            (es el hermano del contenido con marginTop negativo); el efecto
            hero (fade + zoom) va en un wrapper interno para no romper el
            apilamiento en web. */}
        <View
          onLayout={(e) => setCarruselW(e.nativeEvent.layout.width)}
          style={{ height: 320, overflow: "hidden" }}
        >
          <Animated.View entering={heroEnter} style={{ flex: 1 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                if (carruselW > 0) {
                  setIndice(
                    Math.round(e.nativeEvent.contentOffset.x / carruselW)
                  );
                }
              }}
            >
              {item.imagenes.map((uri, i) => (
                <Image
                  key={i}
                  source={uri}
                  style={{ width: carruselW || 360, height: 320 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
              ))}
            </ScrollView>

            {/* Dots */}
            {item.imagenes.length > 1 ? (
              <View className="absolute bottom-4 left-0 right-0 flex-row items-center justify-center gap-1.5">
                {item.imagenes.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: i === indice ? 20 : 7,
                      height: 7,
                      borderRadius: 999,
                      backgroundColor:
                        i === indice ? COLORS.white : "rgba(255,255,255,0.6)",
                    }}
                  />
                ))}
              </View>
            ) : null}
          </Animated.View>
        </View>

        {/* Barra flotante superior */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="w-11 h-11 rounded-2xl items-center justify-center bg-white"
            style={shadow}
          >
            <ChevronLeft size={24} color={COLORS.text} />
          </Pressable>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setFavorito((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                favorito ? "Quitar de favoritos" : "Agregar a favoritos"
              }
              className="w-11 h-11 rounded-2xl items-center justify-center bg-white"
              style={shadow}
            >
              {favorito ? (
                <HeartFilled size={22} color="#EF4444" />
              ) : (
                <Heart size={22} color={COLORS.text} />
              )}
            </Pressable>
            <Pressable
              onPress={compartir}
              accessibilityRole="button"
              accessibilityLabel="Compartir"
              className="w-11 h-11 rounded-2xl items-center justify-center bg-white"
              style={shadow}
            >
              <Share2 size={20} color={COLORS.text} />
            </Pressable>
          </View>
        </View>

        {/* Contenido (fade suave, ligeramente después del hero) */}
        <Animated.View
          entering={FadeIn.duration(320).delay(120)}
          className="bg-white rounded-t-[28px] px-5 pt-6"
          style={{ marginTop: -24 }}
        >
          {/* Título + ubicación + precio */}
          <Text className="font-quicksand-bold text-[26px] text-ink">
            {item.titulo}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1.5">
            <MapPin size={16} color={COLORS.muted} />
            <Text className="text-[14px] text-muted font-quicksand-medium">
              {item.ubicacion}
            </Text>
          </View>
          <Text className="font-quicksand-bold text-[20px] text-ink mt-2.5">
            {item.precioDia} COP{" "}
            <Text className="text-[15px] text-muted font-quicksand-medium">
              / Día
            </Text>
          </Text>

          {/* Grid de características */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 18 }}
          >
            {item.caracteristicas.map((c, i) => (
              <View
                key={i}
                className="w-[84px] rounded-2xl bg-white border border-line items-center py-3"
                style={shadowSoft}
              >
                <View className="w-12 h-12 rounded-full bg-accentSoft items-center justify-center mb-2">
                  {ICONO_CARACTERISTICA[c.icono]({
                    size: 22,
                    color: COLORS.text,
                  })}
                </View>
                <Text
                  className="text-[12px] text-ink font-quicksand-semibold text-center px-1"
                  numberOfLines={1}
                >
                  {c.etiqueta}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Descripción */}
          <Text className="font-quicksand-bold text-[18px] text-ink mb-2">
            Descripción
          </Text>
          <Text className="text-[14.5px] text-muted font-quicksand-medium leading-6">
            {item.descripcion}
          </Text>

          {/* Propietario */}
          <Text className="font-quicksand-bold text-[18px] text-ink mt-6 mb-3">
            Propietario
          </Text>
          <View className="flex-row items-center gap-3 mb-4">
            <Avatar size={52} />
            <View>
              <Text className="font-quicksand-bold text-[16px] text-ink">
                {item.propietario.nombre}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Star size={14} color="#F59E0B" />
                <Text className="text-[13px] text-ink font-quicksand-semibold">
                  {item.propietario.calificacion.toFixed(1)}
                </Text>
                <Text className="text-[13px] text-muted font-quicksand-medium">
                  ({item.propietario.resenas})
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Barra de acción inferior fija */}
      <View
        className="absolute left-0 right-0 bottom-0 flex-row items-center justify-between bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12, ...shadowTop }}
      >
        <View>
          <Text className="font-quicksand-bold text-[20px] text-ink">
            {item.precioDia}
          </Text>
          <Text className="text-[12px] text-muted font-quicksand-medium">
            COP / Día
          </Text>
        </View>
        <Pressable
          onPress={reservarPorWhatsApp}
          accessibilityRole="button"
          accessibilityLabel="Reservar por WhatsApp"
          className="flex-row items-center gap-2.5 h-14 px-6 rounded-full bg-[#22C55E] active:opacity-90"
          style={{
            shadowColor: "#22C55E",
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <WhatsApp size={22} color={COLORS.white} />
          <Text className="font-quicksand-bold text-[15px] text-white">
            Reservar por WhatsApp
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
} as const;

const shadowSoft = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
} as const;

const shadowTop = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: -3 },
  elevation: 12,
} as const;
