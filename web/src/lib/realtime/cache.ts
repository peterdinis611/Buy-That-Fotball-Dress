import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import type { Auction, AuctionStatus, Bid, PagedResult, PlayerSheet, SearchItem } from "@/lib/types";

export type LiveAuctionUpdated = {
  id: string;
  reservePrice: number;
  seller: string;
  winner?: string;
  soldAmount?: number;
  currentHighBid?: number;
  createdAt: string;
  updatedAt: string;
  auctionEnd: string;
  status: AuctionStatus;
};

export type LiveAuctionDeleted = {
  id: string;
};

function isAuction(value: unknown): value is Auction {
  return Boolean(value && typeof value === "object" && "id" in value && "item" in value);
}

function isSheet(value: unknown): value is PlayerSheet {
  return Boolean(value && typeof value === "object" && "listed" in value && "chasing" in value && "won" in value);
}

function isSearchPage(value: unknown): value is PagedResult<SearchItem> {
  return Boolean(value && typeof value === "object" && "results" in value && "totalCount" in value);
}

function patchAuction(auction: Auction, patch: Partial<Auction>): Auction {
  const next = { ...auction };
  (Object.keys(patch) as (keyof Auction)[]).forEach((key) => {
    const value = patch[key];
    if (value !== undefined) {
      (next[key] as Auction[typeof key]) = value;
    }
  });
  return next;
}

function patchSheet(sheet: PlayerSheet, id: string, patch: Partial<Auction>): PlayerSheet {
  const map = (rows: Auction[]) => rows.map((row) => (row.id === id ? patchAuction(row, patch) : row));
  return {
    listed: map(sheet.listed),
    chasing: map(sheet.chasing),
    won: map(sheet.won),
  };
}

function isClosedLot(status?: AuctionStatus) {
  return status === "Finished" || status === "ReserveNotMet";
}

function applyAuctionPatch(queryClient: QueryClient, id: string, patch: Partial<Auction>) {
  queryClient.setQueriesData({ queryKey: queryKeys.auctions.all }, (current) => {
    if (!current) return current;
    if (Array.isArray(current)) {
      if (isClosedLot(patch.status)) {
        return current.filter((auction: Auction) => auction.id !== id);
      }
      return current.map((auction: Auction) => (auction.id === id ? patchAuction(auction, patch) : auction));
    }
    if (isSheet(current)) return patchSheet(current, id, patch);
    if (isAuction(current) && current.id === id) return patchAuction(current, patch);
    return current;
  });

  queryClient.setQueriesData({ queryKey: queryKeys.search.all }, (current) => {
    if (!isSearchPage(current)) return current;
    if (isClosedLot(patch.status)) {
      const had = current.results.some((item) => item.id === id);
      return {
        ...current,
        results: current.results.filter((item) => item.id !== id),
        totalCount: had ? Math.max(0, current.totalCount - 1) : current.totalCount,
      };
    }
    return {
      ...current,
      results: current.results.map((item) =>
        item.id === id
          ? {
              ...item,
              currentHighBid: patch.currentHighBid ?? item.currentHighBid,
              winner: patch.winner ?? item.winner,
              soldAmount: patch.soldAmount ?? item.soldAmount,
              status: patch.status ?? item.status,
              updatedAt: patch.updatedAt ?? item.updatedAt,
              auctionEnd: patch.auctionEnd ?? item.auctionEnd,
              reservePrice: patch.reservePrice ?? item.reservePrice,
            }
          : item,
      ),
    };
  });
}

export function applyLiveBid(queryClient: QueryClient, bid: Bid) {
  queryClient.setQueriesData({ queryKey: queryKeys.auctions.all }, (current) => {
    if (!current) return current;
    if (Array.isArray(current)) {
      return current.map((auction: Auction) =>
        auction.id === bid.auctionId ? withHigherBid(auction, bid) : auction,
      );
    }
    if (isSheet(current)) {
      const map = (rows: Auction[]) =>
        rows.map((row) => (row.id === bid.auctionId ? withHigherBid(row, bid) : row));
      return { listed: map(current.listed), chasing: map(current.chasing), won: map(current.won) };
    }
    if (isAuction(current) && current.id === bid.auctionId) return withHigherBid(current, bid);
    return current;
  });

  queryClient.setQueriesData({ queryKey: queryKeys.search.all }, (current) => {
    if (!isSearchPage(current)) return current;
    return {
      ...current,
      results: current.results.map((item) =>
        item.id === bid.auctionId && isHigher(item.currentHighBid, bid.amount)
          ? { ...item, currentHighBid: bid.amount }
          : item,
      ),
    };
  });
}

function isHigher(current: number | undefined, amount: number) {
  return current == null || amount > current;
}

function withHigherBid(auction: Auction, bid: Bid): Auction {
  if (!isHigher(auction.currentHighBid, bid.amount)) return auction;
  return { ...auction, currentHighBid: bid.amount, highBidder: bid.bidder };
}

export function applyLiveAuctionUpdated(queryClient: QueryClient, update: LiveAuctionUpdated) {
  applyAuctionPatch(queryClient, update.id, {
    reservePrice: update.reservePrice,
    winner: update.winner,
    soldAmount: update.soldAmount,
    currentHighBid: update.currentHighBid,
    updatedAt: update.updatedAt,
    auctionEnd: update.auctionEnd,
    status: update.status,
  });
}

export function applyLiveAuctionDeleted(queryClient: QueryClient, removed: LiveAuctionDeleted) {
  queryClient.removeQueries({ queryKey: queryKeys.auctions.detail(removed.id) });
  queryClient.setQueriesData({ queryKey: queryKeys.auctions.all }, (current) => {
    if (!current) return current;
    if (Array.isArray(current)) return current.filter((auction: Auction) => auction.id !== removed.id);
    if (isSheet(current)) {
      const drop = (rows: Auction[]) => rows.filter((row) => row.id !== removed.id);
      return { listed: drop(current.listed), chasing: drop(current.chasing), won: drop(current.won) };
    }
    if (isAuction(current) && current.id === removed.id) return undefined;
    return current;
  });
  queryClient.setQueriesData({ queryKey: queryKeys.search.all }, (current) => {
    if (!isSearchPage(current)) return current;
    return {
      ...current,
      results: current.results.filter((item) => item.id !== removed.id),
      totalCount: Math.max(0, current.totalCount - 1),
    };
  });
}

export function applyLiveAuctionCreated(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
}
