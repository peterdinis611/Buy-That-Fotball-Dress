import type { Auction, CreateAuctionPayload, PagedResult, SearchItem, SearchQuery } from "./types";

const SERVER_API = process.env.API_URL ?? "http://localhost:5027";
const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "/gateway";

function apiBase() {
  return typeof window === "undefined" ? SERVER_API : CLIENT_API;
}

async function readError(response: Response) {
  const body = await response.text();
  try {
    const json = JSON.parse(body) as { title?: string; errors?: Record<string, string[]> };
    if (json.errors) {
      return Object.values(json.errors).flat().join(" ");
    }
    return json.title ?? body;
  } catch {
    return body || response.statusText;
  }
}

export async function getAuctions(params?: { club?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.club) query.set("club", params.club);
  if (params?.status) query.set("status", params.status);

  const suffix = query.size ? `?${query}` : "";

  try {
    const response = await fetch(`${apiBase()}/api/auctions${suffix}`, {
      cache: "no-store",
    });
    if (!response.ok) return [] as Auction[];
    return (await response.json()) as Auction[];
  } catch {
    return [] as Auction[];
  }
}

export async function getAuction(id: string) {
  try {
    const response = await fetch(`${apiBase()}/api/auctions/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as Auction;
  } catch {
    return null;
  }
}

export async function searchItems(params: SearchQuery = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      query.set(key, String(value));
    }
  });

  const suffix = query.size ? `?${query}` : "";

  try {
    const response = await fetch(`${apiBase()}/api/search${suffix}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { results: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 } as PagedResult<SearchItem>;
    }
    return (await response.json()) as PagedResult<SearchItem>;
  } catch {
    return { results: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 } as PagedResult<SearchItem>;
  }
}

export async function createAuction(payload: CreateAuctionPayload) {
  const response = await fetch(`${apiBase()}/api/auctions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as Auction;
}
