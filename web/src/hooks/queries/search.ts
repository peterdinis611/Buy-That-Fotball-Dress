"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dropPeg, getSavedPegs, hangPeg, searchItems, type HangPegPayload } from "@/lib/api/search";
import { queryKeys } from "@/lib/query";
import type { SearchQuery } from "@/lib/types";

export function useSearchQuery(query: SearchQuery, initialData?: Awaited<ReturnType<typeof searchItems>>) {
  return useQuery({
    queryKey: queryKeys.search.items(query),
    queryFn: () => searchItems(query),
    initialData,
  });
}

export function useSavedPegsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.search.pegs(),
    queryFn: getSavedPegs,
    enabled,
    retry: false,
  });
}

export function useHangPeg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HangPegPayload) => hangPeg(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.pegs() });
    },
  });
}

export function useDropPeg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dropPeg,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.pegs() });
    },
  });
}
