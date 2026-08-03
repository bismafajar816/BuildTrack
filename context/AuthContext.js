import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate session from localStorage on first load
    const storedUser = localStorage.getItem("buildtrack_user");
    const token = localStorage.getItem("buildtrack_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persistSession(token, user) {
    localStorage.setItem("buildtrack_token", token);
    localStorage.setItem("buildtrack_user", JSON.stringify(user));
    setUser(user);
  }

  async function registerCompany({ companyName, fullName, email, password }) {
    const { data } = await api.post("/auth/register", {
      companyName,
      fullName,
      email,
      password,
    });
    persistSession(data.token, data.user);
    return data;
  }

  async function login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data.token, data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("buildtrack_token");
    localStorage.removeItem("buildtrack_user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, registerCompany, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
