"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FormBanner, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import {
  useAuctionQuery,
  useAuth,
  useCountdown,
  useDeleteAuctionMutation,
  useLiveAuction,
  usePlaceBidMutation,
  usePlayerSheetQuery,
  useWatchMutation,
} from "@/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { BidTape } from "./bid-tape";
import { Countdown } from "./countdown";
import { StatusPill } from "./status-pill";
import type { Auction, Bid } from "@/lib/types";
import { bidFieldsSchema } from "@/lib/validation";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function nextFloor(auction: Auction) {
  if (auction.currentHighBid && auction.currentHighBid > 0) return auction.currentHighBid + 1;
  return auction.reservePrice;
}

export function LotTicket({ auction: initial, bids }: { auction: Auction; bids?: Bid[] }) {
  const { data } = useAuctionQuery(initial.id, initial);
  const lot = data ?? initial;
  const { item } = lot;
  useLiveAuction(lot.id);
  const remaining = useCountdown(lot.auctionEnd);
  const live = lot.status === "Live" && Boolean(remaining);
  const boardStatus = lot.status === "Live" && !remaining ? "Finished" : lot.status;

  return (
    <aside className="sub-board board-slam overflow-hidden">
      <div className="sub-board-bib px-5 py-2 text-center text-lg">Bid board</div>
      <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <StatusPill status={boardStatus} />
        <Countdown endsAt={lot.auctionEnd} className="led-num text-2xl" />
      </div>

      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="mb-6 aspect-[3/4] w-full object-cover" />
      ) : null}

      <div className="space-y-4 border-t border-dashed border-white/15 pt-6">
        <TicketLine label="Starting price" value={formatMoney(lot.reservePrice)} />
        <TicketLine
          label="Current bid"
          value={lot.currentHighBid ? formatMoney(lot.currentHighBid) : "No bids yet"}
          punch
        />
        {lot.highBidder ? <TicketLine label="Highest bidder" value={lot.highBidder} /> : null}
        {lot.winner ? <TicketLine label="Winner" value={lot.winner} /> : null}
        {lot.soldAmount ? <TicketLine label="Sold for" value={formatMoney(lot.soldAmount)} /> : null}
        <TicketLine label="Auction ends" value={formatDate(lot.auctionEnd)} />
      </div>

      <BidPanel auction={lot} live={live} />
      <BidTape auctionId={lot.id} initial={bids} />
      </div>
    </aside>
  );
}

function BidPanel({ auction, live }: { auction: Auction; live: boolean }) {
  const { user, ready } = useAuth();
  const ownShirt = sameName(user?.username, auction.seller);
  const leading = sameName(user?.username, auction.highBidder);
  const sheet = usePlayerSheetQuery(Boolean(user));
  const watching = (sheet.data?.watching ?? []).some((row) => row.id === auction.id);
  const chasing = (sheet.data?.chasing ?? []).some((row) => row.id === auction.id);

  if (!ready) {
    return <p className="mt-8 text-sm text-[var(--chalk)]/70">Checking your account…</p>;
  }

  if (ownShirt) {
    return <SellerDesk auction={auction} live={live} />;
  }

  if (!live) {
    return (
      <div className="mt-8">
        <p className="text-[var(--muted-foreground)]">This auction has ended. You cannot place a new bid.</p>
        {user && watching ? <WatchToggle auction={auction} watching /> : null}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-8">
        <p className="text-[var(--muted-foreground)]">Sign in to bid, or to keep this lot on your peg.</p>
        <Link href={`/login?next=/auctions/${auction.id}`} className="banner-cta mt-4 text-2xl">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {leading ? (
        <p className="mb-4 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--bib)]">
          You are the highest bidder.
        </p>
      ) : null}
      <BidForm key={`${auction.id}-${auction.currentHighBid ?? 0}`} auction={auction} />
      {chasing || sheet.isLoading ? null : <WatchToggle auction={auction} watching={watching} />}
    </div>
  );
}

function WatchToggle({ auction, watching }: { auction: Auction; watching: boolean }) {
  const watch = useWatchMutation(auction);

  return (
    <button
      type="button"
      disabled={watch.isPending}
      onClick={() => watch.mutate(!watching)}
      className="mt-5 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--bib)] uppercase underline-offset-4 hover:underline disabled:opacity-60"
    >
      {watch.isPending ? "Updating…" : watching ? "Watching · drop it" : "Watch this lot"}
    </button>
  );
}

function SellerDesk({ auction, live }: { auction: Auction; live: boolean }) {
  const router = useRouter();
  const takeDown = useDeleteAuctionMutation();
  const [confirm, setConfirm] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  async function remove() {
    setBanner(null);
    try {
      await takeDown.mutateAsync(auction.id);
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Could not take this shirt down.");
      setConfirm(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--bib)]">
        This is your listing.
      </p>
      {live ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/auctions/${auction.id}/edit`}
            className="inline-flex h-11 items-center bg-[var(--bib)] px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--stud)] uppercase"
          >
            Edit listing
          </Link>
          {confirm ? (
            <button
              type="button"
              disabled={takeDown.isPending}
              onClick={() => void remove()}
              className="inline-flex h-11 items-center bg-[var(--led)] px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-white uppercase"
            >
              {takeDown.isPending ? "Taking down…" : "Take it down"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="inline-flex h-11 items-center border border-white/25 px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--chalk)] uppercase"
            >
              Take down
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[var(--muted-foreground)]">The clock has run out. This lot stays on your sheet.</p>
      )}
      {confirm && live ? (
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="mt-3 text-sm text-[var(--muted-foreground)] underline-offset-4 hover:underline"
        >
          Keep it on the rail
        </button>
      ) : null}
      <FormBanner message={banner} />
    </div>
  );
}

function BidForm({ auction }: { auction: Auction }) {
  const bid = usePlaceBidMutation(auction.id);
  const [banner, setBanner] = useState<string | null>(null);
  const floor = nextFloor(auction);

  const form = useForm({
    defaultValues: { amount: String(floor) },
    validators: {
      onChange: bidFieldsSchema,
      onSubmit: bidFieldsSchema,
    },
    onSubmit: async ({ value }) => {
      setBanner(null);
      try {
        await bid.mutateAsync(Number(value.amount));
      } catch (err) {
        setBanner(err instanceof Error ? err.message : "That bid did not go through.");
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="amount">
        {(field) => (
          <TextField
            field={bindStringField(field)}
            label="Your bid"
            inputMode="numeric"
            placeholder={String(floor)}
          />
        )}
      </form.Field>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Bid at least {formatMoney(floor)}. If nobody bids higher before time runs out, you win.
      </p>
      <FormBanner message={banner} />
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || bid.isPending}
            className="mt-5 h-11 w-full rounded-none border-0 bg-[var(--bib)] font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--stud)] uppercase"
          >
            {isSubmitting || bid.isPending ? "Placing bid…" : "Place bid"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function TicketLine({ label, value, punch }: { label: string; value: string; punch?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        {label}
      </span>
      <span key={punch ? value : undefined} className={`led-num text-right text-2xl ${punch ? "bid-punch" : ""}`}>
        {value}
      </span>
    </div>
  );
}
