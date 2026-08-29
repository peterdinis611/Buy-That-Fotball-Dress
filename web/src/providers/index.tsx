"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useLiveBoard } from "@/hooks/use-live-board";
import { setClientAccessToken } from "@/lib/auth";
import { getQueryClient } from "@/lib/query/client";

function AccessTokenBridge() {
  const { data } = useSession();
  setClientAccessToken(data?.accessToken ?? null);
  return null;
}

function LiveBoard() {
  useLiveBoard();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <AccessTokenBridge />
      <QueryClientProvider client={queryClient}>
        <LiveBoard />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
