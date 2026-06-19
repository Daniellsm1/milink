// Helper que carga un archivo .md desde el bundle y lo renderiza con
// react-native-markdown-display. Usado por las pantallas de docs.
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Asset } from "expo-asset";
import Markdown from "react-native-markdown-display";
import { COLORS, FONTS } from "../theme/colors";
import { useWebMaxWidth } from "../lib/responsive";

type Props = {
  source: number; // resultado de require("...md")
};

// Estilos del markdown — alineados con los tokens Quicksand de la app.
const markdownStyles = {
  body: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 24,
    marginTop: 8,
    marginBottom: 12,
  },
  heading2: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  heading3: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 17,
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 6,
  },
  strong: {
    fontFamily: FONTS.bold,
  },
  em: {
    fontStyle: "italic" as const,
  },
  link: {
    color: COLORS.accent,
    textDecorationLine: "underline" as const,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 8,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 8,
  },
  list_item: {
    marginTop: 4,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  bullet_list_icon: {
    marginRight: 8,
    color: COLORS.accent,
  },
  code_inline: {
    fontFamily: FONTS.medium,
    backgroundColor: COLORS.categoryBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: COLORS.text,
  },
  fence: {
    backgroundColor: COLORS.categoryBg,
    padding: 12,
    borderRadius: 8,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginVertical: 8,
  },
  blockquote: {
    backgroundColor: COLORS.categoryBg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  hr: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 16,
  },
};

export function MarkdownDoc({ source }: Props) {
  const [contenido, setContenido] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const webMax = useWebMaxWidth(760);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(source);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        if (!uri) throw new Error("Asset URI no disponible");
        // Fetch funciona en web (URL bundleada) y en native (file:// URI).
        const resp = await fetch(uri);
        const text = await resp.text();
        if (mounted) setContenido(text);
      } catch (e) {
        console.warn("No se pudo cargar el doc:", e);
        if (mounted) setError(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [source]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="font-quicksand-semibold text-[15px] text-muted text-center">
          No se pudo cargar el contenido.
        </Text>
      </View>
    );
  }

  if (contenido === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
        ...(webMax ?? {}),
      }}
      showsVerticalScrollIndicator={false}
    >
      <Markdown style={markdownStyles}>{contenido}</Markdown>
    </ScrollView>
  );
}
