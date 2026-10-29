"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const { user } = await api("/api/auth/me");
      setUser(user);
    } catch (e) {
      // expired or invalid token
      if (e.status === 401) setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const startSession = ({ token, user }) => {
    setToken(token);
    setUser(user);
    return user;
  };

  const login = async (email, password) =>
    startSession(await api("/api/auth/login", { method: "POST", body: { email, password } }));

  const register = async (name, email, password) =>
    startSession(await api("/api/auth/register", { method: "POST", body: { name, email, password } }));

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
