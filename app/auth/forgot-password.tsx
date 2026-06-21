// Solicitud de recuperación de contraseña. El usuario ingresa su correo;
// Supabase envía un email con un enlace que abre /auth/reset-password
// (en nativo vía deep link milink://, en web vía URL absoluta).
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ExpoLinking from "expo-linking";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { ChevronLeft, Mail } from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { useWebMaxWidth } from "../../src/lib/responsive";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const webMax = useWebMaxWidth(440);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert("Falta el correo", "Ingresa el correo de tu cuenta.");
      return;
    }
    setLoading(true);
    // En nativo: milink://auth/reset-password
    // En web: URL absoluta actual + /auth/reset-password
    const redirectTo = ExpoLinking.createURL("/auth/reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setLoading(false);
    if (error) {
      Alert.alert("No pudimos enviar el correo", error.message);
      return;
    }
    setEnviado(true);
  };

  const abrirCorreo = async () => {
    // En móvil intenta abrir la app de correo del sistema.
    if (Platform.OS === "web") return;
    const url =
      Platform.OS === "ios" ? "message://" : "mailto:";
    try {
      await Linking.openURL(url);
    } catch {
      // Silencio: si no hay app de correo, el usuario lo abre manual.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Volver"
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

          {enviado ? (
            <>
              <Text className="font-quicksand-bold text-[24px] text-ink text-center mb-3">
                Revisa tu correo
              </Text>
              <Text className="text-[14.5px] text-muted font-quicksand-medium text-center leading-6 mb-8">
                Si {email.trim()} está registrado, te enviamos un enlace para
                cambiar tu contraseña. Puede tardar unos segundos.
              </Text>
              <View className="items-center gap-3">
                {Platform.OS !== "web" ? (
                  <Pressable
                    onPress={abrirCorreo}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir correo"
                    className="w-56 h-14 rounded-full items-center justify-center bg-accent active:opacity-90"
                    style={{
                      shadowColor: COLORS.accent,
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 6,
                    }}
                  >
                    <Text className="font-quicksand-bold text-[15px] text-white tracking-wider">
                      ABRIR CORREO
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => router.replace("/auth/login")}
                  accessibilityRole="button"
                  accessibilityLabel="Volver al inicio de sesión"
                  hitSlop={8}
                  className="mt-2"
                >
                  <Text className="text-[14px] text-accent font-quicksand-bold">
                    Volver al inicio de sesión
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text className="font-quicksand-bold text-[28px] text-ink text-center mb-2">
                Recuperar contraseña
              </Text>
              <Text className="text-[14px] text-muted font-quicksand-medium text-center mb-8 leading-5">
                Ingresa el correo de tu cuenta y te enviaremos un enlace para
                crear una nueva contraseña.
              </Text>

              <View className="flex-row items-center gap-3 rounded-2xl px-4 h-14 bg-[#F1F5F9] mb-7">
                <Mail size={20} color={COLORS.muted} />
                <TextInput
                  className="flex-1 text-[15px] text-ink font-quicksand-medium"
                  placeholder="Correo electrónico"
                  placeholderTextColor={COLORS.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="send"
                  onSubmitEditing={handleEnviar}
                />
              </View>

              <View className="items-center">
                <Pressable
                  onPress={handleEnviar}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar enlace"
                  className="w-56 h-14 rounded-full items-center justify-center bg-accent active:opacity-90"
                  style={{
                    shadowColor: COLORS.accent,
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text className="font-quicksand-bold text-[15px] text-white tracking-wider">
                      ENVIAR ENLACE
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
