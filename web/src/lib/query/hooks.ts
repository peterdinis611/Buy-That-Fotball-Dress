"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAuction,
  getAuction,
  getAuctions,
  getPlayerSheet,
  login,
  placeBid,
  register,
  searchItems,
} from "@/lib/api";
import { persistSession } from "@/lib/auth";
import type { Auction, SearchQuery } from "@/lib/types";
import { queryKeys } from "./keys";
import { loadSession } from "./session";

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: loadSession,
    retry: false,
    staleTime: 60_000,
    enabled: typeof window !== "undefined",
  });
}

export function useAuctionsQuery(initialData?: Auction[]) {
  return useQuery({
    queryKey: queryKeys.auctions.list(),
    queryFn: () => getAuctions(),
    initialData,
  });
}

export function useAuctionQuery(id: string, initialData?: Auction | null) {
  return useQuery({
    queryKey: queryKeys.auctions.detail(id),
    queryFn: () => getAuction(id),
    initialData: initialData ?? undefined,
    enabled: Boolean(id),
  });
}

export function useSearchQuery(query: SearchQuery, initialData?: Awaited<ReturnType<typeof searchItems>>) {
  return useQuery({
    queryKey: queryKeys.search.items(query),
    queryFn: () => searchItems(query),
    initialData,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: (user) => {
      persistSession(user);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      persistSession(user);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}

export function useCreateAuctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAuction,
    onSuccess: (auction) => {
      queryClient.setQueryData(queryKeys.auctions.detail(auction.id), auction);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
    },
  });
}

export function usePlayerSheetQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auctions.sheet(),
    queryFn: getPlayerSheet,
    enabled,
    retry: false,
  });
}

export function usePlaceBidMutation(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => placeBid(auctionId, amount),
    onSuccess: (auction) => {
      queryClient.setQueryData(queryKeys.auctions.detail(auction.id), auction);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
    },
  });
}
