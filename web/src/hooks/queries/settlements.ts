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

function useDeskAction(auctionId: string, action: (id: string) => Promise<Settlement>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: (row) => {
      queryClient.setQueryData(queryKeys.settlements.auction(auctionId), row);
      void queryClient.invalidateQueries({ queryKey: queryKeys.settlements.mine() });
    },
  });
}

export function usePaySettlement(auctionId: string) {
  return useDeskAction(auctionId, paySettlement);
}

export function useShipSettlement(auctionId: string) {
  return useDeskAction(auctionId, (id) => shipSettlement(id));
}

export function useReceiveSettlement(auctionId: string) {
  return useDeskAction(auctionId, receiveSettlement);
}

export function useDisputeSettlement(auctionId: string) {
  return useDeskAction(auctionId, (id) => disputeSettlement(id));
}
