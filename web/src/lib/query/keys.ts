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
  },
};
