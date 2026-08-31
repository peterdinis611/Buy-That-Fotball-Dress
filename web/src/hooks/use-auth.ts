"use client";

import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { clearSession, isSteward } from "@/lib/auth";
import { queryKeys } from "@/lib/query";
import type { AuthUser } from "@/lib/types";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, status } = useSession();

  const user: AuthUser | null = data?.user
    ? {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email ?? "",
        displayName: data.user.displayName,
        roles: data.user.roles ?? [],
      }
    : null;

  return {
    user,
    steward: isSteward(user),
    ready: status !== "loading",
    logout: () => {
      clearSession();
      queryClient.setQueryData(queryKeys.auth.me(), null);
      void queryClient.removeQueries({ queryKey: queryKeys.auctions.sheet() });
      void queryClient.removeQueries({ queryKey: queryKeys.office.all });
      void signOut({ redirect: false });
    },
  };
}
