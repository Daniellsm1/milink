import { useState } from "react";
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
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { useWebMaxWidth } from "../../src/lib/responsive";

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const webMax = useWebMaxWidth(440);

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password) {
      Alert.alert("Faltan datos", "Completa nombre, correo y contraseña.");
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nombre: nombre.trim() } },
    });
    setLoading(false);
    if (error) {
      Alert.alert("No pudimos registrarte", error.message);
      return;
    }
    if (data.session) {
      // Sesión activa de inmediato (confirmación de correo desactivada)
      router.replace("/(tabs)/profile");
    } else {
      Alert.alert(
        "Revisa tu correo",
        "Te enviamos un enlace para confirmar tu cuenta. Luego inicia sesión.",
        [{ text: "Entendido", onPress: () => router.replace("/auth/login") }]
      );
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

          <Text className="font-quicksand-bold text-[28px] text-ink text-center mb-2">
            Crear cuenta
          </Text>
          <Text className="text-[14px] text-muted font-quicksand-medium text-center mb-8">
            Regístrate para publicar y reservar en Milink
          </Text>

          {/* Nombre */}
          <View className="flex-row items-center gap-3 rounded-2xl px-4 h-14 bg-[#F1F5F9] mb-4">
            <User size={20} color={COLORS.muted} />
            <TextInput
              className="flex-1 text-[15px] text-ink font-quicksand-medium"
              placeholder="Nombre completo"
              placeholderTextColor={COLORS.muted}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Correo */}
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
              placeholder="Contraseña (mín. 6 caracteres)"
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

          <View className="items-center">
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta"
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
                  CREAR CUENTA
                </Text>
              )}
            </Pressable>
          </View>

          <View className="flex-row items-center justify-center mt-10">
            <Text className="text-[14px] text-muted font-quicksand-medium">
              ¿Ya tienes cuenta?{" "}
            </Text>
            <Pressable
              onPress={() => router.replace("/auth/login")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Inicia sesión"
            >
              <Text className="text-[14px] text-accent font-quicksand-bold">
                Inicia sesión
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
