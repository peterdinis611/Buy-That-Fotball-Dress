import type { Auction, CreateAuctionPayload } from "@/lib/types";
import { apiBase, authHeaders, readError } from "./client";

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

export async function createAuction(payload: CreateAuctionPayload) {
  const response = await fetch(`${apiBase()}/api/auctions`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) throw new Error("Kick off first.");
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as Auction;
}
