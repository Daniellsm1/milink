import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="vehicle/[id]"
            options={{ title: "Detalle del vehículo" }}
          />
          <Stack.Screen
            name="auth/register"
            options={{ presentation: "modal", title: "Registro y verificación" }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
