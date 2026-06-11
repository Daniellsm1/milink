import { Stack } from "expo-router";
import { COLORS } from "../../src/theme/colors";

export default function DocsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "",
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: COLORS.accent,
        headerTitleStyle: {
          fontFamily: "Quicksand_700Bold",
          color: COLORS.text,
          fontSize: 16,
        },
      }}
    >
      <Stack.Screen
        name="sobre-nosotros"
        options={{ title: "Sobre nosotros" }}
      />
      <Stack.Screen
        name="beneficios"
        options={{ title: "Beneficios de MiLink" }}
      />
      <Stack.Screen
        name="preguntas-frecuentes"
        options={{ title: "Preguntas frecuentes" }}
      />
      <Stack.Screen
        name="guia-uso-seguro"
        options={{ title: "Guía de uso seguro" }}
      />
      <Stack.Screen
        name="terminos-condiciones"
        options={{ title: "Términos y condiciones" }}
      />
      <Stack.Screen
        name="politica-privacidad"
        options={{ title: "Política de privacidad" }}
      />
    </Stack>
  );
}
