"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOfficeBoard, getOfficePegs, getOfficeSquad, getOfficeTills, scratchPeg, whistleTill } from "@/lib/api";
import { queryKeys } from "@/lib/query";

export function useOfficeBoardQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.office.board(),
    queryFn: getOfficeBoard,
    enabled,
    retry: false,
  });
}

export function useOfficeSquadQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.office.squad(),
    queryFn: getOfficeSquad,
    enabled,
    retry: false,
  });
}

export function useOfficePegsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.office.pegs(),
    queryFn: getOfficePegs,
    enabled,
    retry: false,
  });
}

export function useOfficeTillsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.office.tills(),
    queryFn: getOfficeTills,
    enabled,
    retry: false,
  });
}

export function useScratchPeg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scratchPeg,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.office.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auctions.all });
    },
  });
}

export function useWhistleTill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: whistleTill,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.office.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
    },
  });
}
