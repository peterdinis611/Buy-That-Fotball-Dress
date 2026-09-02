import type { Settlement } from "@/lib/types";
import { apiBase, authHeaders, readError } from "./client";

export async function getMySettlements() {
  const response = await fetch(`${apiBase()}/api/settlements/mine`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Settlement[];
}

export async function getSettlementByAuction(auctionId: string) {
  try {
    const response = await fetch(`${apiBase()}/api/settlements/by-auction/${auctionId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as Settlement;
  } catch {
    return null;
  }
}

async function postDesk(path: string, body?: unknown) {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: authHeaders(Boolean(body)),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Settlement;
}

export function paySettlement(id: string, pay?: { sessionId?: string; successUrl?: string; cancelUrl?: string }) {
  return postDesk(`/api/settlements/${id}/pay`, pay);
}

export function shipSettlement(id: string, tracking?: string) {
  return postDesk(`/api/settlements/${id}/ship`, { tracking });
}

export function receiveSettlement(id: string) {
  return postDesk(`/api/settlements/${id}/receive`);
}

export function disputeSettlement(id: string, note?: string) {
  return postDesk(`/api/settlements/${id}/dispute`, { note });
}
