// Datos de ejemplo tomados de la maqueta (Milink html/app.jsx).
// Provisionales hasta conectar Supabase.

export type NuevaEntrada = {
  id: string;
  name: string;
  loc: string;
  price: string;
  img: string;
  tag: string;
};

export type CategoriaKey =
  | "camionetas"
  | "carros"
  | "motos"
  | "apartamentos"
  | "casas"
  | "fincas";

export type Categoria = {
  key: CategoriaKey;
  label: string;
};

export type Disponible = {
  id: string;
  brand: string;
  model: string;
  price: string;
  loc: string;
  locOpcional?: string;
  fuel: "Gasolina" | "Eléctrico" | "Híbrido";
  seats: string;
  trans: "Automático" | "Manual";
  img: string;
};

export const NUEVAS: NuevaEntrada[] = [
  {
    id: "n1",
    name: "Toyota Prado VX",
    loc: "Bogotá",
    price: "450.000",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80&auto=format&fit=crop",
    tag: "NUEVO",
  },
  {
    id: "n2",
    name: "Penthouse El Poblado",
    loc: "Medellín",
    price: "380.000",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80&auto=format&fit=crop",
    tag: "PROPIEDAD",
  },
  {
    id: "n3",
    name: "BYD Yuan Plus",
    loc: "Cali",
    price: "280.000",
    img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80&auto=format&fit=crop",
    tag: "ELÉCTRICO",
  },
  {
    id: "n4",
    name: "Finca Eje Cafetero",
    loc: "Quindío",
    price: "650.000",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80&auto=format&fit=crop",
    tag: "PROPIEDAD",
  },
  {
    id: "n5",
    name: "Mazda CX-30",
    loc: "Cartagena",
    price: "220.000",
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80&auto=format&fit=crop",
    tag: "NUEVO",
  },
];

export const CATEGORIAS: Categoria[] = [
  { key: "camionetas", label: "Camionetas" },
  { key: "carros", label: "Carros" },
  { key: "motos", label: "Motos" },
  { key: "apartamentos", label: "Apartamentos" },
  { key: "casas", label: "Casas" },
  { key: "fincas", label: "Fincas" },
];

export const DISPONIBLES: Disponible[] = [
  {
    id: "v1",
    brand: "Toyota",
    model: "Prado VX",
    price: "450.000",
    loc: "Bogotá",
    fuel: "Gasolina",
    seats: "5",
    trans: "Automático",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: "v2",
    brand: "BYD",
    model: "Yuan Plus",
    price: "280.000",
    loc: "Medellín",
    fuel: "Eléctrico",
    seats: "5",
    trans: "Automático",
    img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: "v3",
    brand: "Renault",
    model: "Duster",
    price: "180.000",
    loc: "Cartagena",
    fuel: "Gasolina",
    seats: "5",
    trans: "Manual",
    img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: "v4",
    brand: "Mercedes-Benz",
    model: "Clase C",
    price: "520.000",
    loc: "Bogotá",
    fuel: "Híbrido",
    seats: "5",
    trans: "Automático",
    img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: "v5",
    brand: "Mazda",
    model: "CX-30",
    price: "220.000",
    loc: "Cali",
    fuel: "Gasolina",
    seats: "5",
    trans: "Automático",
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: "v6",
    brand: "Chevrolet",
    model: "Tracker",
    price: "160.000",
    loc: "Bucaramanga",
    fuel: "Gasolina",
    seats: "5",
    trans: "Manual",
    img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80&auto=format&fit=crop",
  },
];
