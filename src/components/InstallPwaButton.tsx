// Botón "Instalar" de la PWA. SOLO se renderiza en web y solo cuando la app es
// instalable y aún no se instaló (ver usePwaInstall). En nativo retorna null.
//
// Android/escritorio: al pulsar lanza el instalador del navegador.
// iOS Safari: al pulsar abre una hoja con instrucciones (Compartir → Añadir).
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { usePwaInstall } from "../lib/pwaInstall";
import { Download, IosShare, X } from "./icons";
import { COLORS } from "../theme/colors";

export function InstallPwaButton() {
  if (Platform.OS !== "web") return null;
  return <InstallPwaButtonWeb />;
}

function InstallPwaButtonWeb() {
  const { visible, platform, promptInstall, dismiss } = usePwaInstall();
  const [iosVisible, setIosVisible] = useState(false);

  if (!visible) return null;

  const onPress = () => {
    if (platform === "ios") {
      setIosVisible(true);
    } else {
      promptInstall();
    }
  };

  const cerrarIos = () => {
    setIosVisible(false);
    dismiss();
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Instalar Milink"
        className="flex-row items-center gap-1.5 h-9 px-3 rounded-full bg-accent active:opacity-90"
        style={{
          shadowColor: COLORS.accent,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }}
      >
        <Download size={16} color={COLORS.white} />
        <Text className="font-quicksand-bold text-[12px] text-white">
          Instalar
        </Text>
      </Pressable>

      {/* Hoja de instrucciones para iOS (no hay instalador programático) */}
      <Modal
        visible={iosVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarIos}
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
            className="rounded-2xl bg-white p-6"
            style={{ maxWidth: 420, width: "100%", alignSelf: "center" }}
          >
            <View className="flex-row items-start justify-between mb-1">
              <Text className="font-quicksand-bold text-[18px] text-ink flex-1">
                Instala Milink
              </Text>
              <Pressable
                onPress={cerrarIos}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                className="w-8 h-8 rounded-full items-center justify-center active:opacity-60"
              >
                <X size={18} color={COLORS.muted} />
              </Pressable>
            </View>
            <Text className="text-[13.5px] text-muted font-quicksand-medium leading-5 mb-4">
              Añádela a tu pantalla de inicio para abrirla como una app, sin
              barra del navegador.
            </Text>

            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full items-center justify-center bg-accentSoft">
                  <IosShare size={18} color={COLORS.accent} />
                </View>
                <Text className="flex-1 text-[14px] text-ink font-quicksand-semibold">
                  1. Toca el botón Compartir en la barra de Safari.
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full items-center justify-center bg-accentSoft">
                  <Download size={18} color={COLORS.accent} />
                </View>
                <Text className="flex-1 text-[14px] text-ink font-quicksand-semibold">
                  2. Elige "Añadir a pantalla de inicio".
                </Text>
              </View>
            </View>

            <Pressable
              onPress={cerrarIos}
              accessibilityRole="button"
              accessibilityLabel="Entendido"
              className="bg-accent rounded-full h-12 items-center justify-center mt-6 active:opacity-90"
            >
              <Text className="text-white font-quicksand-bold text-[14px]">
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
