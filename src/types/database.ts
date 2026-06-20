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
  nombre_propietario: string | null;
  motivo_rechazo: string | null;
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
  nombre_propietario?: string | null;
  motivo_rechazo?: string | null;
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
  nombre_propietario: string | null;
  motivo_rechazo: string | null;
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
  nombre_propietario?: string | null;
  motivo_rechazo?: string | null;
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

// ─── Administración de usuarios (RPCs admin_*) ─────────────────────────
export type PublicacionResumen = {
  id: string;
  tipo: "vehiculo" | "propiedad";
  categoria: string;
  resumen: string;
  created_at: string;
  status: PublicacionStatus;
};

export type UsuarioRegistrado = {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  created_at: string;
  total_publicaciones: number;
  publicaciones: PublicacionResumen[];
};

// ─── UGC: reportes y bloqueos ──────────────────────────────────────────
export type ReporteTipo = "vehiculo" | "propiedad";

export type ReporteRow = {
  id: string;
  reportante_id: string;
  tipo: ReporteTipo;
  objeto_id: string;
  motivo: string;
  resuelto: boolean;
  created_at: string;
};

export type ReporteInsert = {
  id?: string;
  reportante_id: string;
  tipo: ReporteTipo;
  objeto_id: string;
  motivo: string;
  resuelto?: boolean;
  created_at?: string;
};

export type ReporteUpdate = Partial<ReporteInsert>;

export type BloqueoRow = {
  bloqueador_id: string;
  bloqueado_id: string;
  created_at: string;
};

export type BloqueoInsert = {
  bloqueador_id: string;
  bloqueado_id: string;
  created_at?: string;
};

export type BloqueoUpdate = Partial<BloqueoInsert>;

export type ReporteAdminRow = {
  id: string;
  tipo: ReporteTipo;
  objeto_id: string;
  motivo: string;
  resuelto: boolean;
  created_at: string;
  reportante_email: string;
  resumen: string | null;
  objeto_status: string | null;
};

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
      reportes: {
        Row: ReporteRow;
        Insert: ReporteInsert;
        Update: ReporteUpdate;
        Relationships: [];
      };
      bloqueos: {
        Row: BloqueoRow;
        Insert: BloqueoInsert;
        Update: BloqueoUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_listar_usuarios: {
        Args: Record<string, never>;
        Returns: UsuarioRegistrado[];
      };
      admin_eliminar_usuario: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      eliminar_mi_cuenta: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      admin_listar_reportes: {
        Args: Record<string, never>;
        Returns: ReporteAdminRow[];
      };
      obtener_contacto_publicacion: {
        Args: { p_tipo: string; p_id: string };
        Returns: { nombre_propietario: string | null; telefono_contacto: string | null }[];
      };
      moderar_publicacion: {
        Args: {
          p_tipo: string;
          p_id: string;
          p_nuevo_status: string;
          p_motivo?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      transmision_tipo: TransmisionTipo;
      combustible_tipo: CombustibleTipo;
      vehiculo_categoria: VehiculoCategoria;
      propiedad_tipo: PropiedadTipo;
      publicacion_status: PublicacionStatus;
      reporte_tipo: ReporteTipo;
    };
    CompositeTypes: Record<string, never>;
  };
};
