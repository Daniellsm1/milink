// Hook que encapsula el flujo de eliminar cuenta con doble confirmación
// cross-platform (Android/iOS/web): primer Alert de advertencia + segundo paso
// con TextInput que requiere escribir "ELIMINAR" para habilitar el botón.
//
// Uso:
//   const { trigger, modal } = useEliminarCuenta();
//   return <>{modal}<Pressable onPress={trigger}>...</Pressable></>;
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { eliminarMiCuenta } from "../services/cuenta";
import { useSession } from "./auth";
import { COLORS } from "../theme/colors";

const DANGER = "#DC2626";
const PALABRA_CONFIRMACION = "ELIMINAR";

type Paso = "warn" | "confirm" | "loading";

export function useEliminarCuenta() {
  const router = useRouter();
  const { signOut } = useSession();
  const [paso, setPaso] = useState<Paso>("warn");
  const [visible, setVisible] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cerrar = useCallback(() => {
    setVisible(false);
    // Reinicia el modal para la próxima vez (después de la animación)
    setTimeout(() => {
      setPaso("warn");
      setTexto("");
      setError(null);
    }, 250);
  }, []);

  const trigger = useCallback(() => {
    // Paso 1: advertencia rápida con Alert nativo. Si confirma, abrimos el modal
    // con el TextInput. En web, Alert con botones también funciona.
    Alert.alert(
      "¿Eliminar tu cuenta?",
      "Esta acción es permanente. Se borrarán tu cuenta, tus publicaciones y tus reseñas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => {
            setPaso("confirm");
            setVisible(true);
          },
        },
      ]
    );
  }, []);

  const confirmar = useCallback(async () => {
    if (texto.trim().toUpperCase() !== PALABRA_CONFIRMACION) {
      setError(`Debes escribir "${PALABRA_CONFIRMACION}" para confirmar.`);
      return;
    }
    setError(null);
    setPaso("loading");
    try {
      await eliminarMiCuenta();
      await signOut();
      setVisible(false);
      setTimeout(() => {
        Alert.alert(
          "Cuenta eliminada",
          "Tu cuenta y tus datos fueron eliminados."
        );
        router.replace("/");
      }, 250);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      setPaso("confirm");
    }
  }, [texto, signOut, router]);

  const modal = (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={paso === "loading" ? undefined : cerrar}
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
            Confirma la eliminación
          </Text>
          <Text className="text-[14px] text-muted font-quicksand-medium leading-5">
            Para confirmar, escribe{" "}
            <Text className="font-quicksand-bold" style={{ color: DANGER }}>
              {PALABRA_CONFIRMACION}
            </Text>{" "}
            en el campo de abajo.
          </Text>
          <TextInput
            value={texto}
            onChangeText={(v) => {
              setTexto(v);
              if (error) setError(null);
            }}
            placeholder={PALABRA_CONFIRMACION}
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={paso !== "loading"}
            className="rounded-2xl px-4 h-14 bg-[#F1F5F9] text-[15px] text-ink font-quicksand-semibold"
            style={Platform.OS === "web" ? { outlineWidth: 0 } : undefined}
          />
          {error ? (
            <Text
              className="text-[13px] font-quicksand-semibold"
              style={{ color: DANGER }}
            >
              {error}
            </Text>
          ) : null}
          <View className="flex-row gap-3 mt-2">
            <Pressable
              onPress={cerrar}
              disabled={paso === "loading"}
              className="flex-1 rounded-2xl px-4 py-3 items-center border border-line"
            >
              <Text className="text-ink font-quicksand-semibold">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={confirmar}
              disabled={paso === "loading"}
              className="flex-1 rounded-2xl px-4 py-3 items-center"
              style={{ backgroundColor: DANGER, opacity: paso === "loading" ? 0.7 : 1 }}
            >
              {paso === "loading" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-quicksand-bold">
                  Eliminar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return { trigger, modal };
}
