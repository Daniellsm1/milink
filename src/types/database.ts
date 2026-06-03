// Tipos del esquema public de Supabase.
// Coinciden con supabase/migrations/0001_init.sql.
// Cuando ejecutes la migración, puedes regenerar este archivo con el comando:
//   supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts
// o desde el dashboard (Database → API Docs → "TypeScript types").

export type TransmisionTipo = "mecanico" | "automatico";
export type CombustibleTipo =
  | "gasolina"
  | "diesel"
  | "hibrido"
  | "electrico"
  | "gas";
export type VehiculoCategoria = "automovil" | "camioneta" | "motocicleta";
export type PropiedadTipo = "finca" | "apartamento" | "casa";
export type PublicacionStatus = "pending_approval" | "approved" | "rejected";

export type VehiculoRow = {
  id: string;
  usuario_id: string;
  marca: string;
  modelo: string;
  ano: number;
  color: string | null;
  placa_terminacion: number | null;
  kilometraje: number;
  transmision: TransmisionTipo;
  tipo_combustible: CombustibleTipo;
  categoria: VehiculoCategoria;
  numero_sillas: number | null;
  capacidad_baul_litros: number | null;
  fecha_vencimiento_soat: string | null;
  fecha_vencimiento_tecnomec: string | null;
  tiene_aire_acondicionado: boolean;
  precio_alquiler_diario: number;
  kilometraje_permitido_diario: number | null;
  deposito_garantia: number | null;
  permite_conductor_adicional: boolean;
  ciudad_entrega_principal: string;
  ciudad_entrega_opcional: string | null;
  telefono_contacto: string | null;
  descripcion: string | null;
  imagenes: string[];
  disponible: boolean;
  status: PublicacionStatus;
  created_at: string;
  updated_at: string;
};

// Campos requeridos al insertar; los nullables y los que tienen DEFAULT en la
// BD quedan opcionales.
export type VehiculoInsert = {
  id?: string;
  usuario_id: string;
  marca: string;
  modelo: string;
  ano: number;
  color?: string | null;
  placa_terminacion?: number | null;
  kilometraje?: number;
  transmision: TransmisionTipo;
  tipo_combustible: CombustibleTipo;
  categoria: VehiculoCategoria;
  numero_sillas?: number | null;
  capacidad_baul_litros?: number | null;
  fecha_vencimiento_soat?: string | null;
  fecha_vencimiento_tecnomec?: string | null;
  tiene_aire_acondicionado?: boolean;
  precio_alquiler_diario: number;
  kilometraje_permitido_diario?: number | null;
  deposito_garantia?: number | null;
  permite_conductor_adicional?: boolean;
  ciudad_entrega_principal: string;
  ciudad_entrega_opcional?: string | null;
  telefono_contacto?: string | null;
  descripcion?: string | null;
  imagenes?: string[];
  disponible?: boolean;
  status?: PublicacionStatus;
  created_at?: string;
  updated_at?: string;
};

export type VehiculoUpdate = Partial<VehiculoInsert>;

export type PropiedadRow = {
  id: string;
  usuario_id: string;
  tipo_propiedad: PropiedadTipo;
  titulo: string;
  descripcion: string | null;
  precio_alquiler_diario: number;
  departamento: string;
  ciudad_municipio: string;
  capacidad_huespedes: number;
  numero_habitaciones: number;
  numero_camas: number;
  numero_banos: number;
  tiene_piscina: boolean;
  tiene_wifi: boolean;
  tiene_parqueadero: boolean;
  tiene_aire_acondicionado: boolean;
  es_pet_friendly: boolean;
  tiene_zona_bbq: boolean;
  telefono_contacto: string | null;
  imagenes: string[];
  disponible: boolean;
  status: PublicacionStatus;
  created_at: string;
  updated_at: string;
};

export type PropiedadInsert = {
  id?: string;
  usuario_id: string;
  tipo_propiedad: PropiedadTipo;
  titulo: string;
  descripcion?: string | null;
  precio_alquiler_diario: number;
  departamento: string;
  ciudad_municipio: string;
  capacidad_huespedes: number;
  numero_habitaciones: number;
  numero_camas: number;
  numero_banos: number;
  tiene_piscina?: boolean;
  tiene_wifi?: boolean;
  tiene_parqueadero?: boolean;
  tiene_aire_acondicionado?: boolean;
  es_pet_friendly?: boolean;
  tiene_zona_bbq?: boolean;
  telefono_contacto?: string | null;
  imagenes?: string[];
  disponible?: boolean;
  status?: PublicacionStatus;
  created_at?: string;
  updated_at?: string;
};

export type PropiedadUpdate = Partial<PropiedadInsert>;

export type ResenaRow = {
  id: string;
  usuario_id: string;
  vehiculo_id: string | null;
  propiedad_id: string | null;
  calificacion: number; // 1..5
  comentario: string | null;
  created_at: string;
  updated_at: string;
};

export type ResenaInsert = Omit<
  ResenaRow,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ResenaUpdate = Partial<ResenaInsert>;

// Forma compatible con supabase-js (createClient<Database>())
export type Database = {
  public: {
    Tables: {
      vehiculos: {
        Row: VehiculoRow;
        Insert: VehiculoInsert;
        Update: VehiculoUpdate;
        Relationships: [];
      };
      propiedades: {
        Row: PropiedadRow;
        Insert: PropiedadInsert;
        Update: PropiedadUpdate;
        Relationships: [];
      };
      resenas: {
        Row: ResenaRow;
        Insert: ResenaInsert;
        Update: ResenaUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      transmision_tipo: TransmisionTipo;
      combustible_tipo: CombustibleTipo;
      vehiculo_categoria: VehiculoCategoria;
      propiedad_tipo: PropiedadTipo;
      publicacion_status: PublicacionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
