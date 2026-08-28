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
    <aside className="ticket reveal delay-2 p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <StatusPill status={lot.status} />
        <Countdown endsAt={lot.auctionEnd} className="text-2xl" />
      </div>

      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="mb-6 aspect-[3/4] w-full object-cover" />
      ) : null}

      <div className="space-y-4 border-t border-dashed border-[var(--chalk)]/25 pt-6">
        <TicketLine label="Reserve" value={formatMoney(lot.reservePrice)} />
        <TicketLine
          label="Scoreline"
          value={lot.currentHighBid ? formatMoney(lot.currentHighBid) : "No shot yet"}
        />
        {lot.highBidder ? <TicketLine label="On the ball" value={lot.highBidder} /> : null}
        {lot.winner ? <TicketLine label="Man of the match" value={lot.winner} /> : null}
        {lot.soldAmount ? <TicketLine label="Final" value={formatMoney(lot.soldAmount)} /> : null}
        <TicketLine label="Final whistle" value={formatDate(lot.auctionEnd)} />
      </div>

      <BidPanel auction={lot} />
    </aside>
  );
}

function BidPanel({ auction }: { auction: Auction }) {
  const { user, ready } = useAuth();
  const live = auction.status === "Live" && new Date(auction.auctionEnd).getTime() > Date.now();
  const ownShirt = sameName(user?.username, auction.seller);
  const leading = sameName(user?.username, auction.highBidder);

  if (!ready) {
    return <p className="mt-8 text-sm text-[var(--chalk)]/55">Checking the team sheet…</p>;
  }

  if (!live) {
    return (
      <p className="mt-8 font-[family-name:var(--font-teko)] text-lg tracking-[0.12em] text-[var(--muted-foreground)]">
        The whistle has gone on this lot.
      </p>
    );
  }

  if (!user) {
    return (
      <div className="mt-8">
        <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.12em] text-[var(--muted-foreground)]">
          Kick off to put a number on this shirt.
        </p>
        <Link href={`/login?next=/auctions/${auction.id}`} className="banner-cta mt-4 text-2xl">
          <span>Kick off</span>
        </Link>
      </div>
    );
  }

  if (ownShirt) {
    return (
      <p className="mt-8 font-[family-name:var(--font-teko)] text-lg tracking-[0.12em] text-[var(--line)]">
        This is your shirt on the peg. You cannot shoot at it.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {leading ? (
        <p className="mb-4 font-[family-name:var(--font-teko)] text-lg tracking-[0.14em] text-[var(--line)]">
          You are on the ball.
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
        setBanner(err instanceof Error ? err.message : "That shot did not count.");
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
            label="Your shot"
            inputMode="numeric"
            placeholder={String(floor)}
          />
        )}
      </form.Field>
      <p className="mt-2 text-sm text-[var(--chalk)]/55">Next shot from {formatMoney(floor)}.</p>
      <FormBanner message={banner} />
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || bid.isPending}
            className="mt-5 h-11 w-full rounded-none border border-[var(--line)] bg-[var(--line)] font-[family-name:var(--font-teko)] text-2xl tracking-[0.14em] text-[var(--pitch)] uppercase"
          >
            {isSubmitting || bid.isPending ? "The shot is in…" : "Take the shot"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function TicketLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-[family-name:var(--font-teko)] text-lg tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
        {label}
      </span>
      <span className="text-right font-[family-name:var(--font-teko)] text-2xl text-[var(--line)]">{value}</span>
    </div>
  );
}
