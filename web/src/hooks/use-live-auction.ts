"use client";

import { useEffect } from "react";
import { getHub } from "@/lib/realtime";

export function useLiveAuction(auctionId: string) {
  useEffect(() => {
    if (!auctionId) return;

    void getHub()
      .then((hub) => hub.invoke("JoinAuction", auctionId))
      .catch(() => undefined);

    return () => {
      void getHub()
        .then((hub) => hub.invoke("LeaveAuction", auctionId))
        .catch(() => undefined);
    };
  }, [auctionId]);
}
