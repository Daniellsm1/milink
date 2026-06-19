// Detalle de moderación admin: todas las fotos + todos los datos del formulario
// + contacto por WhatsApp al propietario + decisión Aprobar/Rechazar.
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../../../src/lib/auth";
import { esAdmin } from "../../../../src/lib/admins";
import { useTabBarHeight } from "../../../../src/components/tabBarMetrics";
import { Check, WhatsApp, X } from "../../../../src/components/icons";
import { COLORS } from "../../../../src/theme/colors";
import {
  getPropiedadParaEditar,
  getVehiculoParaEditar,
} from "../../../../src/services/misPublicaciones";
import { aprobar, rechazar } from "../../../../src/services/moderacion";
import type {
  PropiedadRow,
  VehiculoRow,
} from "../../../../src/types/database";
import { useWebMaxWidth } from "../../../../src/lib/responsive";

type Tipo = "vehiculo" | "propiedad";

const CATEGORIA_LABEL: Record<string, string> = {
  automovil: "Automóvil",
  camioneta: "Camioneta",
  motocicleta: "Motocicleta",
};
const TRANSMISION_LABEL: Record<string, string> = {
  mecanico: "Mecánico",
  automatico: "Automático",
};
const COMBUSTIBLE_LABEL: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  hibrido: "Híbrido",
  electrico: "Eléctrico",
  gas: "Gas",
};
const TIPO_PROP_LABEL: Record<string, string> = {
  finca: "Finca",
  apartamento: "Apartamento",
  casa: "Casa",
};

const precioCOP = (n: number) => `$${n.toLocaleString("es-CO")} COP`;

