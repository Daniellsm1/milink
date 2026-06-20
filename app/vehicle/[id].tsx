import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import Animated, { FadeIn, Keyframe } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Bano,
  Calendar,
  Cama,
  ChevronLeft,
  Flag,
  Fuel,
  Gauge,
  Heart,
  HeartFilled,
  MapPin,
  Personas,
  Puerta,
  Seat,
  Settings,
  Share2,
  Star,
  UserX,
  WhatsApp,
} from "../../src/components/icons";
import { Avatar } from "../../src/components/Avatar";
import { COLORS } from "../../src/theme/colors";
import {
  fetchContactoPublicacion,
  fetchDetalleById,
  type CaracteristicaIcono,
} from "../../src/data/detail";
import { useSession } from "../../src/lib/auth";
import { reportar } from "../../src/services/reportes";
import { bloquearUsuario } from "../../src/services/bloqueos";
import { useWebMaxWidth } from "../../src/lib/responsive";

const DANGER = "#DC2626";

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
  personas: (p) => <Personas {...p} />,
  puerta: (p) => <Puerta {...p} />,
  cama: (p) => <Cama {...p} />,
  bano: (p) => <Bano {...p} />,
};

export default function DetalleVehiculo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const webMax = useWebMaxWidth(820);

  const detalleQuery = useQuery({
    queryKey: ["detalle", id],
    queryFn: () => fetchDetalleById(id ?? ""),
    enabled: !!id,
  });
  const item = detalleQuery.data;

  // Contacto del propietario (nombre + teléfono): viaja aparte vía RPC y solo
  // si hay sesión. Para mocks (item.tipo undefined) no se dispara y el bloque
  // de propietario muestra los valores demo.
  const contactoQuery = useQuery({
    queryKey: ["contacto", item?.tipo, item?.id],
    queryFn: () =>
      fetchContactoPublicacion(item!.tipo!, item!.id),
    enabled: !!user && !!item?.tipo && !!item?.id,
  });
  const contacto = contactoQuery.data ?? null;
  const [favorito, setFavorito] = useState(false);
  const [carruselW, setCarruselW] = useState(0);
  const [indice, setIndice] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState<string | null>(null);

  const reportMutation = useMutation({
    mutationFn: (motivoTexto: string) => {
      if (!item?.tipo || !item.id) throw new Error("Publicación inválida.");
      return reportar({ tipo: item.tipo, objetoId: item.id, motivo: motivoTexto });
    },
    onSuccess: () => {
      setReportVisible(false);
      setMotivo("");
      Alert.alert(
        "Reporte enviado",
        "Gracias por avisarnos. Revisaremos esta publicación en las próximas 24–48 horas."
      );
    },
    onError: (e) => {
      setMotivoError(e instanceof Error ? e.message : "No se pudo enviar el reporte.");
    },
  });

  const bloquearMutation = useMutation({
    mutationFn: (usuarioId: string) => bloquearUsuario(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mixto-aprobado"] });
      queryClient.invalidateQueries({ queryKey: ["nuevas-entradas"] });
      queryClient.invalidateQueries({ queryKey: ["vehiculos-aprobados"] });
      queryClient.invalidateQueries({ queryKey: ["propiedades-aprobadas"] });
      queryClient.invalidateQueries({ queryKey: ["categoria"] });
      router.back();
      setTimeout(() => {
        Alert.alert(
          "Usuario bloqueado",
          "No volverás a ver publicaciones de este usuario."
        );
      }, 200);
    },
    onError: (e) => {
      Alert.alert(
        "No se pudo bloquear",
        e instanceof Error ? e.message : "Error desconocido."
      );
    },
  });

  const exigirSesion = (accion: string): boolean => {
    if (user) return true;
    // RN-Web ignora los botones de Alert.alert (solo dispara window.alert con
    // el título). En web usamos window.confirm para ofrecer el "Iniciar sesión".
    if (Platform.OS === "web") {
      const ok =
        typeof window !== "undefined" &&
        window.confirm(
          `Inicia sesión\n\nNecesitas una cuenta para ${accion}.\n\n¿Quieres iniciar sesión ahora?`
        );
      if (ok) router.push("/auth/login");
      return false;
    }
    Alert.alert(
      "Inicia sesión",
      `Necesitas una cuenta para ${accion}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Iniciar sesión",
          onPress: () => router.push("/auth/login"),
        },
      ]
    );
    return false;
  };

  const abrirReporte = () => {
    if (!item?.tipo) return; // mock o publicación no real
    if (!exigirSesion("reportar")) return;
    setMotivo("");
    setMotivoError(null);
    setReportVisible(true);
  };

  const enviarReporte = () => {
    const limpio = motivo.trim();
    if (limpio.length < 5 || limpio.length > 500) {
      setMotivoError("El motivo debe tener entre 5 y 500 caracteres.");
      return;
    }
    setMotivoError(null);
    reportMutation.mutate(limpio);
  };

  const confirmarBloqueo = () => {
    if (!item?.propietario.id) return;
    if (!exigirSesion("bloquear usuarios")) return;
    Alert.alert(
      "¿Bloquear a este usuario?",
      "No verás más publicaciones suyas en la app. Puedes desbloquearlo después.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Bloquear",
          style: "destructive",
          onPress: () => {
            if (item.propietario.id) bloquearMutation.mutate(item.propietario.id);
          },
        },
      ]
    );
  };

  if (detalleQuery.isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

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
    // Auth gate: el teléfono solo viaja al cliente para usuarios autenticados
    // (RLS column-level + RPC obtener_contacto_publicacion, §2.1 del plan).
    if (!exigirSesion("contactar al propietario")) return;

    // Mocks (catálogo demo) usan PROPIETARIO_DEMO; publicaciones reales
    // requieren el contacto resuelto vía RPC.
    const telefono = item.tipo
      ? contacto?.telefono
      : item.propietario.telefono;

    if (!telefono) {
      if (contactoQuery.isLoading) {
        Alert.alert(
          "Cargando contacto",
          "Estamos preparando el contacto del propietario. Intenta de nuevo en un instante."
        );
      } else {
        Alert.alert(
          "No pudimos obtener el contacto",
          "Intenta de nuevo en unos segundos."
        );
        contactoQuery.refetch();
      }
      return;
    }

    const mensaje = `Hola, estoy interesado en reservar ${item.titulo} visto en la app Milink. ¿Sigue disponible?`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
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
        contentContainerStyle={{ paddingBottom: 110, ...(webMax ?? {}) }}
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
          style={{ top: insets.top + 8, ...(webMax ?? {}) }}
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
            {item.tipo ? (
              <Pressable
                onPress={abrirReporte}
                accessibilityRole="button"
                accessibilityLabel="Reportar publicación"
                className="w-11 h-11 rounded-2xl items-center justify-center bg-white"
                style={shadow}
              >
                <Flag size={20} color={DANGER} />
              </Pressable>
            ) : null}
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
          <View className="flex-row items-center gap-3 mb-2">
            <Avatar size={52} />
            <View>
              <Text className="font-quicksand-bold text-[16px] text-ink">
                {item.tipo
                  ? contacto?.nombre || "Propietario verificado"
                  : item.propietario.nombre}
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
          {item.propietario.id ? (
            <Pressable
              onPress={confirmarBloqueo}
              accessibilityRole="button"
              accessibilityLabel="Bloquear a este usuario"
              hitSlop={8}
              className="flex-row items-center gap-2 mb-4"
            >
              <UserX size={16} color={DANGER} />
              <Text
                className="font-quicksand-semibold text-[13.5px]"
                style={{ color: DANGER }}
              >
                Bloquear a este usuario
              </Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Barra de acción inferior fija */}
      <View
        className="absolute left-0 right-0 bottom-0 flex-row items-center justify-between bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12, ...shadowTop, ...(webMax ?? {}) }}
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

      {/* Modal de reporte */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          !reportMutation.isPending && setReportVisible(false)
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View
              className="rounded-2xl bg-white p-6 gap-3"
              style={{ maxWidth: 420, width: "100%", alignSelf: "center" }}
            >
              <Text className="font-quicksand-bold text-[18px] text-ink">
                Reportar publicación
              </Text>
              <Text className="text-[13.5px] text-muted font-quicksand-medium leading-5">
                Cuéntanos qué hay de objetable en esta publicación. La revisamos
                en 24–48 horas.
              </Text>
              <TextInput
                value={motivo}
                onChangeText={(v) => {
                  setMotivo(v);
                  if (motivoError) setMotivoError(null);
                }}
                placeholder="Motivo (mín. 5 caracteres)"
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!reportMutation.isPending}
                className="rounded-2xl px-4 py-3 bg-[#F1F5F9] text-[14.5px] text-ink font-quicksand-medium"
                style={{
                  minHeight: 110,
                  textAlignVertical: "top",
                  ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
                }}
              />
              {motivoError ? (
                <Text
                  className="text-[13px] font-quicksand-semibold"
                  style={{ color: DANGER }}
                >
                  {motivoError}
                </Text>
              ) : null}
              <View className="flex-row gap-3 mt-2">
                <Pressable
                  onPress={() => setReportVisible(false)}
                  disabled={reportMutation.isPending}
                  className="flex-1 rounded-2xl px-4 py-3 items-center border border-line"
                >
                  <Text className="text-ink font-quicksand-semibold">
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={enviarReporte}
                  disabled={reportMutation.isPending}
                  className="flex-1 rounded-2xl px-4 py-3 items-center"
                  style={{
                    backgroundColor: DANGER,
                    opacity: reportMutation.isPending ? 0.7 : 1,
                  }}
                >
                  {reportMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-quicksand-bold">
                      Enviar
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
