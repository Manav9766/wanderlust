import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // while checking /me

  // hydrate on first load
  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      try {
        setLoading(true);
        const res = await api.get("/auth/me");
        if (!ignore) setUser(res.data.user);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    hydrate();
    return () => { ignore = true; };
  }, []);

  async function login({ username, password }) {
    const res = await api.post("/auth/login", { username, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function signup({ username, email, password }) {
    const res = await api.post("/auth/signup", { username, email, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      signup,
      logout,
      setUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
