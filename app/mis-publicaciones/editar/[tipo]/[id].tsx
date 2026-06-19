// Pantalla de edición unificada para vehículo y propiedad. El tipo viene del
// param de URL, no se puede cambiar. Al guardar: sube solo las fotos nuevas,
// hace UPDATE con status="pending_approval", invalida queries y muestra modal.
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "../../../../src/components/icons";
import { COLORS } from "../../../../src/theme/colors";
import { FormInput } from "../../../../src/components/form/FormInput";
import { FormSelect } from "../../../../src/components/form/FormSelect";
import { FormToggle } from "../../../../src/components/form/FormToggle";
import {
  PhotoPickerEdit,
  type FotoEdit,
} from "../../../../src/components/form/PhotoPickerEdit";
import { CountryCodeSelect } from "../../../../src/components/form/CountryCodeSelect";
import { useSession } from "../../../../src/lib/auth";
import { subirImagenes } from "../../../../src/services/storage";
import {
  actualizarPropiedad,
  actualizarVehiculo,
  getPropiedadParaEditar,
  getVehiculoParaEditar,
} from "../../../../src/services/misPublicaciones";
import {
  propiedadSchema,
  telefonoCompleto,
  vehiculoSchema,
} from "../../../../src/lib/validation/publicacion";
import type {
  CombustibleTipo,
  PropiedadRow,
  PropiedadTipo,
  TransmisionTipo,
  VehiculoCategoria,
  VehiculoRow,
} from "../../../../src/types/database";
import { useWebMaxWidth } from "../../../../src/lib/responsive";

type Tipo = "vehiculo" | "propiedad";

const CATEGORIAS = [
  { value: "automovil", label: "Automóvil" },
  { value: "camioneta", label: "Camioneta" },
  { value: "motocicleta", label: "Motocicleta" },
] as const;

const TRANSMISIONES = [
  { value: "mecanico", label: "Mecánico" },
  { value: "automatico", label: "Automático" },
] as const;

