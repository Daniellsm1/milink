// Drawer lateral custom con Reanimated. Se monta como Modal transparent
// para pintar sobre el tab bar BlurView absolute.
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../theme/colors";
import { useSession } from "../lib/auth";
import { useEliminarCuenta } from "../lib/eliminarCuentaFlow";
import {
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  InfoCircle,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash,
  User,
  X,
  type IconProps,
} from "./icons";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type ItemRuta =
  | "/(tabs)/profile"
  | "/mis-publicaciones"
  | "/docs/sobre-nosotros"
  | "/docs/beneficios"
  | "/docs/preguntas-frecuentes"
  | "/docs/guia-uso-seguro"
  | "/docs/terminos-condiciones"
  | "/docs/politica-privacidad";

type Item = {
  id: string;
  label: string;
  Icon: (p: IconProps) => React.ReactElement;
  ruta: ItemRuta;
  soloLogueado?: boolean;
};

const ITEMS: Item[] = [
  { id: "cuenta",     label: "Cuenta",                                          Icon: User,           ruta: "/(tabs)/profile" },
  { id: "mis-pubs",   label: "Mis publicaciones",                               Icon: ClipboardList,  ruta: "/mis-publicaciones",         soloLogueado: true },
  { id: "sobre",      label: "Sobre nosotros",                                  Icon: InfoCircle,  ruta: "/docs/sobre-nosotros" },
  { id: "beneficios", label: "Beneficios de usar MiLink",                       Icon: Sparkles,    ruta: "/docs/beneficios" },
  { id: "faq",        label: "Preguntas frecuentes",                            Icon: HelpCircle,  ruta: "/docs/preguntas-frecuentes" },
  { id: "guia",       label: "Guía de uso seguro y requisitos",                 Icon: ShieldCheck, ruta: "/docs/guia-uso-seguro" },
  { id: "terminos",   label: "Términos y condiciones",                          Icon: FileText,    ruta: "/docs/terminos-condiciones" },
  { id: "privacidad", label: "Política de tratamiento de datos y privacidad",   Icon: Lock,        ruta: "/docs/politica-privacidad" },
];

const PANEL_WIDTH = Math.min(
  Dimensions.get("window").width * 0.8,
  320
);
const ANIM_DURATION = 280;
const EASING = Easing.out(Easing.cubic);
const CERRAR_SESION_COLOR = "#DC2626";

