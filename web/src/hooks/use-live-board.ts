"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  applyLiveAuctionCreated,
  applyLiveAuctionDeleted,
  applyLiveAuctionUpdated,
  applyLiveBid,
  getHub,
  stopHub,
  type LiveAuctionDeleted,
  type LiveAuctionUpdated,
} from "@/lib/realtime";
import type { Bid } from "@/lib/types";

export function useLiveBoard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    void getHub()
      .then((hub) => {
        if (cancelled) return;

        hub.on("BidPlaced", (bid: Bid) => applyLiveBid(queryClient, bid));
        hub.on("AuctionUpdated", (update: LiveAuctionUpdated) =>
          applyLiveAuctionUpdated(queryClient, update),
        );
        hub.on("AuctionCreated", () => applyLiveAuctionCreated(queryClient));
        hub.on("AuctionDeleted", (removed: LiveAuctionDeleted) =>
          applyLiveAuctionDeleted(queryClient, removed),
        );
      })
      .catch((error: unknown) => {
        console.warn("Live board is offline.", error);
      });

    return () => {
      cancelled = true;
      void getHub()
        .then((hub) => {
          hub.off("BidPlaced");
          hub.off("AuctionUpdated");
          hub.off("AuctionCreated");
          hub.off("AuctionDeleted");
        })
        .catch(() => undefined);
      void stopHub();
    };
  }, [queryClient]);
}
