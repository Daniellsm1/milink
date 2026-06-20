import { useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check } from "../../src/components/icons";
import { COLORS } from "../../src/theme/colors";
import { FormInput } from "../../src/components/form/FormInput";
import { FormSelect } from "../../src/components/form/FormSelect";
import { FormToggle } from "../../src/components/form/FormToggle";
import { PhotoPicker } from "../../src/components/form/PhotoPicker";
import { CountryCodeSelect } from "../../src/components/form/CountryCodeSelect";
import { Checkbox } from "../../src/components/form/Checkbox";
import {
  crearPropiedad,
  crearVehiculo,
  type PropiedadFormData,
  type VehiculoFormData,
} from "../../src/services/publicaciones";
import {
  propiedadSchema,
  telefonoCompleto,
  vehiculoSchema,
} from "../../src/lib/validation/publicacion";
import { useWebMaxWidth } from "../../src/lib/responsive";

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

export default function PublicarFormulario() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("vehiculo");
  const [fotos, setFotos] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const webMax = useWebMaxWidth(680);

  // ── Teléfono de contacto (ambos tipos) ──
  const [indicativo, setIndicativo] = useState("+57");
  const [telefono, setTelefono] = useState("");
  // Consentimiento explícito para que nombre + teléfono sean visibles a
  // usuarios autenticados de Milink (Habeas Data, Ley 1581/2012).
  const [consientoContacto, setConsientoContacto] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  // ── Estado Vehículo ──
  const [vMarca, setVMarca] = useState("");
  const [vModelo, setVModelo] = useState("");
  const [vAno, setVAno] = useState("");
  const [vCategoria, setVCategoria] =
    useState<(typeof CATEGORIAS)[number]["value"] | null>(null);
  const [vTransmision, setVTransmision] =
    useState<(typeof TRANSMISIONES)[number]["value"] | null>(null);
  const [vCombustible, setVCombustible] =
    useState<(typeof COMBUSTIBLES)[number]["value"] | null>(null);
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
  const [pTipo, setPTipo] =
    useState<(typeof TIPOS_PROPIEDAD)[number]["value"] | null>(null);
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

  const tieneTresFotos = fotos.length === 3;

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

  const telefonoOk = !!indicativo && /^\d{7,12}$/.test(telefono.trim());

  const puedeGuardar = useMemo(() => {
    if (!tieneTresFotos || !telefonoOk || !consientoContacto) return false;
    return tipo === "vehiculo" ? vehiculoCompleto : propiedadCompleta;
  }, [
    tieneTresFotos,
    telefonoOk,
    consientoContacto,
    tipo,
    vehiculoCompleto,
    propiedadCompleta,
  ]);

  const guardar = async () => {
    if (!tieneTresFotos) {
      Alert.alert("Faltan fotos", "Debes adjuntar exactamente 3 fotografías.");
      return;
    }

    if (!consientoContacto) {
      setConsentError(
        "Debes aceptar que tu nombre y teléfono sean visibles para usuarios autenticados."
      );
      return;
    }
    setConsentError(null);

    // Validación con Zod según el tipo. Si falla, mostramos errores por campo.
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
      const telefono_contacto = telefonoCompleto(indicativo, telefono);

      if (tipo === "vehiculo") {
        const data: VehiculoFormData = {
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
        };
        await crearVehiculo(data, fotos);
      } else {
        const data: PropiedadFormData = {
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
        };
        await crearPropiedad(data, fotos);
      }
      setExito(true);
    } catch (e) {
      Alert.alert(
        "No se pudo publicar",
        e instanceof Error ? e.message : "Ocurrió un error inesperado."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          className="flex-row items-center px-4 pt-2 pb-2 gap-2"
          style={webMax ?? undefined}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
          >
            <ChevronLeft size={26} color={COLORS.text} />
          </Pressable>
          <Text className="font-quicksand-bold text-[18px] text-ink">
            Nueva publicación
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            ...(webMax ?? {}),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Selector de tipo */}
          <View className="flex-row gap-2 mb-5 mt-1">
            {(["vehiculo", "propiedad"] as Tipo[]).map((t) => {
              const active = tipo === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center border ${
                    active ? "bg-accent border-accent" : "bg-white border-line"
                  }`}
                >
                  <Text
                    className={`font-quicksand-bold text-[14px] ${
                      active ? "text-white" : "text-ink"
                    }`}
                  >
                    {t === "vehiculo" ? "Vehículo" : "Propiedad"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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

          {/* Teléfono de contacto (WhatsApp) — ambos tipos */}
          <View className="mb-2">
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

          {/* Consentimiento Habeas Data: solo usuarios autenticados ven el contacto */}
          <View className="mb-4">
            <Checkbox
              checked={consientoContacto}
              onToggle={() => {
                setConsientoContacto((v) => !v);
                if (consentError) setConsentError(null);
              }}
              label="Acepto que mi nombre y teléfono sean visibles para usuarios autenticados de Milink que quieran contactarme sobre esta publicación."
            />
            {consentError ? (
              <Text className="text-[12.5px] text-red-600 font-quicksand-medium mt-1">
                {consentError}
              </Text>
            ) : null}
          </View>

          {/* Fotos */}
          <View className="mt-2">
            <PhotoPicker uris={fotos} onChange={setFotos} />
          </View>
        </ScrollView>

        {/* Botón guardar */}
        <View
          className="px-5 pt-3 pb-5 border-t border-line bg-white"
          style={webMax ?? undefined}
        >
          <Pressable
            onPress={guardar}
            disabled={!puedeGuardar || enviando}
            accessibilityRole="button"
            accessibilityLabel="Guardar publicación"
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
                Guardar publicación
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de éxito / verificación */}
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
              Solicitud recibida
            </Text>
            <Text className="text-[13.5px] text-muted font-quicksand-medium text-center leading-5">
              Tu solicitud de publicación ha sido recibida y se encuentra bajo
              verificación. Para garantizar la seguridad de la comunidad y evitar
              contenido inapropiado o malicioso, un administrador revisará tu
              publicación antes de que sea visible en la aplicación.
            </Text>
            <Pressable
              onPress={() => {
                setExito(false);
                router.replace("/(tabs)");
              }}
              accessibilityRole="button"
              accessibilityLabel="Entendido"
              className="h-12 rounded-full bg-accent items-center justify-center w-full mt-6"
            >
              <Text className="font-quicksand-bold text-[14px] text-white">
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
