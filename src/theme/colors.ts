// Paleta de Milink — tomada de la maqueta (Milink html/app.jsx)
export const COLORS = {
  bg: "#F8FAFC", // fondo principal (slate-50)
  text: "#0F172A", // texto principal (slate-900)
  muted: "#64748B", // texto secundario (slate-500)
  border: "#E2E8F0", // bordes (slate-200)
  accent: "#10B981", // verde esmeralda (emerald-500)
  accentSoft: "#D1FAE5", // emerald-100
  accentTint: "#ECFDF5", // emerald-50
  white: "#FFFFFF",
  categoryBg: "#DCE1ED", // fondo de las píldoras de categoría
  imagePlaceholder: "#334155", // base del gradiente de imágenes
} as const;

// Familias de la fuente Quicksand (deben coincidir con los nombres cargados en app/_layout.tsx)
export const FONTS = {
  regular: "Quicksand_400Regular",
  medium: "Quicksand_500Medium",
  semibold: "Quicksand_600SemiBold",
  bold: "Quicksand_700Bold",
} as const;
