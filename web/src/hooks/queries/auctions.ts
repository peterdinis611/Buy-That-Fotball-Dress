"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAuction,
  deleteAuction,
  getAuction,
  getAuctions,
  getBids,
  getPlayerSheet,
  placeBid,
  relistAuction,
  unwatchAuction,
  updateAuction,
  watchAuction,
} from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Auction, Bid, PlayerSheet, UpdateAuctionPayload } from "@/lib/types";

export function useAuctionsQuery(initialData?: Auction[]) {
  return useQuery({
    queryKey: queryKeys.auctions.list({ status: "Live" }),
    queryFn: () => getAuctions({ status: "Live" }),
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
    mutationFn: (input: { amount: number; maxAmount?: number }) =>
      placeBid(auctionId, input.amount, input.maxAmount),
    onSuccess: (bid: Bid) => {
      queryClient.setQueryData(queryKeys.auctions.detail(auctionId), (current: Auction | undefined) =>
        current
          ? { ...current, currentHighBid: bid.amount, highBidder: bid.bidder }
          : current,
      );
      queryClient.setQueryData(queryKeys.bids.list(auctionId), (current: Bid[] | undefined) =>
        mergeBid(current, bid),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
    },
  });
}

export function useBidsQuery(auctionId: string, initialData?: Bid[]) {
  return useQuery({
    queryKey: queryKeys.bids.list(auctionId),
    queryFn: () => getBids(auctionId),
    initialData,
    enabled: Boolean(auctionId),
  });
}

function mergeBid(current: Bid[] | undefined, bid: Bid) {
  if (!current) return [bid];
  if (current.some((row) => row.id === bid.id)) return current;
  return [...current, bid].sort((left, right) => {
    if (right.amount !== left.amount) return right.amount - left.amount;
    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}

function bumpCaches(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
}

export function useUpdateAuctionMutation(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAuctionPayload) => updateAuction(auctionId, payload),
    onSuccess: (auction) => {
      queryClient.setQueryData(queryKeys.auctions.detail(auction.id), auction);
      bumpCaches(queryClient);
    },
  });
}

export function useDeleteAuctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAuction,
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.auctions.detail(id) });
      bumpCaches(queryClient);
    },
  });
}

export function useRelistAuctionMutation(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionEnd: string) => relistAuction(auctionId, auctionEnd),
    onSuccess: (auction) => {
      queryClient.setQueryData(queryKeys.auctions.detail(auction.id), auction);
      bumpCaches(queryClient);
    },
  });
}

export function useHangLotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auction: Auction) => watchAuction(auction.id),
    onMutate: async (auction) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auctions.sheet() });
      const previous = queryClient.getQueryData<PlayerSheet>(queryKeys.auctions.sheet());
      queryClient.setQueryData(queryKeys.auctions.sheet(), (current: PlayerSheet | undefined) => {
        if (!current) return current;
        const watching = current.watching ?? [];
        if (watching.some((row) => row.id === auction.id)) return current;
        return { ...current, watching: [auction, ...watching] };
      });
      return { previous };
    },
    onError: (_error, _auction, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.auctions.sheet(), context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
    },
  });
}

export function useWatchMutation(auction: Auction) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (next: boolean) => (next ? watchAuction(auction.id) : unwatchAuction(auction.id)),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auctions.sheet() });
      const previous = queryClient.getQueryData<PlayerSheet>(queryKeys.auctions.sheet());
      queryClient.setQueryData(queryKeys.auctions.sheet(), (current: PlayerSheet | undefined) => {
        if (!current) return current;
        const watching = current.watching ?? [];
        return {
          ...current,
          watching: next
            ? watching.some((row) => row.id === auction.id)
              ? watching
              : [auction, ...watching]
            : watching.filter((row) => row.id !== auction.id),
        };
      });
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.auctions.sheet(), context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.sheet() });
    },
  });
}
