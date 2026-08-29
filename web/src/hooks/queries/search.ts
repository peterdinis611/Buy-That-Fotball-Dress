"use client";

import { useQuery } from "@tanstack/react-query";
import { searchItems } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { SearchQuery } from "@/lib/types";

export function useSearchQuery(query: SearchQuery, initialData?: Awaited<ReturnType<typeof searchItems>>) {
  return useQuery({
    queryKey: queryKeys.search.items(query),
    queryFn: () => searchItems(query),
    initialData,
  });
}
