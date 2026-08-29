"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Countdown } from "@/features/auctions/countdown";
import { getAuctions } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query";
import { fromAuction, isOpenLot, type Auction } from "@/lib/types";
import {
  markBoardRead,
  unreadBoardCount,
  useBoardLog,
  type BoardEvent,
} from "@/lib/realtime/board-log";
import { useAuth, useClock, usePlaceBidMutation, usePlayerSheetQuery } from "@/hooks";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function nextFloor(auction: Auction) {
  if (auction.currentHighBid && auction.currentHighBid > 0) return auction.currentHighBid + 1;
  return auction.reservePrice;
}

function ago(at: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - at) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function useLiveLots() {
  const queryClient = useQueryClient();
  const [lots, setLots] = useState<Auction[]>(
    () => queryClient.getQueryData<Auction[]>(queryKeys.auctions.list({ status: "Live" })) ?? [],
  );

  useEffect(() => {
    const key = queryKeys.auctions.list({ status: "Live" });

    function pull() {
      setLots(queryClient.getQueryData<Auction[]>(key) ?? []);
    }

    pull();
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] !== "auctions") return;
      pull();
    });

    if (!queryClient.getQueryData(key)) {
      void queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () => getAuctions({ status: "Live" }),
      });
    }

    return unsubscribe;
  }, [queryClient]);

  return lots;
}

