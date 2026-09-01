"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { BoardToaster } from "@/features/pitch/board-toast";
import { useLiveBoard } from "@/hooks/use-live-board";
import { setClientAccessToken } from "@/lib/auth";
import { getQueryClient } from "@/lib/query/client";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        <TooltipProvider delay={280}>
          <LiveBoard />
          <BoardToaster />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
