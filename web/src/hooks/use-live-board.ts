"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  applyLiveAuctionCreated,
  applyLiveAuctionDeleted,
  applyLiveAuctionUpdated,
  applyLiveBid,
  getHub,
  peekHub,
  type LiveAuctionDeleted,
  type LiveAuctionUpdated,
} from "@/lib/realtime";
import type { Bid } from "@/lib/types";

export function useLiveBoard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onBid = (bid: Bid) => applyLiveBid(queryClient, bid);
    const onUpdated = (update: LiveAuctionUpdated) => applyLiveAuctionUpdated(queryClient, update);
    const onCreated = () => applyLiveAuctionCreated(queryClient);
    const onDeleted = (removed: LiveAuctionDeleted) => applyLiveAuctionDeleted(queryClient, removed);

    void getHub()
      .then((hub) => {
        hub.on("BidPlaced", onBid);
        hub.on("AuctionUpdated", onUpdated);
        hub.on("AuctionCreated", onCreated);
        hub.on("AuctionDeleted", onDeleted);
      })
      .catch(() => undefined);

    return () => {
      const hub = peekHub();
      hub?.off("BidPlaced", onBid);
      hub?.off("AuctionUpdated", onUpdated);
      hub?.off("AuctionCreated", onCreated);
      hub?.off("AuctionDeleted", onDeleted);
    };
  }, [queryClient]);
}
