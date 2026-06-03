// BottomSheet reutilizable de filtros. Soporta modo 'vehiculo' y 'propiedad'.
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { X } from "./icons";
import { COLORS } from "../theme/colors";
import type {
  FiltrosPropiedad,
  FiltrosVehiculo,
} from "../services/feed";
import type {
  CombustibleTipo,
  PropiedadTipo,
} from "../types/database";

const COMBUSTIBLES: { value: CombustibleTipo; label: string }[] = [
  { value: "gasolina", label: "Gasolina" },
  { value: "diesel", label: "Diésel" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
  { value: "gas", label: "Gas" },
];

const TIPOS_PROPIEDAD: { value: PropiedadTipo; label: string }[] = [
  { value: "finca", label: "Finca" },
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
];

const toNum = (s: string): number | undefined => {
  if (!s.trim()) return undefined;
  const n = Number(s.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};
function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        active ? "bg-accent border-accent" : "bg-white border-line"
      }`}
    >
      <Text
        className={`text-[12.5px] font-quicksand-semibold ${
          active ? "text-white" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CampoTexto({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className="mb-3">
      <Text className="text-[13px] font-quicksand-semibold text-ink mb-1.5">
        {label}
      </Text>
      <TextInput
        className="rounded-2xl px-4 text-[14px] text-ink font-quicksand-medium bg-[#F1F5F9]"
        style={{ height: 46 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        autoCapitalize="words"
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
type Props =
  | {
      visible: boolean;
      onClose: () => void;
      mode: "vehiculo";
      /** Fija la categoría (cuando ya entraste a "Camionetas", no se cambia). */
      categoriaFija?: FiltrosVehiculo["categoria"];
      value: FiltrosVehiculo;
      onApply: (filtros: FiltrosVehiculo) => void;
    }
  | {
      visible: boolean;
      onClose: () => void;
      mode: "propiedad";
      tipoFijo?: FiltrosPropiedad["tipoPropiedad"];
      value: FiltrosPropiedad;
      onApply: (filtros: FiltrosPropiedad) => void;
    };

export function FiltrosSheet(props: Props) {
  if (props.mode === "vehiculo") return <FiltrosVehiculoSheet {...props} />;
  return <FiltrosPropiedadSheet {...props} />;
}

// ─── Vehículo ────────────────────────────────────────────────────────
function FiltrosVehiculoSheet({
  visible,
  onClose,
  value,
  onApply,
  categoriaFija,
}: Extract<Props, { mode: "vehiculo" }>) {
  const [ciudad, setCiudad] = useState(value.ciudad ?? "");
  const [marca, setMarca] = useState(value.marca ?? "");
  const [precioMin, setPrecioMin] = useState(
    value.precioMin != null ? String(value.precioMin) : ""
  );
  const [precioMax, setPrecioMax] = useState(
    value.precioMax != null ? String(value.precioMax) : ""
  );
  const [combustible, setCombustible] = useState<CombustibleTipo | undefined>(
    value.combustible
  );

  // Sincroniza si abren el sheet con nuevos valores
  useEffect(() => {
    if (visible) {
      setCiudad(value.ciudad ?? "");
      setMarca(value.marca ?? "");
      setPrecioMin(value.precioMin != null ? String(value.precioMin) : "");
      setPrecioMax(value.precioMax != null ? String(value.precioMax) : "");
      setCombustible(value.combustible);
    }
  }, [visible]);

  const aplicar = () => {
    onApply({
      categoria: categoriaFija ?? value.categoria,
      ciudad: ciudad.trim() || undefined,
      marca: marca.trim() || undefined,
      precioMin: toNum(precioMin),
      precioMax: toNum(precioMax),
      combustible,
    });
    onClose();
  };

  const limpiar = () => {
    setCiudad("");
    setMarca("");
    setPrecioMin("");
    setPrecioMax("");
    setCombustible(undefined);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Filtrar vehículos">
      <CampoTexto
        label="Ciudad"
        value={ciudad}
        onChangeText={setCiudad}
        placeholder="Ej. Bogotá"
      />
      <CampoTexto
        label="Marca"
        value={marca}
        onChangeText={setMarca}
        placeholder="Ej. Toyota"
      />
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <CampoTexto
            label="Precio mín."
            value={precioMin}
            onChangeText={setPrecioMin}
            placeholder="Ej. 100000"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <CampoTexto
            label="Precio máx."
            value={precioMax}
            onChangeText={setPrecioMax}
            placeholder="Ej. 500000"
            keyboardType="numeric"
          />
        </View>
      </View>
      <Text className="text-[13px] font-quicksand-semibold text-ink mb-2">
        Tipo de combustible
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {COMBUSTIBLES.map((c) => (
          <Chip
            key={c.value}
            label={c.label}
            active={combustible === c.value}
            onPress={() =>
              setCombustible((prev) => (prev === c.value ? undefined : c.value))
            }
          />
        ))}
      </View>

      <SheetButtons onClear={limpiar} onApply={aplicar} />
    </Sheet>
  );
}

// ─── Propiedad ───────────────────────────────────────────────────────
function FiltrosPropiedadSheet({
  visible,
  onClose,
  value,
  onApply,
  tipoFijo,
}: Extract<Props, { mode: "propiedad" }>) {
  const [ciudad, setCiudad] = useState(value.ciudad ?? "");
  const [precioMin, setPrecioMin] = useState(
    value.precioMin != null ? String(value.precioMin) : ""
  );
  const [precioMax, setPrecioMax] = useState(
    value.precioMax != null ? String(value.precioMax) : ""
  );
  const [huespedes, setHuespedes] = useState(
    value.huespedesMin != null ? String(value.huespedesMin) : ""
  );
  const [tipo, setTipo] = useState<PropiedadTipo | undefined>(
    value.tipoPropiedad ?? tipoFijo
  );

  useEffect(() => {
    if (visible) {
      setCiudad(value.ciudad ?? "");
      setPrecioMin(value.precioMin != null ? String(value.precioMin) : "");
      setPrecioMax(value.precioMax != null ? String(value.precioMax) : "");
      setHuespedes(
        value.huespedesMin != null ? String(value.huespedesMin) : ""
      );
      setTipo(value.tipoPropiedad ?? tipoFijo);
    }
  }, [visible]);

  const aplicar = () => {
    onApply({
      tipoPropiedad: tipoFijo ?? tipo,
      ciudad: ciudad.trim() || undefined,
      precioMin: toNum(precioMin),
      precioMax: toNum(precioMax),
      huespedesMin: toNum(huespedes),
    });
    onClose();
  };
  const limpiar = () => {
    setCiudad("");
    setPrecioMin("");
    setPrecioMax("");
    setHuespedes("");
    if (!tipoFijo) setTipo(undefined);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Filtrar propiedades">
      {!tipoFijo ? (
        <>
          <Text className="text-[13px] font-quicksand-semibold text-ink mb-2">
            Tipo de propiedad
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {TIPOS_PROPIEDAD.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                active={tipo === t.value}
                onPress={() =>
                  setTipo((prev) => (prev === t.value ? undefined : t.value))
                }
              />
            ))}
          </View>
        </>
      ) : null}

      <CampoTexto
        label="Ciudad"
        value={ciudad}
        onChangeText={setCiudad}
        placeholder="Ej. Medellín"
      />
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <CampoTexto
            label="Precio mín."
            value={precioMin}
            onChangeText={setPrecioMin}
            placeholder="Ej. 200000"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <CampoTexto
            label="Precio máx."
            value={precioMax}
            onChangeText={setPrecioMax}
            placeholder="Ej. 1000000"
            keyboardType="numeric"
          />
        </View>
      </View>
      <CampoTexto
        label="Huéspedes mínimo"
        value={huespedes}
        onChangeText={setHuespedes}
        placeholder="Ej. 4"
        keyboardType="numeric"
      />

      <SheetButtons onClear={limpiar} onApply={aplicar} />
    </Sheet>
  );
}

// ─── Contenedor común del sheet ──────────────────────────────────────
function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15,23,42,0.55)" }}
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-3xl px-5 pt-3 pb-6"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center mb-2">
            <View className="w-10 h-1 rounded-full bg-line" />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-quicksand-bold text-[18px] text-ink">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              className="w-9 h-9 rounded-full items-center justify-center bg-[#F1F5F9]"
            >
              <X size={18} color={COLORS.text} />
            </Pressable>
          </View>
          <ScrollView
            style={{ maxHeight: 460 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetButtons({
  onClear,
  onApply,
}: {
  onClear: () => void;
  onApply: () => void;
}) {
  return (
    <View className="flex-row gap-3 mt-2">
      <Pressable
        onPress={onClear}
        className="flex-1 h-12 rounded-full items-center justify-center border border-line"
      >
        <Text className="font-quicksand-semibold text-[14px] text-ink">
          Limpiar
        </Text>
      </Pressable>
      <Pressable
        onPress={onApply}
        className="flex-1 h-12 rounded-full items-center justify-center bg-accent"
      >
        <Text className="font-quicksand-bold text-[14px] text-white">
          Aplicar
        </Text>
      </Pressable>
    </View>
  );
}
