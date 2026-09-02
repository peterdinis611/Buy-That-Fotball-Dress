"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyLetters, readAllLetters, readLetter } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { BoardLetter } from "@/lib/types";

export function useMyLettersQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.letters.mine(),
    queryFn: getMyLetters,
    enabled,
    retry: false,
  });
}

export function useReadLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readLetter,
    onSuccess: (letter) => {
      queryClient.setQueryData(queryKeys.letters.mine(), (current: BoardLetter[] | undefined) =>
        current?.map((row) => (row.id === letter.id ? letter : row)),
      );
    },
  });
}

export function useReadAllLetters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllLetters,
    onSuccess: () => {
      const now = new Date().toISOString();
      queryClient.setQueryData(queryKeys.letters.mine(), (current: BoardLetter[] | undefined) =>
        current?.map((row) => (row.readAt ? row : { ...row, readAt: now })),
      );
    },
  });
}
