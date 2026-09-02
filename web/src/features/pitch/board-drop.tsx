"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
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
import { ConfirmAct } from "@/components/forms/confirm-act";
import { Spinner } from "@/components/ui/spinner";
import { useAuth, useClock, useDeleteAuctionMutation, usePlaceBidMutation, usePlayerSheetQuery, useScratchPeg, useWatchMutation } from "@/hooks";

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

const EMPTY_LOTS: Auction[] = [];
const LIVE_LIST_KEY = queryKeys.auctions.list({ status: "Live" });

function useLiveLots() {
  const queryClient = useQueryClient();

  const lots = useSyncExternalStore(
    (onChange) =>
      queryClient.getQueryCache().subscribe((event) => {
        const key = event.query.queryKey;
        if (!Array.isArray(key) || key[0] !== "auctions" || key[1] !== "list") return;
        onChange();
      }),
    () => queryClient.getQueryData<Auction[]>(LIVE_LIST_KEY) ?? EMPTY_LOTS,
    () => EMPTY_LOTS,
  );

  useEffect(() => {
    if (queryClient.getQueryData(LIVE_LIST_KEY)) return;
    void queryClient.prefetchQuery({
      queryKey: LIVE_LIST_KEY,
      queryFn: () => getAuctions({ status: "Live" }),
    });
  }, [queryClient]);

  return lots;
}

export function BoardDrop() {
  const { user, steward } = useAuth();
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

  useEffect(() => {
    if (open) markBoardRead();
    else setBiddingId(null);
  }, [open]);

  function toggle() {
    setOpen((current) => !current);
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
                    steward={steward}
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
  steward,
  watching,
  chasing,
  bidding,
  onBid,
  onOpen,
}: {
  lot: Auction;
  signedIn: boolean;
  yours: boolean;
  steward: boolean;
  watching: boolean;
  chasing: boolean;
  bidding: boolean;
  onBid: () => void;
  onOpen: () => void;
}) {
  const bid = lot.currentHighBid ?? lot.reservePrice;
  const leading = chasing;
  const mark = yours ? "Yours" : leading ? "In" : watching ? "Peg" : null;
  const offKind = yours ? "down" : steward ? "scratch" : watching ? "drop" : null;

  return (
    <li className="board-desk-item" data-open={bidding ? "true" : "false"} data-off={offKind ? "true" : "false"}>
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
          <Countdown endsAt={lot.auctionEnd} injury={lot.injury} className="board-desk-clock" />
        </span>
        <span className="board-desk-acts">
          {offKind ? <BoardOff key="off" lot={lot} kind={offKind} /> : null}
          {yours ? null : signedIn ? (
            <button
              key="bid"
              type="button"
              className="board-desk-go"
              aria-expanded={bidding}
              onClick={onBid}
            >
              Bid
            </button>
          ) : (
            <Link key="in" href={`/login?next=/auctions/${lot.id}`} className="board-desk-go" onClick={onOpen}>
              Bid
            </Link>
          )}
        </span>
      </div>
      {bidding && signedIn && !yours ? <BoardBidSlip lot={lot} /> : null}
    </li>
  );
}

function BoardOff({ lot, kind }: { lot: Auction; kind: "down" | "scratch" | "drop" }) {
  if (kind === "drop") return <DropOff lot={lot} />;
  if (kind === "scratch") return <ScratchOff lot={lot} />;
  return <DownOff lot={lot} />;
}

function DropOff({ lot }: { lot: Auction }) {
  const watch = useWatchMutation(lot);
  return (
    <OffButton
      label="Drop"
      pending={watch.isPending}
      ariaLabel={`Drop ${lot.item.playerName} from your peg`}
      onRun={() => watch.mutateAsync(false)}
    />
  );
}

function ScratchOff({ lot }: { lot: Auction }) {
  const scratch = useScratchPeg();
  return (
    <ConfirmAct
      title={`Scratch ${lot.item.playerName}?`}
      body="The shirt leaves the wall."
      confirmLabel="Scratch"
      pending={scratch.isPending}
      triggerClassName="board-desk-off"
      triggerLabel="Off"
      ariaLabel={`Scratch ${lot.item.playerName} off the wall`}
      onTriggerClick={(event) => event.stopPropagation()}
      onConfirm={() => scratch.mutateAsync(lot.id)}
    />
  );
}

function DownOff({ lot }: { lot: Auction }) {
  const pull = useDeleteAuctionMutation();
  return (
    <ConfirmAct
      title={`Take ${lot.item.playerName} off the rail?`}
      body="The listing comes down."
      confirmLabel="Take it down"
      pending={pull.isPending}
      triggerClassName="board-desk-off"
      triggerLabel="Off"
      ariaLabel={`Take ${lot.item.playerName} off the rail`}
      onTriggerClick={(event) => event.stopPropagation()}
      onConfirm={() => pull.mutateAsync(lot.id)}
    />
  );
}

function OffButton({
  label,
  pending,
  ariaLabel,
  onRun,
}: {
  label: string;
  pending: boolean;
  ariaLabel: string;
  onRun: () => void | Promise<unknown>;
}) {
  return (
    <button
      type="button"
      className="board-desk-off"
      disabled={pending}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        void onRun();
      }}
    >
      {pending ? <Spinner className="size-3.5" /> : label}
    </button>
  );
}

function BoardBidSlip({ lot }: { lot: Auction }) {
  const floor = nextFloor(lot);
  const place = usePlaceBidMutation(lot.id);
  const [amount, setAmount] = useState(String(floor));
  const [snag, setSnag] = useState("");
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
    const ceiling = snag.trim() ? Number(snag) : undefined;
    if (!/^\d+$/.test(amount.trim()) || !Number.isFinite(value) || value < floor) {
      setError(`At least ${formatMoney(floor)}. Whole euros only.`);
      setLanded(false);
      return;
    }
    if (ceiling != null && (!Number.isFinite(ceiling) || ceiling < value)) {
      setError("Snag has to sit at or above this bid.");
      setLanded(false);
      return;
    }

    setError(null);
    try {
      await place.mutateAsync({ amount: value, maxAmount: ceiling });
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
      <label className="board-desk-snag">
        <span>Snag to</span>
        <input
          className="board-desk-input"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Snag ceiling"
          placeholder="optional"
          value={snag}
          onChange={(event) => {
            setSnag(event.target.value.replace(/[^\d]/g, ""));
            setLanded(false);
          }}
        />
      </label>
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
