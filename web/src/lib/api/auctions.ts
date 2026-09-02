import type { Auction, Bid, CreateAuctionPayload, PlayerSheet, UpdateAuctionPayload } from "@/lib/types";
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

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as Auction;
}

export async function getPlayerSheet() {
  const response = await fetch(`${apiBase()}/api/auctions/mine`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as PlayerSheet;
}

export async function placeBid(id: string, amount: number, maxAmount?: number) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}/bids`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ amount, maxAmount: maxAmount && maxAmount > 0 ? maxAmount : undefined }),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as Bid;
}

export async function getBids(auctionId: string) {
  try {
    const response = await fetch(`${apiBase()}/api/auctions/${auctionId}/bids`, {
      cache: "no-store",
    });
    if (!response.ok) return [] as Bid[];
    return (await response.json()) as Bid[];
  } catch {
    return [] as Bid[];
  }
}

export async function updateAuction(id: string, payload: UpdateAuctionPayload) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Auction;
}

export async function deleteAuction(id: string) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
}

export async function relistAuction(id: string, auctionEnd: string) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}/relist`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ auctionEnd }),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Auction;
}

export async function takeAuction(id: string) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}/take`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Auction;
}

export async function watchAuction(id: string) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}/watch`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
}

export async function unwatchAuction(id: string) {
  const response = await fetch(`${apiBase()}/api/auctions/${id}/watch`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
}
