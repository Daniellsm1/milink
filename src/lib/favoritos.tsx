// Favoritos locales: persistidos en AsyncStorage (sin Supabase).
// Provider + hook con la misma forma que SessionProvider/useSession.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@milink:favoritos";

export type FavoritoTipo = "vehiculo" | "propiedad";

export type Favorito = {
  id: string;
  tipo: FavoritoTipo;
  addedAt: number;
};

type FavoritosContextValue = {
  favoritos: Favorito[];
  loading: boolean;
  esFavorito: (id: string) => boolean;
  toggleFavorito: (id: string, tipo: FavoritoTipo) => Promise<void>;
};

const FavoritosContext = createContext<FavoritosContextValue>({
  favoritos: [],
  loading: true,
  esFavorito: () => false,
  toggleFavorito: async () => {},
});

function parseFavoritos(raw: string | null): Favorito[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is Favorito =>
        f &&
        typeof f.id === "string" &&
        (f.tipo === "vehiculo" || f.tipo === "propiedad") &&
        typeof f.addedAt === "number"
    );
  } catch {
    return [];
  }
}

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        setFavoritos(parseFavoritos(raw));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const esFavorito = useCallback(
    (id: string) => favoritos.some((f) => f.id === id),
    [favoritos]
  );

  const toggleFavorito = useCallback(
    async (id: string, tipo: FavoritoTipo) => {
      const exists = favoritos.some((f) => f.id === id);
      const next = exists
        ? favoritos.filter((f) => f.id !== id)
        : [{ id, tipo, addedAt: Date.now() }, ...favoritos];
      setFavoritos(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        // Revertimos si la persistencia falla.
        console.warn("No se pudo guardar favoritos:", err);
        setFavoritos(favoritos);
      }
    },
    [favoritos]
  );

  const value = useMemo<FavoritosContextValue>(
    () => ({ favoritos, loading, esFavorito, toggleFavorito }),
    [favoritos, loading, esFavorito, toggleFavorito]
  );

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  return useContext(FavoritosContext);
}
