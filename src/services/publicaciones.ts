// Lógica de negocio para crear publicaciones.
// Regla clave: toda publicación nueva entra con status 'pending_approval' y NO
// es visible en el feed público hasta que un administrador la apruebe.
import { supabase } from "../lib/supabase";
import { subirImagenes } from "./storage";
import type {
  CombustibleTipo,
  PropiedadTipo,
  TransmisionTipo,
  VehiculoCategoria,
} from "../types/database";

export type VehiculoFormData = {
  marca: string;
  modelo: string;
  ano: number;
  categoria: VehiculoCategoria;
  transmision: TransmisionTipo;
  tipo_combustible: CombustibleTipo;
  color: string;
  numero_sillas: number;
  kilometraje: number;
  precio_alquiler_diario: number;
  ciudad_entrega_principal: string;
  kilometraje_permitido_diario: number | null;
  tiene_aire_acondicionado: boolean;
  descripcion: string | null;
};

export type PropiedadFormData = {
  tipo_propiedad: PropiedadTipo;
  titulo: string;
  departamento: string;
  ciudad_municipio: string;
  precio_alquiler_diario: number;
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
  descripcion: string | null;
};

async function getUsuarioId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Debes iniciar sesión para publicar.");
  }
  return data.user.id;
}

export async function crearVehiculo(
  form: VehiculoFormData,
  uris: string[]
): Promise<void> {
  if (uris.length !== 3) {
    throw new Error("Debes adjuntar exactamente 3 fotografías.");
  }
  const usuarioId = await getUsuarioId();
  const imagenes = await subirImagenes(usuarioId, "vehiculos", uris);

  const { error } = await supabase.from("vehiculos").insert({
    usuario_id: usuarioId,
    ...form,
    imagenes,
    disponible: true,
    status: "pending_approval",
  });

  if (error) throw new Error(error.message);
}

export async function crearPropiedad(
  form: PropiedadFormData,
  uris: string[]
): Promise<void> {
  if (uris.length !== 3) {
    throw new Error("Debes adjuntar exactamente 3 fotografías.");
  }
  const usuarioId = await getUsuarioId();
  const imagenes = await subirImagenes(usuarioId, "propiedades", uris);

  const { error } = await supabase.from("propiedades").insert({
    usuario_id: usuarioId,
    ...form,
    imagenes,
    disponible: true,
    status: "pending_approval",
  });

  if (error) throw new Error(error.message);
}
