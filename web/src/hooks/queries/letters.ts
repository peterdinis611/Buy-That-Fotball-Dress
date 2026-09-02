"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyLetters } from "@/lib/api";
import { queryKeys } from "@/lib/query";

export function useMyLettersQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.letters.mine(),
    queryFn: getMyLetters,
    enabled,
    retry: false,
  });
}
