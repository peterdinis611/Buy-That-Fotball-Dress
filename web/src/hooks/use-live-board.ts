"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { pushBoardToast } from "@/features/pitch/board-toast";
import { formatMoney } from "@/lib/format";
import {
  applyLiveAuctionCreated,
  applyLiveAuctionDeleted,
  applyLiveAuctionUpdated,
  applyLiveBid,
  getHub,
  peekAuction,
  peekHub,
  type LiveAuctionDeleted,
  type LiveAuctionUpdated,
} from "@/lib/realtime";
import type { Bid } from "@/lib/types";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function useLiveBoard() {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const username = data?.user?.username;

  useEffect(() => {
    const onBid = (bid: Bid) => {
      const lot = peekAuction(queryClient, bid.auctionId);
      const wasLeading = sameName(username, lot?.highBidder);
      const outbid = wasLeading && !sameName(username, bid.bidder);

      applyLiveBid(queryClient, bid);

      if (outbid) {
        pushBoardToast({
          id: bid.id,
          eyebrow: "Outbid",
          title: lot?.item.playerName ?? "This shirt",
          detail: `${bid.bidder} went ${formatMoney(bid.amount)}`,
          href: `/auctions/${bid.auctionId}`,
        });
      }
    };
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
  }, [queryClient, username]);
}
