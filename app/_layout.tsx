import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { SessionProvider } from "../src/lib/auth";
import { FavoritosProvider } from "../src/lib/favoritos";
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <FavoritosProvider>
          <SafeAreaProvider>
            <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="vehicle/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth/register"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="publish/form"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="admin/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="categoria/[key]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="docs" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </FavoritosProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
