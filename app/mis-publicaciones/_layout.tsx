import { Stack } from "expo-router";
import { COLORS } from "../../src/theme/colors";

export default function MisPublicacionesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: COLORS.accent,
        headerTitleStyle: {
          fontFamily: "Quicksand_700Bold",
          color: COLORS.text,
          fontSize: 16,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mis publicaciones" }} />
    </Stack>
  );
}
