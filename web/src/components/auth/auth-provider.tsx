"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearSession } from "@/lib/auth";
import { queryKeys } from "@/lib/query";
import { useSessionQuery } from "@/lib/query/hooks";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useSessionQuery();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.data ?? null,
      ready: session.isFetched,
      logout: () => {
        clearSession();
        queryClient.setQueryData(queryKeys.auth.me(), null);
      },
    }),
    [queryClient, session.data, session.isFetched],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