export function DrawerMenu({ visible, onClose }: Props) {
  const router = useRouter();
  const { user, session, signOut } = useSession();
  const eliminarCuenta = useEliminarCuenta();

  // El Modal solo se desmonta cuando termina la animación de salida.
  const [mounted, setMounted] = useState(visible);

  const translateX = useSharedValue(-PANEL_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withTiming(0, { duration: ANIM_DURATION, easing: EASING });
      overlayOpacity.value = withTiming(0.5, { duration: ANIM_DURATION, easing: EASING });
    } else {
      translateX.value = withTiming(-PANEL_WIDTH, { duration: ANIM_DURATION, easing: EASING });
      overlayOpacity.value = withTiming(0, { duration: ANIM_DURATION, easing: EASING }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, translateX, overlayOpacity]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const nombre = (() => {
    if (!user) return null;
    const meta = (user.user_metadata ?? {}) as { nombre?: string };
    if (meta.nombre?.trim()) return meta.nombre.trim();
    if (user.email) return user.email.split("@")[0];
    return "Usuario";
  })();

  const inicial = (nombre ?? "").slice(0, 1).toUpperCase() || "?";

  const irA = (ruta: ItemRuta) => {
    onClose();
    // Espera a que la animación de salida arranque antes de navegar para
    // que el contenido del drawer no se desmonte abruptamente.
    setTimeout(() => router.push(ruta), ANIM_DURATION);
  };

  const cerrarSesion = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn("signOut error:", e);
    }
    onClose();
    setTimeout(() => {
      Alert.alert("Sesión cerrada", "Tu sesión se cerró correctamente");
    }, ANIM_DURATION);
  };

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      {/* Overlay oscuro */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[{ flex: 1, backgroundColor: "#000" }, overlayStyle]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
          onPress={onClose}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: PANEL_WIDTH,
            backgroundColor: COLORS.bg,
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 18,
            shadowOffset: { width: 4, height: 0 },
            elevation: 12,
          },
          panelStyle,
        ]}
      >
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          {/* Header: identidad + cerrar */}
          <View
            className="px-5 pt-4 pb-5 border-b border-line"
            style={{ flexDirection: "column", gap: 12 }}
          >
            <View className="flex-row items-start justify-between">
              {user ? (
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Text className="text-white font-quicksand-bold text-[18px]">
                      {inicial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-quicksand-bold text-[15px] text-ink"
                      numberOfLines={1}
                    >
                      {nombre}
                    </Text>
                    <Text
                      className="font-quicksand-medium text-[12px] text-muted mt-0.5"
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center gap-3 flex-1">
                  <Image
                    source={require("../../assets/icon1.png")}
                    style={{ width: 40, height: 40, borderRadius: 10 }}
                    contentFit="cover"
                  />
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-[15px] text-ink">
                      Bienvenido
                    </Text>
                    <Text className="font-quicksand-medium text-[12px] text-muted mt-0.5">
                      Inicia sesión para acceder a tu cuenta
                    </Text>
                  </View>
                </View>
              )}
              <Pressable
                onPress={onClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Cerrar menú"
                className="w-9 h-9 rounded-full items-center justify-center"
              >
                <X size={20} color={COLORS.text} />
              </Pressable>
            </View>
          </View>

          {/* Items de navegación */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {ITEMS.filter((item) => !item.soloLogueado || session).map((item) => {
              const Icon = item.Icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => irA(item.ruta)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  className="flex-row items-center gap-3 px-5 active:bg-line/30"
                  style={{ paddingVertical: 14 }}
                >
                  <View className="w-7 items-center">
                    <Icon size={22} color={COLORS.accent} />
                  </View>
                  <Text
                    className="flex-1 font-quicksand-semibold text-[14.5px] text-ink"
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color={COLORS.muted} />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer: eliminar cuenta + cerrar sesión */}
          {session ? (
            <View className="border-t border-line">
              <Pressable
                onPress={() => {
                  // Cerramos el drawer primero para que el Alert/modal del flujo
                  // se monte por encima sin pelearse con el panel.
                  onClose();
                  setTimeout(eliminarCuenta.trigger, ANIM_DURATION);
                }}
                accessibilityRole="button"
                accessibilityLabel="Eliminar mi cuenta"
                className="flex-row items-center gap-3 px-5"
                style={{ paddingVertical: 16 }}
              >
                <View className="w-7 items-center">
                  <Trash size={22} color={CERRAR_SESION_COLOR} />
                </View>
                <Text
                  className="font-quicksand-semibold text-[14.5px]"
                  style={{ color: CERRAR_SESION_COLOR }}
                >
                  Eliminar mi cuenta
                </Text>
              </Pressable>
              <Pressable
                onPress={cerrarSesion}
                accessibilityRole="button"
                accessibilityLabel="Cerrar sesión"
                className="flex-row items-center gap-3 px-5"
                style={{ paddingVertical: 16 }}
              >
                <View className="w-7 items-center">
                  <LogOut size={22} color={CERRAR_SESION_COLOR} />
                </View>
                <Text
                  className="font-quicksand-semibold text-[14.5px]"
                  style={{ color: CERRAR_SESION_COLOR }}
                >
                  Cerrar sesión
                </Text>
              </Pressable>
            </View>
          ) : null}
        </SafeAreaView>
      </Animated.View>
      {eliminarCuenta.modal}
    </Modal>
  );
}
