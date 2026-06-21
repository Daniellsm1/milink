// Llegada desde el enlace de recuperación. Supabase ya creó una sesión
// temporal (el deep link/URL trae los tokens). Aquí solo permitimos cambiar
// la contraseña con updateUser.
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { useSession } from "../../src/lib/auth";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
} from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { useWebMaxWidth } from "../../src/lib/responsive";

export default function ResetPassword() {
  const router = useRouter();
  const { session, loading: loadingSesion } = useSession();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const webMax = useWebMaxWidth(440);

  // Si llegan sin sesión (link expirado o link directo), los mandamos a
  // pedir uno nuevo en /auth/forgot-password.
  useEffect(() => {
    if (loadingSesion) return;
    if (!session) {
      Alert.alert(
        "Enlace inválido o vencido",
        "Solicita un nuevo enlace de recuperación.",
        [
          {
            text: "Entendido",
            onPress: () => router.replace("/auth/forgot-password"),
          },
        ]
      );
    }
  }, [loadingSesion, session, router]);

  const handleGuardar = async () => {
    if (password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert("No pudimos actualizar la contraseña", error.message);
      return;
    }
    Alert.alert(
      "Contraseña actualizada",
      "Ya puedes usar tu nueva contraseña.",
      [{ text: "OK", onPress: () => router.replace("/(tabs)/profile") }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="px-4 pt-2">
          <Pressable
            onPress={() => router.replace("/auth/login")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio de sesión"
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
          >
            <ChevronLeft size={26} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 28,
            paddingBottom: 32,
            ...(webMax ?? {}),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-5">
            <Image
              source={require("../../assets/icon1.png")}
              style={{ width: 72, height: 72, borderRadius: 18 }}
              contentFit="cover"
            />
          </View>

          <Text className="font-quicksand-bold text-[28px] text-ink text-center mb-2">
            Nueva contraseña
          </Text>
          <Text className="text-[14px] text-muted font-quicksand-medium text-center mb-8 leading-5">
            Define una contraseña nueva para tu cuenta de Milink.
          </Text>

          <View className="flex-row items-center gap-3 rounded-2xl px-4 h-14 bg-[#F1F5F9] mb-7">
            <Lock size={20} color={COLORS.muted} />
            <TextInput
              className="flex-1 text-[15px] text-ink font-quicksand-medium"
              placeholder="Contraseña (mín. 6 caracteres)"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleGuardar}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff size={20} color={COLORS.muted} />
              ) : (
                <Eye size={20} color={COLORS.muted} />
              )}
            </Pressable>
          </View>

          <View className="items-center">
            <Pressable
              onPress={handleGuardar}
              disabled={loading || !session}
              accessibilityRole="button"
              accessibilityLabel="Guardar contraseña"
              className="w-60 h-14 rounded-full items-center justify-center bg-accent active:opacity-90"
              style={{
                shadowColor: COLORS.accent,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
                opacity: loading || !session ? 0.6 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text className="font-quicksand-bold text-[15px] text-white tracking-wider">
                  GUARDAR CONTRASEÑA
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
