import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import {
  applyLiveAuctionDeleted,
  applyLiveAuctionUpdated,
  applyLiveBid,
  peekAuction,
  type LiveAuctionUpdated,
} from "@/lib/realtime/cache";
import type { Auction, PagedResult, SearchItem } from "@/lib/types";
import { describe, expect, it } from "vitest";

function lot(): Auction {
  return {
    id: "c3a1f4d2-8b6e-4c91-9f20-1a7b5e3d8c44",
    reservePrice: 250,
    seller: "kitvault",
    createdAt: "2026-08-28T10:00:00.000Z",
    updatedAt: "2026-08-28T10:00:00.000Z",
    auctionEnd: "2026-09-04T10:00:00.000Z",
    status: "Live",
    item: {
      id: "item",
      club: "Real Madrid",
      playerName: "Vinícius Júnior",
      playerNumber: 7,
      season: "2024/25",
      size: "L",
      color: "White",
      kitType: "Home",
      condition: "New",
      league: "La Liga",
    },
  };
}

function clientWith(auction: Auction) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  queryClient.setQueryData(queryKeys.auctions.detail(auction.id), auction);
  queryClient.setQueryData(queryKeys.auctions.list(), [auction]);
  queryClient.setQueryData<PagedResult<SearchItem>>(queryKeys.search.items({ status: "Live" }), {
    results: [
      {
        id: auction.id,
        reservePrice: auction.reservePrice,
        seller: auction.seller,
        createdAt: auction.createdAt,
        updatedAt: auction.updatedAt,
        auctionEnd: auction.auctionEnd,
        status: auction.status,
        club: auction.item.club,
        playerName: auction.item.playerName,
        playerNumber: auction.item.playerNumber,
        season: auction.item.season,
        size: auction.item.size,
        color: auction.item.color,
        kitType: auction.item.kitType,
        condition: auction.item.condition,
        league: auction.item.league,
      },
    ],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
  });
  queryClient.setQueryData(queryKeys.bids.list(auction.id), []);
  return queryClient;
}

describe("live cache", () => {
  it("writes a higher bid onto the lot", () => {
    const auction = lot();
    const queryClient = clientWith(auction);

    applyLiveBid(queryClient, {
      id: "bid-1",
      auctionId: auction.id,
      bidder: "jerseyhunter",
      amount: 310,
      createdAt: "2026-08-28T11:00:00.000Z",
    });

    expect(peekAuction(queryClient, auction.id)?.currentHighBid).toBe(310);
    expect(peekAuction(queryClient, auction.id)?.highBidder).toBe("jerseyhunter");
    expect(queryClient.getQueryData(queryKeys.bids.list(auction.id))).toHaveLength(1);
  });

  it("stamps provenance from an auction update", () => {
    const auction = lot();
    const queryClient = clientWith(auction);
    const update: LiveAuctionUpdated = {
      id: auction.id,
      reservePrice: 250,
      seller: "kitvault",
      createdAt: auction.createdAt,
      updatedAt: "2026-08-30T10:00:00.000Z",
      auctionEnd: auction.auctionEnd,
      status: "Live",
      match: "El Clasico",
      matchDate: "2024-04-21T12:00:00.000Z",
      opponent: "Barcelona",
      pitchPhotoUrl: "https://placehold.co/grass.png",
    };

    applyLiveAuctionUpdated(queryClient, update);

    const next = peekAuction(queryClient, auction.id);
    expect(next?.item.match).toBe("El Clasico");
    expect(next?.item.opponent).toBe("Barcelona");

    const page = queryClient.getQueryData<PagedResult<SearchItem>>(queryKeys.search.items({ status: "Live" }));
    expect(page?.results[0].match).toBe("El Clasico");
    expect(page?.results[0].opponent).toBe("Barcelona");
  });

  it("drops a finished lot from the live board", () => {
    const auction = lot();
    const queryClient = clientWith(auction);

    applyLiveAuctionUpdated(queryClient, {
      id: auction.id,
      reservePrice: 250,
      seller: "kitvault",
      winner: "jerseyhunter",
      soldAmount: 310,
      createdAt: auction.createdAt,
      updatedAt: "2026-08-30T12:00:00.000Z",
      auctionEnd: auction.auctionEnd,
      status: "Finished",
    });

    expect(queryClient.getQueryData<Auction[]>(queryKeys.auctions.list())).toEqual([]);
    expect(queryClient.getQueryData<PagedResult<SearchItem>>(queryKeys.search.items({ status: "Live" }))?.totalCount).toBe(0);
  });

  it("removes a deleted lot", () => {
    const auction = lot();
    const queryClient = clientWith(auction);

    applyLiveAuctionDeleted(queryClient, { id: auction.id });

    expect(queryClient.getQueryData(queryKeys.auctions.detail(auction.id))).toBeUndefined();
    expect(queryClient.getQueryData<Auction[]>(queryKeys.auctions.list())).toEqual([]);
  });
});
