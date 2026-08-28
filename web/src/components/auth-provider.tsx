"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getMe, login as loginRequest, register as registerRequest } from "@/lib/api";
import { clearSession, getStoredUser, persistSession } from "@/lib/session";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);

    getMe()
      .then((current) => {
        if (current === "unavailable") return;
        if (current) {
          persistSession(current);
          setUser(current);
        } else {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: async (username, password) => {
        const next = await loginRequest(username, password);
        persistSession(next);
        setUser(next);
      },
      register: async (payload) => {
        const next = await registerRequest(payload);
        persistSession(next);
        setUser(next);
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
