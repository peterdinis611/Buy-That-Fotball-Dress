"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { setClientAccessToken } from "@/lib/auth";
import { getQueryClient } from "@/lib/query/client";

function AccessTokenBridge() {
  const { data } = useSession();

  useEffect(() => {
    setClientAccessToken(data?.accessToken ?? null);
  }, [data?.accessToken]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <AccessTokenBridge />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
