"use client";

import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { clearSession, setClientAccessToken } from "@/lib/auth";
import { queryKeys } from "@/lib/query";
import type { AuthUser } from "@/lib/types";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, status } = useSession();

  useEffect(() => {
    setClientAccessToken(data?.accessToken ?? null);
  }, [data?.accessToken]);

  const user: AuthUser | null = data?.user
    ? {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        displayName: data.user.displayName,
      }
    : null;

  return {
    user,
    ready: status !== "loading",
    logout: () => {
      clearSession();
      queryClient.setQueryData(queryKeys.auth.me(), null);
      void queryClient.removeQueries({ queryKey: queryKeys.auctions.sheet() });
      void signOut({ redirect: false });
    },
  };
}
