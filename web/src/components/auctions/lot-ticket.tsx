"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Countdown } from "@/components/auctions/countdown";
import { StatusPill } from "@/components/auctions/status-pill";
import { FormBanner, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { useAuctionQuery, usePlaceBidMutation } from "@/lib/query/hooks";
import type { Auction } from "@/lib/types";
import { bidFieldsSchema } from "@/lib/validation";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function nextFloor(auction: Auction) {
  if (auction.currentHighBid && auction.currentHighBid > 0) return auction.currentHighBid + 1;
  return auction.reservePrice;
}

export function LotTicket({ auction: initial }: { auction: Auction }) {
  const { data } = useAuctionQuery(initial.id, initial);
  const lot = data ?? initial;
  const { item } = lot;

  return (
    <aside className="sub-board reveal delay-2 overflow-hidden">
      <div className="sub-board-bib px-5 py-2 text-center text-lg">Bid board</div>
      <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <StatusPill status={lot.status} />
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
        />
        {lot.highBidder ? <TicketLine label="Highest bidder" value={lot.highBidder} /> : null}
        {lot.winner ? <TicketLine label="Winner" value={lot.winner} /> : null}
        {lot.soldAmount ? <TicketLine label="Sold for" value={formatMoney(lot.soldAmount)} /> : null}
        <TicketLine label="Auction ends" value={formatDate(lot.auctionEnd)} />
      </div>

      <BidPanel auction={lot} />
      </div>
    </aside>
  );
}

function BidPanel({ auction }: { auction: Auction }) {
  const { user, ready } = useAuth();
  const live = auction.status === "Live" && new Date(auction.auctionEnd).getTime() > Date.now();
  const ownShirt = sameName(user?.username, auction.seller);
  const leading = sameName(user?.username, auction.highBidder);

  if (!ready) {
    return <p className="mt-8 text-sm text-[var(--chalk)]/70">Checking your account…</p>;
  }

  if (!live) {
    return (
      <p className="mt-8 text-[var(--muted-foreground)]">
        This auction has ended. You cannot place a new bid.
      </p>
    );
  }

  if (!user) {
    return (
      <div className="mt-8">
        <p className="text-[var(--muted-foreground)]">Sign in to place a bid on this shirt.</p>
        <Link href={`/login?next=/auctions/${auction.id}`} className="banner-cta mt-4 text-2xl">
          Sign in to bid
        </Link>
      </div>
    );
  }

  if (ownShirt) {
    return (
      <p className="mt-8 text-[var(--bib)]">
        This is your listing. You cannot bid on your own shirt.
      </p>
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

function TicketLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        {label}
      </span>
      <span className="led-num text-right text-2xl">{value}</span>
    </div>
  );
}
