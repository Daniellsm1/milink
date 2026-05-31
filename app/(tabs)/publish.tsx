import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSession } from "../../src/lib/auth";
import { Checkbox } from "../../src/components/form/Checkbox";
import {
  TERMINOS_CHECKBOXES,
  TERMINOS_SECCIONES,
} from "../../src/content/terminosPublicacion";

export default function PublicarLegal() {
  const router = useRouter();
  const { user } = useSession();
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  const todosMarcados = useMemo(
    () => TERMINOS_CHECKBOXES.every((c) => marcados[c.id]),
    [marcados]
  );

  const toggle = (id: string) =>
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="px-5 pt-3 pb-2">
        <Text className="font-quicksand-bold text-[22px] text-ink">
          Términos de publicación
        </Text>
        <Text className="text-[13px] text-muted font-quicksand-medium mt-1">
          Lee y acepta los términos antes de publicar tu vehículo o propiedad.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Documento legal */}
        <View className="rounded-2xl bg-[#F8FAFC] border border-line p-4 mb-5">
          {TERMINOS_SECCIONES.map((seccion, si) => (
            <View key={si} className={si > 0 ? "mt-4" : ""}>
              <Text className="font-quicksand-bold text-[14px] text-ink mb-2">
                {seccion.titulo}
              </Text>
              {seccion.bloques.map((b, bi) =>
                b.tipo === "vineta" ? (
                  <View key={bi} className="flex-row gap-2 mb-1.5 pl-1">
                    <Text className="text-accent font-quicksand-bold">•</Text>
                    <Text className="flex-1 text-[12.5px] text-muted font-quicksand-medium leading-5">
                      {b.texto}
                    </Text>
                  </View>
                ) : (
                  <Text
                    key={bi}
                    className="text-[12.5px] text-muted font-quicksand-medium leading-5 mb-1.5"
                  >
                    {b.texto}
                  </Text>
                )
              )}
            </View>
          ))}
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

      {/* Botón continuar */}
      <View className="px-5 pt-3 pb-5 border-t border-line bg-white">
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
