"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disputeSettlement,
  getMySettlements,
  getSettlementByAuction,
  paySettlement,
  receiveSettlement,
  shipSettlement,
} from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Settlement } from "@/lib/types";

function rememberDesk(queryClient: ReturnType<typeof useQueryClient>, auctionId: string) {
  return {
    onSuccess: (row: Settlement) => {
      queryClient.setQueryData(queryKeys.settlements.auction(auctionId), row);
      void queryClient.invalidateQueries({ queryKey: queryKeys.settlements.mine() });
    },
  };
}

export function useMySettlementsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.settlements.mine(),
    queryFn: getMySettlements,
    enabled,
    retry: false,
  });
}

export function useSettlementQuery(auctionId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.settlements.auction(auctionId),
    queryFn: () => getSettlementByAuction(auctionId),
    enabled: enabled && Boolean(auctionId),
  });
}

export function usePaySettlement(auctionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paySettlement(id),
    ...rememberDesk(queryClient, auctionId),
  });
}

export function useShipSettlement(auctionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tracking }: { id: string; tracking: string }) => shipSettlement(id, tracking),
    ...rememberDesk(queryClient, auctionId),
  });
}

export function useReceiveSettlement(auctionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => receiveSettlement(id),
    ...rememberDesk(queryClient, auctionId),
  });
}

export function useDisputeSettlement(auctionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => disputeSettlement(id, note),
    ...rememberDesk(queryClient, auctionId),
  });
}
