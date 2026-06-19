import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Asset } from "expo-asset";
import Markdown from "react-native-markdown-display";
import { useSession } from "../../src/lib/auth";
import { Checkbox } from "../../src/components/form/Checkbox";
import { useTabBarHeight } from "../../src/components/tabBarMetrics";
import { TERMINOS_CHECKBOXES } from "../../src/content/terminosPublicacion";
import { COLORS, FONTS } from "../../src/theme/colors";
import { useWebMaxWidth } from "../../src/lib/responsive";

const markdownStyles = {
  body: {
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    fontSize: 12.5,
    lineHeight: 19,
  },
  heading1: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 15,
    marginTop: 12,
    marginBottom: 6,
  },
  heading2: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontFamily: FONTS.medium,
    color: COLORS.muted,
    fontSize: 12.5,
    lineHeight: 19,
    marginVertical: 4,
  },
  strong: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  em: { fontStyle: "italic" as const },
  bullet_list: { marginVertical: 4 },
  ordered_list: { marginVertical: 4 },
  list_item: {
    marginVertical: 2,
    flexDirection: "row" as const,
  },
  bullet_list_icon: {
    color: COLORS.accent,
    marginRight: 6,
  },
  blockquote: {
    backgroundColor: "#EEF2F7",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    paddingLeft: 10,
    paddingVertical: 6,
    marginVertical: 8,
  },
  hr: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 12,
  },
  link: {
    color: COLORS.accent,
    textDecorationLine: "underline" as const,
  },
};

export default function PublicarLegal() {
  const router = useRouter();
  const { user } = useSession();
  const tabBarH = useTabBarHeight();
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [contenido, setContenido] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const webMax = useWebMaxWidth(680);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(
          require("../../assets/legal/terminos_condiciones_publicacion.md")
        );
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        if (!uri) throw new Error("Asset URI no disponible");
        const resp = await fetch(uri);
        const text = await resp.text();
        if (mounted) setContenido(text);
      } catch (e) {
        console.warn("No se pudo cargar los términos:", e);
        if (mounted) setErrorCarga(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const todosMarcados = useMemo(
    () => TERMINOS_CHECKBOXES.every((c) => marcados[c.id]),
    [marcados]
  );

  const toggle = (id: string) =>
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-2" style={webMax ?? undefined}>
        <Text className="font-quicksand-bold text-[22px] text-ink">
          Términos de publicación
        </Text>
        <Text className="text-[13px] text-muted font-quicksand-medium mt-1">
          Lee y acepta los términos antes de publicar tu vehículo o propiedad.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          ...(webMax ?? {}),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Documento legal — se carga directamente del .md canónico */}
        <View
          className="rounded-2xl bg-[#F8FAFC] border border-line p-4 mb-5"
          style={{ minHeight: 200 }}
        >
          {contenido !== null ? (
            <Markdown style={markdownStyles}>{contenido}</Markdown>
          ) : errorCarga ? (
            <Text className="text-[12.5px] text-muted font-quicksand-medium text-center py-12">
              No se pudo cargar los términos. Cierra y vuelve a abrir esta pantalla.
            </Text>
          ) : (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="small" color={COLORS.accent} />
            </View>
          )}
        </View>

        {/* Checkboxes obligatorios */}
        <View className="mb-2">
          {TERMINOS_CHECKBOXES.map((c) => (
            <Checkbox
              key={c.id}
              checked={!!marcados[c.id]}
              onToggle={() => toggle(c.id)}
              label={c.texto}
            />
          ))}
        </View>
      </ScrollView>

      {/* Botón continuar — paddingBottom reserva el espacio del tab bar
          para que el botón nunca quede oculto detrás de él. */}
      <View
        className="px-5 pt-3 border-t border-line bg-white"
        style={{ paddingBottom: tabBarH + 12, ...(webMax ?? {}) }}
      >
        <Pressable
          onPress={() => {
            if (!user) {
              router.push("/auth/login");
              return;
            }
            router.push("/publish/form");
          }}
          disabled={!todosMarcados}
          accessibilityRole="button"
          accessibilityLabel="Continuar al formulario"
          className={`h-14 rounded-full items-center justify-center ${
            todosMarcados ? "bg-accent" : "bg-slate-200"
          }`}
        >
          <Text
            className={`font-quicksand-bold text-[15px] ${
              todosMarcados ? "text-white" : "text-muted"
            }`}
          >
            Continuar al formulario
          </Text>
        </Pressable>
        {!user ? (
          <Text className="text-[12px] text-muted font-quicksand-medium text-center mt-2">
            Necesitas iniciar sesión para publicar.
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
