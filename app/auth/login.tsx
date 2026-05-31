import { useState } from "react";
import {
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
import {
  AppleIcon,
  ChevronLeft,
  Eye,
  EyeOff,
  FacebookIcon,
  GoogleIcon,
  Lock,
  Mail,
} from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";

function SocialButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-14 h-14 rounded-full items-center justify-center bg-white border border-line active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: conectar con Supabase Auth (signInWithPassword)
  };

  const handleSocial = (_provider: "google" | "facebook" | "apple") => {
    // TODO: conectar con OAuth de Supabase
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
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-5">
            <Image
              source={require("../../assets/milink-icon.png")}
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

          {/* Botón ingresar */}
          <View className="items-center">
            <Pressable
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel="Ingresar"
              className="w-48 h-14 rounded-full items-center justify-center bg-accent active:opacity-90"
              style={{
                shadowColor: COLORS.accent,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              <Text className="font-quicksand-bold text-[15px] text-white tracking-wider">
                INGRESAR
              </Text>
            </Pressable>
          </View>

          {/* Divisor social */}
          <Text className="text-[13px] text-muted font-quicksand-medium text-center mt-8 mb-4">
            O inicia sesión con plataformas sociales
          </Text>

          {/* Botones sociales */}
          <View className="flex-row items-center justify-center gap-4">
            <SocialButton label="Google" onPress={() => handleSocial("google")}>
              <GoogleIcon size={24} />
            </SocialButton>
            <SocialButton
              label="Facebook"
              onPress={() => handleSocial("facebook")}
            >
              <FacebookIcon size={26} />
            </SocialButton>
            <SocialButton label="Apple" onPress={() => handleSocial("apple")}>
              <AppleIcon size={24} color={COLORS.text} />
            </SocialButton>
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
