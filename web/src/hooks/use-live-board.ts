"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { pushBoardToast } from "@/features/pitch/board-toast";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query";
import { pushBoardEvent, type BoardEventKind } from "@/lib/realtime/board-log";
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

type LiveAuctionCreated = {
  id: string;
  club?: string;
  playerName?: string;
  reservePrice?: number;
};

type BoardTape = {
  id: string;
  kind: BoardEventKind | string;
  for?: string;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
};

export function useLiveBoard() {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const username = data?.user?.username;

  useEffect(() => {
    const bumpDesk = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
    };

    const onBid = (bid: Bid) => {
      const lot = peekAuction(queryClient, bid.auctionId);
      const wasLeading = sameName(username, lot?.highBidder) || sameName(username, bid.previousBidder);
      const outbid = wasLeading && !sameName(username, bid.bidder);
      const player = lot?.item.playerName ?? "A shirt";

      applyLiveBid(queryClient, bid);

      pushBoardEvent({
        id: bid.id,
        kind: outbid ? "outbid" : "bid",
        eyebrow: outbid ? "Outbid" : "Bid",
        title: player,
        detail: `${bid.bidder} · ${formatMoney(bid.amount)}`,
        href: `/auctions/${bid.auctionId}`,
      });

      if (outbid) {
        pushBoardToast({
          id: bid.id,
          eyebrow: "Outbid",
          title: player,
          detail: `${bid.bidder} went ${formatMoney(bid.amount)}`,
          href: `/auctions/${bid.auctionId}`,
        });
      }
    };

    const onUpdated = (update: LiveAuctionUpdated) => {
      applyLiveAuctionUpdated(queryClient, update);
      if (update.status !== "Finished" && update.status !== "ReserveNotMet") return;

      const sold = update.status === "Finished";
      pushBoardEvent({
        id: `ended-${update.id}-${update.updatedAt}`,
        kind: "ended",
        eyebrow: sold ? "Sold" : "Unsold",
        title: update.playerName ?? peekAuction(queryClient, update.id)?.item.playerName ?? "A shirt",
        detail: sold && update.soldAmount ? `Went for ${formatMoney(update.soldAmount)}` : "Clock hit zero",
        href: `/auctions/${update.id}`,
      });
      bumpDesk();
    };

    const onCreated = (created?: LiveAuctionCreated) => {
      applyLiveAuctionCreated(queryClient);
      if (!created?.id) return;
      pushBoardEvent({
        id: `listed-${created.id}`,
        kind: "listed",
        eyebrow: "Listed",
        title: created.playerName ?? "New shirt",
        detail: created.club
          ? `${created.club}${created.reservePrice ? ` · ${formatMoney(created.reservePrice)}` : ""}`
          : "On the board",
        href: `/auctions/${created.id}`,
      });
    };

    const onDeleted = (removed: LiveAuctionDeleted) => applyLiveAuctionDeleted(queryClient, removed);

    const onTape = (tape: BoardTape) => {
      if (tape.for && !sameName(tape.for, username)) return;
      const kind = (["outbid", "won", "shipped", "paid", "bid", "listed", "ended"] as const).includes(
        tape.kind as BoardEventKind,
      )
        ? (tape.kind as BoardEventKind)
        : "bid";

      pushBoardEvent({
        id: tape.id,
        kind,
        eyebrow: tape.eyebrow,
        title: tape.title,
        detail: tape.detail,
        href: tape.href,
      });

      if (kind === "outbid" || kind === "won" || kind === "shipped" || kind === "paid") {
        pushBoardToast({
          id: tape.id,
          eyebrow: tape.eyebrow,
          title: tape.title,
          detail: tape.detail,
          href: tape.href,
        });
      }

      if (kind === "won" || kind === "shipped" || kind === "paid") bumpDesk();
    };

    void getHub()
      .then((hub) => {
        hub.on("BidPlaced", onBid);
        hub.on("AuctionUpdated", onUpdated);
        hub.on("AuctionCreated", onCreated);
        hub.on("AuctionDeleted", onDeleted);
        hub.on("BoardTape", onTape);
        hub.on("SettlementOpened", bumpDesk);
        hub.on("SettlementPaid", bumpDesk);
        hub.on("KitShipped", bumpDesk);
      })
      .catch(() => undefined);

    return () => {
      const hub = peekHub();
      hub?.off("BidPlaced", onBid);
      hub?.off("AuctionUpdated", onUpdated);
      hub?.off("AuctionCreated", onCreated);
      hub?.off("AuctionDeleted", onDeleted);
      hub?.off("BoardTape", onTape);
      hub?.off("SettlementOpened", bumpDesk);
      hub?.off("SettlementPaid", bumpDesk);
      hub?.off("KitShipped", bumpDesk);
    };
  }, [queryClient, username]);
}