const COMBUSTIBLES = [
  { value: "gasolina", label: "Gasolina" },
  { value: "diesel", label: "Diésel" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
  { value: "gas", label: "Gas" },
] as const;

const TIPOS_PROPIEDAD = [
  { value: "finca", label: "Finca" },
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
] as const;

const toNum = (s: string) => {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

// Parsea "573001234567" o "+573001234567" en { indicativo: "+57", telefono: "3001234567" }.
// Si no se puede parsear, default +57.
function parsearTelefono(raw: string | null): {
  indicativo: string;
  telefono: string;
} {
  if (!raw) return { indicativo: "+57", telefono: "" };
  const limpio = raw.startsWith("+") ? raw : `+${raw}`;
  const match = limpio.match(/^(\+\d{1,3})(\d+)$/);
  if (match) return { indicativo: match[1], telefono: match[2] };
  return { indicativo: "+57", telefono: raw.replace(/\D/g, "") };
}

export default function EditarPublicacion() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: loadingSession } = useSession();
  const { tipo, id } = useLocalSearchParams<{ tipo: Tipo; id: string }>();

  useEffect(() => {
    if (!loadingSession && !user) {
      router.replace("/auth/login");
    }
  }, [loadingSession, user, router]);

  const dataQuery = useQuery<VehiculoRow | PropiedadRow>({
    queryKey: ["editar", tipo, id],
    queryFn: async () =>
      tipo === "vehiculo"
        ? await getVehiculoParaEditar(id)
        : await getPropiedadParaEditar(id),
    enabled: !!user && !!id && !!tipo,
  });

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [precargado, setPrecargado] = useState(false);
  const webMax = useWebMaxWidth(680);

  // Fotos: 3 slots posicionales con discriminated union (existente/nueva).
  const [fotos, setFotos] = useState<(FotoEdit | null)[]>([null, null, null]);

  // Teléfono (ambos tipos)
  const [indicativo, setIndicativo] = useState("+57");
  const [telefono, setTelefono] = useState("");

  // ── Estado Vehículo ──
  const [vMarca, setVMarca] = useState("");
  const [vModelo, setVModelo] = useState("");
  const [vAno, setVAno] = useState("");
  const [vCategoria, setVCategoria] = useState<VehiculoCategoria | null>(null);
  const [vTransmision, setVTransmision] = useState<TransmisionTipo | null>(
    null
  );
  const [vCombustible, setVCombustible] = useState<CombustibleTipo | null>(
    null
  );
  const [vColor, setVColor] = useState("");
  const [vSillas, setVSillas] = useState("");
  const [vKilometraje, setVKilometraje] = useState("");
  const [vPrecio, setVPrecio] = useState("");
  const [vCiudad, setVCiudad] = useState("");
  const [vCiudadOpcional, setVCiudadOpcional] = useState("");
  const [vKmDia, setVKmDia] = useState("");
  const [vAire, setVAire] = useState(false);
  const [vDescripcion, setVDescripcion] = useState("");

  // ── Estado Propiedad ──
  const [pTipo, setPTipo] = useState<PropiedadTipo | null>(null);
  const [pTitulo, setPTitulo] = useState("");
  const [pDepartamento, setPDepartamento] = useState("");
  const [pCiudad, setPCiudad] = useState("");
  const [pPrecio, setPPrecio] = useState("");
  const [pHuespedes, setPHuespedes] = useState("");
  const [pHabitaciones, setPHabitaciones] = useState("");
  const [pCamas, setPCamas] = useState("");
  const [pBanos, setPBanos] = useState("");
  const [pPiscina, setPPiscina] = useState(false);
  const [pWifi, setPWifi] = useState(false);
  const [pParqueadero, setPParqueadero] = useState(false);
  const [pAire, setPAire] = useState(false);
  const [pPet, setPPet] = useState(false);
  const [pBbq, setPBbq] = useState(false);
  const [pDescripcion, setPDescripcion] = useState("");

  // Pre-carga del estado cuando llegan los datos.
  useEffect(() => {
    if (!dataQuery.data || precargado) return;
    const data = dataQuery.data;

    // Fotos existentes → 3 slots
    const slots: (FotoEdit | null)[] = [null, null, null];
    (data.imagenes ?? []).slice(0, 3).forEach((url, i) => {
      slots[i] = { tipo: "existente", url };
    });
    setFotos(slots);

    const tel = parsearTelefono(data.telefono_contacto);
    setIndicativo(tel.indicativo);
    setTelefono(tel.telefono);

    if (tipo === "vehiculo") {
      const v = data as VehiculoRow;
      setVMarca(v.marca ?? "");
      setVModelo(v.modelo ?? "");
      setVAno(String(v.ano ?? ""));
      setVCategoria(v.categoria);
      setVTransmision(v.transmision);
      setVCombustible(v.tipo_combustible);
      setVColor(v.color ?? "");
      setVSillas(v.numero_sillas != null ? String(v.numero_sillas) : "");
      setVKilometraje(v.kilometraje != null ? String(v.kilometraje) : "");
      setVPrecio(String(v.precio_alquiler_diario ?? ""));
      setVCiudad(v.ciudad_entrega_principal ?? "");
      setVCiudadOpcional(v.ciudad_entrega_opcional ?? "");
      setVKmDia(
        v.kilometraje_permitido_diario != null
          ? String(v.kilometraje_permitido_diario)
          : ""
      );
      setVAire(!!v.tiene_aire_acondicionado);
      setVDescripcion(v.descripcion ?? "");
    } else {
      const p = data as PropiedadRow;
      setPTipo(p.tipo_propiedad);
      setPTitulo(p.titulo ?? "");
      setPDepartamento(p.departamento ?? "");
      setPCiudad(p.ciudad_municipio ?? "");
      setPPrecio(String(p.precio_alquiler_diario ?? ""));
      setPHuespedes(String(p.capacidad_huespedes ?? ""));
      setPHabitaciones(String(p.numero_habitaciones ?? ""));
      setPCamas(String(p.numero_camas ?? ""));
      setPBanos(String(p.numero_banos ?? ""));
      setPPiscina(!!p.tiene_piscina);
      setPWifi(!!p.tiene_wifi);
      setPParqueadero(!!p.tiene_parqueadero);
      setPAire(!!p.tiene_aire_acondicionado);
      setPPet(!!p.es_pet_friendly);
      setPBbq(!!p.tiene_zona_bbq);
      setPDescripcion(p.descripcion ?? "");
    }

    setPrecargado(true);
  }, [dataQuery.data, precargado, tipo]);

  const cantidadFotos = useMemo(
    () => fotos.filter((f) => f !== null).length,
    [fotos]
  );
  const tieneTresFotos = cantidadFotos === 3;
  const telefonoOk = !!indicativo && /^\d{7,12}$/.test(telefono.trim());

  const vehiculoCompleto =
    !!vMarca.trim() &&
    !!vModelo.trim() &&
    !!vAno.trim() &&
    !!vCategoria &&
    !!vTransmision &&
    !!vCombustible &&
    !!vColor.trim() &&
    !!vSillas.trim() &&
    !!vKilometraje.trim() &&
    !!vPrecio.trim() &&
    !!vCiudad.trim();

  const propiedadCompleta =
    !!pTipo &&
    !!pTitulo.trim() &&
    !!pDepartamento.trim() &&
    !!pCiudad.trim() &&
    !!pPrecio.trim() &&
    !!pHuespedes.trim() &&
    !!pHabitaciones.trim() &&
    !!pCamas.trim() &&
    !!pBanos.trim();

  const puedeGuardar = useMemo(() => {
    if (!tieneTresFotos || !telefonoOk) return false;
    return tipo === "vehiculo" ? vehiculoCompleto : propiedadCompleta;
  }, [
    tieneTresFotos,
    telefonoOk,
    tipo,
    vehiculoCompleto,
    propiedadCompleta,
  ]);

  const handleGuardar = async () => {
    if (!tieneTresFotos) {
      Alert.alert("Faltan fotos", "Debes tener exactamente 3 fotografías.");
      return;
    }

    const parsed =
      tipo === "vehiculo"
        ? vehiculoSchema.safeParse({
            marca: vMarca,
            modelo: vModelo,
            ano: vAno,
            categoria: vCategoria ?? "",
            transmision: vTransmision ?? "",
            combustible: vCombustible ?? "",
            color: vColor,
            sillas: vSillas,
            kilometraje: vKilometraje,
            precio: vPrecio,
            ciudad: vCiudad,
            ciudadOpcional: vCiudadOpcional,
            indicativo,
            telefono,
          })
        : propiedadSchema.safeParse({
            tipoPropiedad: pTipo ?? "",
            titulo: pTitulo,
            departamento: pDepartamento,
            ciudad: pCiudad,
            precio: pPrecio,
            huespedes: pHuespedes,
            habitaciones: pHabitaciones,
            camas: pCamas,
            banos: pBanos,
            indicativo,
            telefono,
          });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const mapped: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([k, v]) => {
        if (v && v[0]) mapped[k] = v[0];
      });
      setErrores(mapped);
      Alert.alert(
        "Revisa el formulario",
        "Hay campos obligatorios incompletos o con formato inválido."
      );
      return;
    }
    setErrores({});

    setEnviando(true);
    try {
      // Subir solo las fotos NUEVAS. Las existentes conservan su URL.
      const fotosNoNull = fotos.filter((f): f is FotoEdit => f !== null);
      const tipoStorage = tipo === "vehiculo" ? "vehiculos" : "propiedades";
      const fotosNuevasUris = fotosNoNull
        .filter(
          (f): f is { tipo: "nueva"; uri: string } => f.tipo === "nueva"
        )
        .map((f) => f.uri);

      const urlsNuevas =
        fotosNuevasUris.length > 0
          ? await subirImagenes(user!.id, tipoStorage, fotosNuevasUris)
          : [];

      // Reconstruir el array final manteniendo el orden de slots.
      let nIdx = 0;
      const imagenesFinales = fotosNoNull.map((f) =>
        f.tipo === "existente" ? f.url : urlsNuevas[nIdx++]!
      );

      const telefono_contacto = telefonoCompleto(indicativo, telefono);

      if (tipo === "vehiculo") {
        await actualizarVehiculo(id, {
          marca: vMarca.trim(),
          modelo: vModelo.trim(),
          ano: toNum(vAno),
          categoria: vCategoria!,
          transmision: vTransmision!,
          tipo_combustible: vCombustible!,
          color: vColor.trim(),
          numero_sillas: toNum(vSillas),
          kilometraje: toNum(vKilometraje),
          precio_alquiler_diario: toNum(vPrecio),
          ciudad_entrega_principal: vCiudad.trim(),
          ciudad_entrega_opcional: vCiudadOpcional.trim() || null,
          kilometraje_permitido_diario: vKmDia.trim() ? toNum(vKmDia) : null,
          tiene_aire_acondicionado: vAire,
          telefono_contacto,
          descripcion: vDescripcion.trim() || null,
          imagenes: imagenesFinales,
        });
      } else {
        await actualizarPropiedad(id, {
          tipo_propiedad: pTipo!,
          titulo: pTitulo.trim(),
          departamento: pDepartamento.trim(),
          ciudad_municipio: pCiudad.trim(),
          precio_alquiler_diario: toNum(pPrecio),
          capacidad_huespedes: toNum(pHuespedes),
          numero_habitaciones: toNum(pHabitaciones),
          numero_camas: toNum(pCamas),
          numero_banos: toNum(pBanos),
          tiene_piscina: pPiscina,
          tiene_wifi: pWifi,
          tiene_parqueadero: pParqueadero,
          tiene_aire_acondicionado: pAire,
          es_pet_friendly: pPet,
          tiene_zona_bbq: pBbq,
          telefono_contacto,
          descripcion: pDescripcion.trim() || null,
          imagenes: imagenesFinales,
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["mis-publicaciones", user!.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["editar", tipo, id] }),
      ]);

      setExito(true);
    } catch (e) {
      Alert.alert(
        "No se pudieron guardar los cambios",
        e instanceof Error ? e.message : "Ocurrió un error inesperado."
      );
    } finally {
      setEnviando(false);
    }
  };

  if (dataQuery.isLoading || !precargado) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Stack.Screen options={{ title: "Editar publicación" }} />
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (dataQuery.isError) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Stack.Screen options={{ title: "Editar publicación" }} />
        <Text className="font-quicksand-bold text-[17px] text-ink text-center">
          No pudimos cargar la publicación
        </Text>
        <Text className="font-quicksand-medium text-[14px] text-muted text-center mt-2">
          Revisa tu conexión e inténtalo de nuevo.
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

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Editar publicación" }} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            ...(webMax ?? {}),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-3" />

          {tipo === "vehiculo" ? (
            <>
              <FormInput label="Marca" value={vMarca} onChangeText={setVMarca} placeholder="Ej. Toyota" autoCapitalize="words" error={errores.marca} />
              <FormInput label="Modelo" value={vModelo} onChangeText={setVModelo} placeholder="Ej. Prado VX" autoCapitalize="words" error={errores.modelo} />
              <FormInput label="Año" value={vAno} onChangeText={setVAno} placeholder="Ej. 2022" keyboardType="numeric" error={errores.ano} />
              <FormSelect label="Categoría" value={vCategoria} options={CATEGORIAS as any} onChange={setVCategoria} error={errores.categoria} />
              <FormSelect label="Transmisión" value={vTransmision} options={TRANSMISIONES as any} onChange={setVTransmision} error={errores.transmision} />
              <FormSelect label="Combustible" value={vCombustible} options={COMBUSTIBLES as any} onChange={setVCombustible} error={errores.combustible} />
              <FormInput label="Color" value={vColor} onChangeText={setVColor} placeholder="Ej. Blanco" autoCapitalize="words" error={errores.color} />
              <FormInput label="Número de sillas" value={vSillas} onChangeText={setVSillas} placeholder="Ej. 5" keyboardType="numeric" error={errores.sillas} />
              <FormInput label="Kilometraje" value={vKilometraje} onChangeText={setVKilometraje} placeholder="Ej. 35000" keyboardType="numeric" error={errores.kilometraje} />
              <FormInput label="Precio por día (COP)" value={vPrecio} onChangeText={setVPrecio} placeholder="Ej. 250000" keyboardType="numeric" error={errores.precio} />
              <FormInput label="Ciudad de entrega" value={vCiudad} onChangeText={setVCiudad} placeholder="Ej. Bogotá" autoCapitalize="words" error={errores.ciudad} />
              <FormInput label="Ciudad de entrega opcional" value={vCiudadOpcional} onChangeText={setVCiudadOpcional} placeholder="Ej. Chía (otra ciudad de entrega)" autoCapitalize="words" />
              <FormInput label="Km permitido por día (opcional)" value={vKmDia} onChangeText={setVKmDia} placeholder="Vacío = libre" keyboardType="numeric" />
              <FormToggle label="Aire acondicionado" value={vAire} onValueChange={setVAire} />
              <FormInput label="Descripción (opcional)" value={vDescripcion} onChangeText={setVDescripcion} placeholder="Detalles adicionales…" multiline />
            </>
          ) : (
            <>
              <FormSelect label="Tipo de propiedad" value={pTipo} options={TIPOS_PROPIEDAD as any} onChange={setPTipo} error={errores.tipoPropiedad} />
              <FormInput label="Título" value={pTitulo} onChangeText={setPTitulo} placeholder="Ej. Finca con piscina en Melgar" autoCapitalize="sentences" error={errores.titulo} />
              <FormInput label="Departamento" value={pDepartamento} onChangeText={setPDepartamento} placeholder="Ej. Tolima" autoCapitalize="words" error={errores.departamento} />
              <FormInput label="Ciudad / Municipio" value={pCiudad} onChangeText={setPCiudad} placeholder="Ej. Melgar" autoCapitalize="words" error={errores.ciudad} />
              <FormInput label="Precio por día (COP)" value={pPrecio} onChangeText={setPPrecio} placeholder="Ej. 380000" keyboardType="numeric" error={errores.precio} />
              <FormInput label="Capacidad de huéspedes" value={pHuespedes} onChangeText={setPHuespedes} placeholder="Ej. 8" keyboardType="numeric" error={errores.huespedes} />
              <FormInput label="Habitaciones" value={pHabitaciones} onChangeText={setPHabitaciones} placeholder="Ej. 3" keyboardType="numeric" error={errores.habitaciones} />
              <FormInput label="Camas" value={pCamas} onChangeText={setPCamas} placeholder="Ej. 4" keyboardType="numeric" error={errores.camas} />
              <FormInput label="Baños" value={pBanos} onChangeText={setPBanos} placeholder="Ej. 2" keyboardType="numeric" error={errores.banos} />
              <View className="mb-2">
                <Text className="text-[13px] text-ink font-quicksand-semibold mb-1">
                  Comodidades
                </Text>
                <FormToggle label="Piscina" value={pPiscina} onValueChange={setPPiscina} />
                <FormToggle label="WiFi" value={pWifi} onValueChange={setPWifi} />
                <FormToggle label="Parqueadero" value={pParqueadero} onValueChange={setPParqueadero} />
                <FormToggle label="Aire acondicionado" value={pAire} onValueChange={setPAire} />
                <FormToggle label="Pet friendly" value={pPet} onValueChange={setPPet} />
                <FormToggle label="Zona BBQ" value={pBbq} onValueChange={setPBbq} />
              </View>
              <FormInput label="Descripción (opcional)" value={pDescripcion} onChangeText={setPDescripcion} placeholder="Detalles adicionales…" multiline />
            </>
          )}

          {/* Teléfono de contacto (WhatsApp) */}
          <View className="mb-4">
            <Text className="text-[13px] text-ink font-quicksand-semibold mb-1.5">
              Teléfono de contacto (WhatsApp)
            </Text>
            <View className="flex-row gap-2">
              <CountryCodeSelect
                value={indicativo}
                onChange={setIndicativo}
                error={errores.indicativo}
              />
              <View className="flex-1">
                <FormInput
                  label=""
                  value={telefono}
                  onChangeText={(v) => setTelefono(v.replace(/\D/g, ""))}
                  placeholder="Número, ej. 3001234567"
                  keyboardType="numeric"
                  error={errores.telefono}
                />
              </View>
            </View>
          </View>

          {/* Fotos */}
          <View className="mt-2">
            <PhotoPickerEdit fotos={fotos} onChange={setFotos} />
          </View>
        </ScrollView>

        {/* Botón guardar */}
        <View
          className="px-5 pt-3 pb-5 border-t border-line bg-white"
          style={webMax ?? undefined}
        >
          <Pressable
            onPress={handleGuardar}
            disabled={!puedeGuardar || enviando}
            accessibilityRole="button"
            accessibilityLabel="Guardar cambios"
            className={`h-14 rounded-full items-center justify-center ${
              puedeGuardar && !enviando ? "bg-accent" : "bg-slate-200"
            }`}
          >
            {enviando ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text
                className={`font-quicksand-bold text-[15px] ${
                  puedeGuardar ? "text-white" : "text-muted"
                }`}
              >
                Guardar cambios
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de éxito */}
      <Modal visible={exito} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: "rgba(15,23,42,0.55)" }}
        >
          <View
            className="bg-white rounded-3xl p-6 items-center w-full"
            style={{ maxWidth: 420 }}
          >
            <View className="w-16 h-16 rounded-full bg-accentSoft items-center justify-center mb-4">
              <Check size={32} color={COLORS.accent} />
            </View>
            <Text className="font-quicksand-bold text-[18px] text-ink text-center mb-2">
              ¡Publicación enviada a revisión!
            </Text>
            <Text className="text-[13.5px] text-muted font-quicksand-medium text-center leading-5">
              Un administrador revisará los cambios pronto. Tu publicación
              volverá a ser visible una vez sea aprobada.
            </Text>
            <Pressable
              onPress={() => {
                setExito(false);
                router.back();
              }}
              accessibilityRole="button"
              accessibilityLabel="Aceptar"
              className="h-12 rounded-full bg-accent items-center justify-center w-full mt-6"
            >
              <Text className="font-quicksand-bold text-[14px] text-white">
                Aceptar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
