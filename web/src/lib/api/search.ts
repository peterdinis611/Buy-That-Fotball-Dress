import type { PagedResult, SearchItem, SearchQuery } from "@/lib/types";
import { apiBase } from "./client";

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