export default function ModerarDetalle() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useSession();
  const { tipo, id } = useLocalSearchParams<{ tipo: Tipo; id: string }>();

  const admin = esAdmin(user);
  const tabBarH = useTabBarHeight();
  const webMax = useWebMaxWidth(820);

  useEffect(() => {
    if (loading) return;
    if (!user || !admin) router.replace("/(tabs)");
  }, [loading, user, admin, router]);

  const [carruselW, setCarruselW] = useState(0);
  const [indice, setIndice] = useState(0);

  const dataQuery = useQuery<VehiculoRow | PropiedadRow>({
    queryKey: ["admin-moderar", tipo, id],
    queryFn: async () =>
      tipo === "vehiculo"
        ? await getVehiculoParaEditar(id)
        : await getPropiedadParaEditar(id),
    enabled: admin && !!id && !!tipo,
  });

  const aprobarMut = useMutation({
    mutationFn: () => aprobar(tipo, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pendientes"] });
      Alert.alert("Publicación aprobada", "Ya es visible en la app.");
      router.back();
    },
    onError: (e) =>
      Alert.alert("No se pudo aprobar", e instanceof Error ? e.message : ""),
  });

  const rechazarMut = useMutation({
    mutationFn: () => rechazar(tipo, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pendientes"] });
      Alert.alert("Publicación rechazada", "El propietario podrá editarla.");
      router.back();
    },
    onError: (e) =>
      Alert.alert("No se pudo rechazar", e instanceof Error ? e.message : ""),
  });

  const headerOptions = (
    <Stack.Screen
      options={{
        title: "Moderar",
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: COLORS.accent,
        headerTitleStyle: {
          fontFamily: "Quicksand_700Bold",
          color: COLORS.text,
        },
      }}
    />
  );

  if (!admin) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {headerOptions}
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (dataQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {headerOptions}
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (dataQuery.isError || !dataQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        {headerOptions}
        <Text className="font-quicksand-bold text-[17px] text-ink text-center">
          No pudimos cargar la publicación
        </Text>
        <Pressable
          onPress={() => dataQuery.refetch()}
          className="bg-accent rounded-full px-8 h-12 items-center justify-center mt-6"
        >
          <Text className="text-white font-quicksand-bold text-[14px]">
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  const data = dataQuery.data;
  const imagenes = data.imagenes ?? [];
  const telefono = data.telefono_contacto;
  const telLimpio = telefono ? String(telefono).replace(/\D/g, "") : "";

  const abrirWhatsApp = async () => {
    if (!telLimpio) return;
    try {
      await Linking.openURL(`https://wa.me/${telLimpio}`);
    } catch {
      Alert.alert(
        "No se pudo abrir WhatsApp",
        "Verifica que tengas WhatsApp instalado."
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {headerOptions}
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarH + 24, ...(webMax ?? {}) }}
        showsVerticalScrollIndicator={false}
      >
        {/* A) Carrusel */}
        <View
          onLayout={(e) => setCarruselW(e.nativeEvent.layout.width)}
          style={{ width: "100%", aspectRatio: 16 / 9, overflow: "hidden" }}
        >
          {imagenes.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  if (carruselW > 0) {
                    setIndice(
                      Math.round(e.nativeEvent.contentOffset.x / carruselW)
                    );
                  }
                }}
              >
                {imagenes.map((uri, i) => (
                  <Image
                    key={i}
                    source={uri}
                    style={{ width: carruselW || 360, height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                  />
                ))}
              </ScrollView>
              {imagenes.length > 1 ? (
                <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-1.5">
                  {imagenes.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: i === indice ? 20 : 7,
                        height: 7,
                        borderRadius: 999,
                        backgroundColor:
                          i === indice
                            ? COLORS.white
                            : "rgba(255,255,255,0.6)",
                      }}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: COLORS.categoryBg }}
            >
              <Text className="text-[13px] text-muted font-quicksand-medium">
                Sin fotos
              </Text>
            </View>
          )}
        </View>

        <View className="px-5 pt-4">
          {/* B) Teléfono destacado */}
          <View className="bg-accentSoft border border-line rounded-2xl p-4">
            <Text className="text-[12px] text-muted font-quicksand-medium">
              Teléfono de contacto
            </Text>
            {telefono ? (
              <Text className="text-[18px] font-quicksand-bold text-accent mt-0.5">
                {telefono}
              </Text>
            ) : (
              <Text className="text-[15px] font-quicksand-semibold text-muted mt-0.5">
                Sin teléfono
              </Text>
            )}
            {data.nombre_propietario ? (
              <Text className="text-[14px] font-quicksand-semibold text-ink mt-0.5">
                {data.nombre_propietario}
              </Text>
            ) : null}

            {telefono ? (
              <Pressable
                onPress={abrirWhatsApp}
                accessibilityRole="button"
                accessibilityLabel="Contactar por WhatsApp"
                className="flex-row items-center justify-center gap-2 bg-accent rounded-full h-11 mt-3 active:opacity-90"
              >
                <WhatsApp size={18} color={COLORS.white} />
                <Text className="text-white font-quicksand-bold text-[14px]">
                  WhatsApp
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* C) Datos del formulario */}
          <View className="mt-5">
            {tipo === "vehiculo" ? (
              <CamposVehiculo v={data as VehiculoRow} />
            ) : (
              <CamposPropiedad p={data as PropiedadRow} />
            )}
          </View>

          {/* D) Botones */}
          <View className="flex-row gap-3 mt-6">
            <Pressable
              onPress={() => rechazarMut.mutate()}
              disabled={rechazarMut.isPending || aprobarMut.isPending}
              accessibilityRole="button"
              accessibilityLabel="Rechazar"
              className="flex-1 flex-row items-center justify-center gap-1.5 h-13 rounded-full border-2 active:opacity-70"
              style={{ borderColor: "#EF4444", height: 52 }}
            >
              <X size={18} color="#EF4444" />
              <Text
                className="font-quicksand-bold text-[14px]"
                style={{ color: "#EF4444" }}
              >
                Rechazar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => aprobarMut.mutate()}
              disabled={aprobarMut.isPending || rechazarMut.isPending}
              accessibilityRole="button"
              accessibilityLabel="Aprobar"
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-accent active:opacity-90"
              style={{ height: 52 }}
            >
              <Check size={18} color={COLORS.white} />
              <Text className="font-quicksand-bold text-[14px] text-white">
                Aprobar
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Campo({ label, value }: { label: string; value?: string | null }) {
  if (value == null || value === "") return null;
  return (
    <View className="py-2.5 border-b border-line">
      <Text className="text-[11px] text-muted font-quicksand-medium">
        {label}
      </Text>
      <Text className="text-[14.5px] text-ink font-quicksand-semibold mt-0.5">
        {value}
      </Text>
    </View>
  );
}

