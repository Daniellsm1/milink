import { useState } from "react";
import {
  ActivityIndicator,
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
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { useWebMaxWidth } from "../../src/lib/responsive";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Feedback inline: Alert es no-op en react-native-web; mostramos el error en
  // la propia pantalla para que sea visible también en la web.
  const [error, setError] = useState<string | null>(null);
  const webMax = useWebMaxWidth(440);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Botón volver */}
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
          {/* Logo */}
          <View className="items-center mb-5">
            <Image
              source={require("../../assets/icon1.png")}
              style={{ width: 72, height: 72, borderRadius: 18 }}
              contentFit="cover"
            />
          </View>

          {/* Título */}
          <Text className="font-quicksand-bold text-[28px] text-ink text-center mb-8">
            Iniciar sesión
          </Text>

          {/* Correo electrónico */}
          <View className="flex-row items-center gap-3 rounded-2xl px-4 h-14 bg-[#F1F5F9] mb-4">
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
              returnKeyType="next"
            />
          </View>

          {/* Contraseña */}
          <View className="flex-row items-center gap-3 rounded-2xl px-4 h-14 bg-[#F1F5F9] mb-7">
            <Lock size={20} color={COLORS.muted} />
            <TextInput
              className="flex-1 text-[15px] text-ink font-quicksand-medium"
              placeholder="Contraseña"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
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

          {/* Olvidé mi contraseña */}
          <View className="items-end -mt-4 mb-6">
            <Pressable
              onPress={() => router.push("/auth/forgot-password")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Olvidé mi contraseña"
            >
              <Text className="text-[13px] text-accent font-quicksand-bold">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          </View>

          {error ? (
            <Text
              className="text-[13.5px] font-quicksand-medium text-center mb-4"
              style={{ color: "#EF4444" }}
            >
              {error}
            </Text>
          ) : null}

          {/* Botón ingresar */}
          <View className="items-center">
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Ingresar"
              className="w-48 h-14 rounded-full items-center justify-center bg-accent active:opacity-90"
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
                  INGRESAR
                </Text>
              )}
            </Pressable>
          </View>

          {/* Link registro */}
          <View className="flex-row items-center justify-center mt-10">
            <Text className="text-[14px] text-muted font-quicksand-medium">
              ¿No tienes cuenta?{" "}
            </Text>
            <Pressable
              onPress={() => router.push("/auth/register")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Regístrate"
            >
              <Text className="text-[14px] text-accent font-quicksand-bold">
                Regístrate
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
