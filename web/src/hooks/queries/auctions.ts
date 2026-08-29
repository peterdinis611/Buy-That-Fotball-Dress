"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAuction, getAuction, getAuctions, getPlayerSheet, placeBid } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Auction, Bid } from "@/lib/types";

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
    onSuccess: (bid: Bid) => {
      queryClient.setQueryData(queryKeys.auctions.detail(auctionId), (current: Auction | undefined) =>
        current
          ? { ...current, currentHighBid: bid.amount, highBidder: bid.bidder }
          : current,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
    },
  });
}