function CamposVehiculo({ v }: { v: VehiculoRow }) {
  return (
    <>
      <Campo label="Marca" value={v.marca} />
      <Campo label="Modelo" value={v.modelo} />
      <Campo label="Año" value={v.ano != null ? String(v.ano) : null} />
      <Campo label="Categoría" value={CATEGORIA_LABEL[v.categoria] ?? v.categoria} />
      <Campo
        label="Transmisión"
        value={TRANSMISION_LABEL[v.transmision] ?? v.transmision}
      />
      <Campo
        label="Combustible"
        value={COMBUSTIBLE_LABEL[v.tipo_combustible] ?? v.tipo_combustible}
      />
      <Campo label="Color" value={v.color} />
      <Campo
        label="Número de sillas"
        value={v.numero_sillas != null ? String(v.numero_sillas) : null}
      />
      <Campo
        label="Kilometraje"
        value={v.kilometraje != null ? String(v.kilometraje) : null}
      />
      <Campo
        label="Km permitido por día"
        value={
          v.kilometraje_permitido_diario != null
            ? String(v.kilometraje_permitido_diario)
            : null
        }
      />
      <Campo
        label="Aire acondicionado"
        value={v.tiene_aire_acondicionado ? "Sí" : "No"}
      />
      <Campo
        label="Precio alquiler diario"
        value={precioCOP(v.precio_alquiler_diario)}
      />
      <Campo label="Ciudad de entrega principal" value={v.ciudad_entrega_principal} />
      <Campo label="Ciudad de entrega opcional" value={v.ciudad_entrega_opcional} />
      <Campo label="Descripción" value={v.descripcion} />
    </>
  );
}

function CamposPropiedad({ p }: { p: PropiedadRow }) {
  const amenidades = [
    p.tiene_piscina && "Piscina",
    p.tiene_wifi && "WiFi",
    p.tiene_parqueadero && "Parqueadero",
    p.tiene_aire_acondicionado && "Aire acondicionado",
    p.es_pet_friendly && "Pet friendly",
    p.tiene_zona_bbq && "Zona BBQ",
  ].filter(Boolean) as string[];

  return (
    <>
      <Campo
        label="Tipo de propiedad"
        value={TIPO_PROP_LABEL[p.tipo_propiedad] ?? p.tipo_propiedad}
      />
      <Campo label="Título" value={p.titulo} />
      <Campo label="Descripción" value={p.descripcion} />
      <Campo label="Departamento" value={p.departamento} />
      <Campo label="Ciudad / Municipio" value={p.ciudad_municipio} />
      <Campo
        label="Capacidad de huéspedes"
        value={p.capacidad_huespedes != null ? String(p.capacidad_huespedes) : null}
      />
      <Campo
        label="Habitaciones"
        value={p.numero_habitaciones != null ? String(p.numero_habitaciones) : null}
      />
      <Campo
        label="Camas"
        value={p.numero_camas != null ? String(p.numero_camas) : null}
      />
      <Campo
        label="Baños"
        value={p.numero_banos != null ? String(p.numero_banos) : null}
      />
      <Campo
        label="Precio alquiler diario"
        value={precioCOP(p.precio_alquiler_diario)}
      />
      <Campo
        label="Amenidades"
        value={amenidades.length > 0 ? amenidades.join(" · ") : null}
      />
    </>
  );
}
