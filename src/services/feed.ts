// Servicio del feed público: vehículos aprobados desde Supabase.
// Adaptado al tipo `Disponible` que ya consume la UI (src/data/mock.ts).
import { supabase } from "../lib/supabase";
import type { Disponible } from "../data/mock";

/** Trae los últimos vehículos aprobados, mapeados a la forma `Disponible` que usa la UI. */
export async function listarVehiculosAprobados(
  limit = 20
): Promise<Disponible[]> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select(
      "id, marca, modelo, precio_alquiler_diario, ciudad_entrega_principal, ciudad_entrega_opcional, tipo_combustible, numero_sillas, transmision, imagenes"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row): Disponible => {
    // Mapeo a las strings de display que espera la card
    const fuel: Disponible["fuel"] =
      row.tipo_combustible === "electrico"
        ? "Eléctrico"
        : row.tipo_combustible === "hibrido"
        ? "Híbrido"
        : "Gasolina";
    const trans: Disponible["trans"] =
      row.transmision === "automatico" ? "Automático" : "Manual";

    return {
      id: row.id,
      brand: row.marca,
      model: row.modelo,
      price: row.precio_alquiler_diario.toLocaleString("es-CO"),
      loc: row.ciudad_entrega_principal,
      locOpcional: row.ciudad_entrega_opcional ?? undefined,
      fuel,
      seats: String(row.numero_sillas ?? 5),
      trans,
      img: row.imagenes?.[0] ?? "",
    };
  });
}
