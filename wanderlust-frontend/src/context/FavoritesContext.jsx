import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast(); // ✅ correct place

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // per-listing pending state (for disabling hearts)
  const [pendingIds, setPendingIds] = useState(() => new Set());

  async function refreshFavorites() {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    const res = await api.get("/users/me/favorites");
    setFavorites(res.data.data || []);
  }

  useEffect(() => {
    let ignore = false;

    async function loadFavorites() {
      if (authLoading) return;

      if (!isAuthenticated) {
        setFavorites([]);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/users/me/favorites");
        if (!ignore) setFavorites(res.data.data || []);
      } catch {
        if (!ignore) setFavorites([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, authLoading]);

  function isFavorite(listingId) {
    return favorites.some((f) => f._id === listingId);
  }

  function setPending(listingId, on) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(listingId) : next.delete(listingId);
      return next;
    });
  }

  function isPending(listingId) {
    return pendingIds.has(listingId);
  }

  // ⭐ Phase 2 Step 8 — Toast-enabled favorite toggle
  async function toggleFavorite(listingId) {
    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }

    if (isPending(listingId)) return;

    const wasFav = isFavorite(listingId);
    const prevFavorites = favorites;

    // Optimistic UI
    if (wasFav) {
      setFavorites((curr) => curr.filter((f) => f._id !== listingId));
    } else {
      setFavorites((curr) => [{ _id: listingId }, ...curr]);
    }

    setPending(listingId, true);

    try {
      if (wasFav) {
        await api.delete(`/users/me/favorites/${listingId}`);
        toast.success("Removed from favorites");
      } else {
        await api.post(`/users/me/favorites/${listingId}`);
        toast.success("Added to favorites");
      }

      await refreshFavorites();
    } catch (e) {
      setFavorites(prevFavorites);
      toast.error("Failed to update favorites");
    } finally {
      setPending(listingId, false);
    }
  }

  const value = useMemo(
    () => ({
      favorites,
      loading,
      isFavorite,
      toggleFavorite,
      isPending,
      refreshFavorites,
    }),
    [favorites, loading, pendingIds]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