export function BoardDrop() {
  const { user } = useAuth();
  const data = useLiveLots();
  const sheet = usePlayerSheetQuery(Boolean(user));
  const tape = useBoardLog();
  const [open, setOpen] = useState(false);
  const [biddingId, setBiddingId] = useState<string | null>(null);
  const now = useClock(open ? 1000 : 60_000);
  const root = useRef<HTMLDivElement>(null);

  const live = useMemo(
    () =>
      data
        .filter((lot) => isOpenLot(fromAuction(lot)))
        .sort((a, b) => new Date(a.auctionEnd).getTime() - new Date(b.auctionEnd).getTime()),
    [data],
  );

  const watching = useMemo(
    () => new Set((sheet.data?.watching ?? []).map((row) => row.id)),
    [sheet.data],
  );
  const chasing = useMemo(
    () => new Set((sheet.data?.chasing ?? []).map((row) => row.id)),
    [sheet.data],
  );

  const unread = unreadBoardCount(tape);
  const shown = live.slice(0, 6);

  useEffect(() => {
    if (!open) return;

    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
        setBiddingId(null);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setBiddingId(null);
      }
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    setOpen((current) => {
      const next = !current;
      if (next) markBoardRead();
      else setBiddingId(null);
      return next;
    });
  }

  return (
    <div ref={root} className="board-desk relative">
      <button
        type="button"
        className="board-desk-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${live.length} live lots. Open the board.`}
        onClick={toggle}
      >
        <span className="board-desk-kicker">Board</span>
        <span className="board-desk-count">{live.length}</span>
        {unread > 0 ? <span className="board-desk-pip">{unread > 9 ? "9+" : unread}</span> : null}
      </button>

      {open ? (
        <div className="board-desk-panel sub-board" role="dialog" aria-label="Live lots and recent action">
          <div className="sub-board-bib flex items-center justify-between gap-3 px-4 py-1.5 text-base">
            <span>The board</span>
            <span className="tracking-[0.18em]">{live.length} live</span>
          </div>

          <div className="board-desk-body">
            <p className="board-desk-label">Taking bids</p>
            {shown.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[#c4c4ba]">No shirts taking bids right now.</p>
            ) : (
              <ul>
                {shown.map((lot) => (
                  <LotRow
                    key={lot.id}
                    lot={lot}
                    signedIn={Boolean(user)}
                    yours={sameName(user?.username, lot.seller)}
                    watching={watching.has(lot.id)}
                    chasing={chasing.has(lot.id)}
                    bidding={biddingId === lot.id}
                    onBid={() => setBiddingId((current) => (current === lot.id ? null : lot.id))}
                    onOpen={() => setOpen(false)}
                  />
                ))}
              </ul>
            )}
            {live.length > shown.length ? (
              <p className="board-desk-more">+{live.length - shown.length} more on the rail</p>
            ) : null}

            {tape.length > 0 ? (
              <>
                <p className="board-desk-label mt-2">Tape</p>
                <ul>
                  {tape.slice(0, 4).map((event) => (
                    <TapeRow
                      key={event.id}
                      event={event}
                      stamp={ago(event.at, now.getTime())}
                      onOpen={() => setOpen(false)}
                    />
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <Link href="/auctions" className="board-desk-foot" onClick={() => setOpen(false)}>
            All live lots →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function LotRow({
  lot,
  signedIn,
  yours,
  watching,
  chasing,
  bidding,
  onBid,
  onOpen,
}: {
  lot: Auction;
  signedIn: boolean;
  yours: boolean;
  watching: boolean;
  chasing: boolean;
  bidding: boolean;
  onBid: () => void;
  onOpen: () => void;
}) {
  const bid = lot.currentHighBid ?? lot.reservePrice;
  const leading = chasing;
  const mark = yours ? "Yours" : leading ? "In" : watching ? "Peg" : null;

  return (
    <li className="board-desk-item" data-open={bidding ? "true" : "false"}>
      <div className="board-desk-row">
        <span className="board-desk-lamp" aria-hidden />
        <span className="min-w-0">
          <Link href={`/auctions/${lot.id}`} className="board-desk-player" onClick={onOpen}>
            {lot.item.playerName}
          </Link>
          <span className="board-desk-club">
            {lot.item.club}
            {mark ? (
              <span className="board-desk-chip" data-kind={mark.toLowerCase()}>
                {mark}
              </span>
            ) : null}
          </span>
        </span>
        <span className="board-desk-stats">
          <span className="board-desk-bid">{formatMoney(bid)}</span>
          <Countdown endsAt={lot.auctionEnd} className="board-desk-clock" />
        </span>
        {yours ? (
          <span className="board-desk-go board-desk-go-dead">Yours</span>
        ) : signedIn ? (
          <button
            type="button"
            className="board-desk-go"
            aria-expanded={bidding}
            onClick={onBid}
          >
            Bid
          </button>
        ) : (
          <Link href={`/login?next=/auctions/${lot.id}`} className="board-desk-go" onClick={onOpen}>
            Bid
          </Link>
        )}
      </div>
      {bidding && signedIn && !yours ? <BoardBidSlip lot={lot} /> : null}
    </li>
  );
}

function BoardBidSlip({ lot }: { lot: Auction }) {
  const floor = nextFloor(lot);
  const place = usePlaceBidMutation(lot.id);
  const [amount, setAmount] = useState(String(floor));
  const [error, setError] = useState<string | null>(null);
  const [landed, setLanded] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAmount(String(floor));
  }, [floor, lot.id]);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!/^\d+$/.test(amount.trim()) || !Number.isFinite(value) || value < floor) {
      setError(`At least ${formatMoney(floor)}. Whole euros only.`);
      setLanded(false);
      return;
    }

    setError(null);
    try {
      await place.mutateAsync(value);
      setLanded(true);
    } catch (err) {
      setLanded(false);
      setError(err instanceof Error ? err.message : "That bid did not go through.");
    }
  }

  return (
    <form className="board-desk-slip" onSubmit={(event) => void submit(event)}>
      <p className="board-desk-slip-label">Your bid · min {formatMoney(floor)}</p>
      <div className="board-desk-slip-row">
        <input
          ref={input}
          className="board-desk-input"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`Bid on ${lot.item.playerName}`}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value.replace(/[^\d]/g, ""));
            setLanded(false);
          }}
        />
        <button type="submit" className="board-desk-place" disabled={place.isPending}>
          {place.isPending ? "…" : "Place"}
        </button>
      </div>
      {error ? <p className="board-desk-slip-err">{error}</p> : null}
      {landed ? <p className="board-desk-slip-ok">You're on the board</p> : null}
    </form>
  );
}

function TapeRow({
  event,
  stamp,
  onOpen,
}: {
  event: BoardEvent;
  stamp: string;
  onOpen: () => void;
}) {
  return (
    <li>
      <Link href={event.href} className="board-desk-row board-desk-tape" onClick={onOpen}>
        <span className="board-desk-mark" data-kind={event.kind}>
          {event.eyebrow}
        </span>
        <span className="min-w-0">
          <span className="board-desk-player board-desk-player-sm">{event.title}</span>
          <span className="board-desk-club">{event.detail}</span>
        </span>
        <span className="board-desk-ago">{stamp}</span>
      </Link>
    </li>
  );
}
