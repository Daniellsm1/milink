import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { SessionProvider } from "../src/lib/auth";
import { FavoritosProvider } from "../src/lib/favoritos";
import { AnimatedSplashScreen } from "../src/components/SplashScreen";
import {
  listarMixtoAprobado,
  listarNuevasEntradas,
} from "../src/services/feed";
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
  // El splash animado cubre la app hasta que su animación termina.
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Precarga del feed mientras corre el splash: cuando termina la animación,
  // Explorar ya tiene los datos en caché de TanStack Query.
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["nuevas-entradas"],
      queryFn: () => listarNuevasEntradas(5),
      staleTime: 30_000,
    });
    queryClient.prefetchQuery({
      queryKey: ["mixto-aprobado"],
      queryFn: () => listarMixtoAprobado(40),
      staleTime: 30_000,
    });
  }, []);

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
            {/* Splash animado como overlay: la app se monta detrás y sus
                queries cargan durante los ~3.5s de animación (cold start). */}
            {!splashDone && (
              <AnimatedSplashScreen onFinish={() => setSplashDone(true)} />
            )}
          </SafeAreaProvider>
        </FavoritosProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
