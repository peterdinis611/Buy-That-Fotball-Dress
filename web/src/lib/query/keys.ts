import type { SearchQuery } from "@/lib/types";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  auctions: {
    all: ["auctions"] as const,
    list: (params?: { club?: string; status?: string }) =>
      [...queryKeys.auctions.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.auctions.all, "detail", id] as const,
    sheet: () => [...queryKeys.auctions.all, "sheet"] as const,
  },
  search: {
    all: ["search"] as const,
    items: (query: SearchQuery) => [...queryKeys.search.all, "items", query] as const,
    pegs: () => [...queryKeys.search.all, "pegs"] as const,
  },
  bids: {
    all: ["bids"] as const,
    list: (auctionId: string) => [...queryKeys.bids.all, "list", auctionId] as const,
  },
  settlements: {
    all: ["settlements"] as const,
    mine: () => [...queryKeys.settlements.all, "mine"] as const,
    auction: (id: string) => [...queryKeys.settlements.all, "auction", id] as const,
  },
  letters: {
    all: ["letters"] as const,
    mine: () => [...queryKeys.letters.all, "mine"] as const,
  },
  office: {
    all: ["office"] as const,
    board: () => [...queryKeys.office.all, "board"] as const,
    squad: () => [...queryKeys.office.all, "squad"] as const,
    pegs: () => [...queryKeys.office.all, "pegs"] as const,
    tills: () => [...queryKeys.office.all, "tills"] as const,
  },
};
