// Validación de publicaciones con Zod. El formulario sigue siendo controlado por
// useState; estos esquemas se usan en el submit (safeParse) para validar y mostrar
// errores por campo.
import { z } from "zod";

// ── Indicativos de país ──────────────────────────────────────────────
export type CountryCode = {
  dial: string; // ej. "+57"
  label: string; // ej. "Colombia"
  flag: string; // emoji
};

export const COUNTRY_CODES: CountryCode[] = [
  { dial: "+57", label: "Colombia", flag: "🇨🇴" },
  { dial: "+1", label: "EE. UU. / Canadá", flag: "🇺🇸" },
  { dial: "+52", label: "México", flag: "🇲🇽" },
  { dial: "+58", label: "Venezuela", flag: "🇻🇪" },
  { dial: "+593", label: "Ecuador", flag: "🇪🇨" },
  { dial: "+51", label: "Perú", flag: "🇵🇪" },
  { dial: "+56", label: "Chile", flag: "🇨🇱" },
  { dial: "+54", label: "Argentina", flag: "🇦🇷" },
  { dial: "+34", label: "España", flag: "🇪🇸" },
  { dial: "+507", label: "Panamá", flag: "🇵🇦" },
];

const DIALS = COUNTRY_CODES.map((c) => c.dial);

/** Une indicativo + número en el formato wa.me (solo dígitos), ej. "573001234567". */
export function telefonoCompleto(indicativo: string, numero: string): string {
  const dial = indicativo.replace(/\D/g, "");
  const num = numero.replace(/\D/g, "");
  return `${dial}${num}`;
}

// ── Sub-esquemas ─────────────────────────────────────────────────────
const numeroTexto = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => Number.isFinite(Number(v.replace(",", "."))), "Debe ser un número");

const telefonoFields = {
  indicativo: z
    .string()
    .refine((v) => DIALS.includes(v), "Selecciona el indicativo"),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{7,12}$/, "Número inválido (solo dígitos, 7 a 12)"),
};

// ── Esquema Vehículo ─────────────────────────────────────────────────
export const vehiculoSchema = z.object({
  marca: z.string().trim().min(1, "La marca es obligatoria"),
  modelo: z.string().trim().min(1, "El modelo es obligatorio"),
  ano: numeroTexto("El año es obligatorio").refine((v) => {
    const n = Number(v);
    return n >= 1950 && n <= new Date().getFullYear() + 1;
  }, "Año fuera de rango"),
  categoria: z.string().min(1, "Selecciona la categoría"),
  transmision: z.string().min(1, "Selecciona la transmisión"),
  combustible: z.string().min(1, "Selecciona el combustible"),
  color: z.string().trim().min(1, "El color es obligatorio"),
  sillas: numeroTexto("Las sillas son obligatorias"),
  kilometraje: numeroTexto("El kilometraje es obligatorio"),
  precio: numeroTexto("El precio es obligatorio"),
  ciudad: z.string().trim().min(1, "La ciudad de entrega es obligatoria"),
  ciudadOpcional: z.string().trim().optional(), // opcional, sin validación dura
  ...telefonoFields,
});

// ── Esquema Propiedad ────────────────────────────────────────────────
export const propiedadSchema = z.object({
  tipoPropiedad: z.string().min(1, "Selecciona el tipo de propiedad"),
  titulo: z.string().trim().min(1, "El título es obligatorio"),
  departamento: z.string().trim().min(1, "El departamento es obligatorio"),
  ciudad: z.string().trim().min(1, "La ciudad es obligatoria"),
  precio: numeroTexto("El precio es obligatorio"),
  huespedes: numeroTexto("La capacidad es obligatoria"),
  habitaciones: numeroTexto("Las habitaciones son obligatorias"),
  camas: numeroTexto("Las camas son obligatorias"),
  banos: numeroTexto("Los baños son obligatorios"),
  ...telefonoFields,
});

export type VehiculoFormValues = z.infer<typeof vehiculoSchema>;
export type PropiedadFormValues = z.infer<typeof propiedadSchema>;
