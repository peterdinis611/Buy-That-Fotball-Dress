import type { PagedResult, SavedPeg, SearchItem, SearchQuery } from "@/lib/types";
import { apiBase, authHeaders, readError } from "./client";

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

export type HangPegPayload = {
  club?: string;
  league?: string;
  size?: string;
  kitType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function getSavedPegs() {
  const response = await fetch(`${apiBase()}/api/search/pegs`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as SavedPeg[];
}

export async function hangPeg(payload: HangPegPayload) {
  const response = await fetch(`${apiBase()}/api/search/pegs`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as SavedPeg;
}

export async function dropPeg(id: string) {
  const response = await fetch(`${apiBase()}/api/search/pegs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 401) throw new Error("Sign in first.");
  if (!response.ok) throw new Error(await readError(response));
}
