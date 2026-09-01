"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { useForm } from "@tanstack/react-form";
import { FormBanner, TextField, bindStringField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { JerseyBack } from "@/features/pitch";
import { WornStamp } from "@/features/pitch/worn-stamp";
import { StewardMark } from "@/features/pitch/steward-mark";
import { formatDate, formatMatchDay, formatMoney, pad } from "@/lib/format";
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
import { BidTape } from "./bid-tape";
import { StatusPill } from "./status-pill";
import { DeskSlip } from "@/features/profile/desk-slip";
import type { Auction, AuctionItem, Bid } from "@/lib/types";
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
  const { remaining, ready } = useCountdown(lot.auctionEnd);
  const live = lot.status === "Live" && (!ready || Boolean(remaining));
  const boardStatus = lot.status === "Live" && ready && !remaining ? "Finished" : lot.status;
  const current = lot.currentHighBid ? formatMoney(lot.currentHighBid) : "No bids";
  const number = item.playerNumber?.toString().padStart(2, "0") ?? "00";
  const specs = [
    ["Number", number],
    ["Size", item.size],
    ["Kit", item.kitType],
    ["Color", item.color],
    ["Competition", item.league ?? "—"],
    ...(item.match ? ([["Match", item.match]] as const) : []),
    ...(item.opponent ? ([["Opponent", `vs ${item.opponent}`]] as const) : []),
    ...(item.matchDate ? ([["On the grass", formatMatchDay(item.matchDate)]] as const) : []),
    ["Listed", formatDate(lot.createdAt)],
  ] as const;

  return (
    <article className="lot-board board-slam mt-8 overflow-hidden">
      <div className="sub-board-bib flex items-center justify-between gap-4 px-5 py-2 text-lg">
        <span>
          {item.club} · {item.season}
        </span>
        <span className="flex items-center gap-3">
          <StatusPill status={boardStatus} />
        </span>
      </div>

      <div className="lot-board-face">
        <div className="relative flex justify-center md:justify-start">
          <JerseyBack
            number={number}
            color={item.color}
            className="peg-sway h-52 w-40 md:h-64 md:w-52"
            style={{ "--hang": "-5deg" } as CSSProperties}
          />
          <WornStamp row={item} className="worn-stamp-lot" />
          <StewardMark by={item.verifiedBy} at={item.verifiedAt} className="steward-mark-lot" />
        </div>

        <div>
          <h1 className="text-5xl leading-[0.86] text-[var(--chalk)] md:text-7xl">{item.playerName}</h1>
          <p className="mt-3 text-[var(--muted-foreground)]">
            {item.condition}. Listed by {lot.seller}.
          </p>
          <p className="mt-5 font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
            Current bid
          </p>
          <p key={current} className={`led-num mt-1 text-6xl leading-none md:text-7xl ${lot.currentHighBid ? "bid-punch" : ""}`}>
            {current}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Starts at {formatMoney(lot.reservePrice)} · Ends {formatDate(lot.auctionEnd)}
            </p>
            <LedClock endsAt={lot.auctionEnd} />
          </div>
          {lot.highBidder ? <TicketLine label="Highest bidder" value={lot.highBidder} /> : null}
          {lot.winner ? <TicketLine label="Winner" value={lot.winner} /> : null}
          {lot.soldAmount ? <TicketLine label="Sold for" value={formatMoney(lot.soldAmount)} punch /> : null}

          <dl className="lot-board-spec mt-6">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 text-[var(--chalk)]">{value}</dd>
              </div>
            ))}
          </dl>
          {item.pitchPhotoUrl ? (
            <figure className="grass-shot mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.pitchPhotoUrl} alt="" />
              <figcaption>
                On the grass{item.match ? ` · ${item.match}` : ""}
                {item.opponent ? ` vs ${item.opponent}` : ""}
              </figcaption>
            </figure>
          ) : null}
          <ProofStrip item={item} />
        </div>
      </div>

      <div className="border-t border-dashed border-white/15 px-5 py-6 md:px-8">
        <BidPanel auction={lot} live={live} />
        <BidTape auctionId={lot.id} initial={bids} />
      </div>
    </article>
  );
}

function LedClock({ endsAt }: { endsAt: string }) {
  const { remaining, ready } = useCountdown(endsAt);

  if (!ready) {
    return <span className="led-num text-2xl">—</span>;
  }

  if (!remaining) {
    return <span className="led-num text-2xl">Ended</span>;
  }

  const cells = [
    remaining.days > 0 ? { value: remaining.days, unit: "d" } : null,
    { value: remaining.hours, unit: "h" },
    { value: remaining.minutes, unit: "m" },
    { value: remaining.seconds, unit: "s" },
  ].filter((cell): cell is { value: number; unit: string } => Boolean(cell));

  return (
    <div className="led-clock" aria-label="Time left">
      {cells.map((cell) => (
        <span key={cell.unit} className="led-cell">
          <span key={`${cell.unit}-${cell.value}`} className="led-cell-value digit-tick">
            {cell.unit === "d" ? cell.value : pad(cell.value)}
          </span>
          <span className="led-cell-unit">{cell.unit}</span>
        </span>
      ))}
    </div>
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
        <DeskSlip auction={auction} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bid-slip mt-8 px-5 py-6">
        <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">Sign in to bid</p>
        <p className="mt-2 text-sm">Keep this lot on your peg, or place a bid from the desk.</p>
        <Link href={`/login?next=/auctions/${auction.id}`} className="banner-cta mt-5 text-2xl">
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
      <DeskSlip auction={auction} />
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
    defaultValues: { amount: String(floor), maxAmount: "" },
    validators: {
      onChange: bidFieldsSchema,
      onSubmit: bidFieldsSchema,
    },
    onSubmit: async ({ value }) => {
      setBanner(null);
      const amount = Number(value.amount);
      const max = value.maxAmount?.trim() ? Number(value.maxAmount) : undefined;
      if (max != null && max < amount) {
        setBanner("Your snag has to sit at or above this bid.");
        return;
      }
      try {
        await bid.mutateAsync({ amount, maxAmount: max });
      } catch (err) {
        setBanner(err instanceof Error ? err.message : "That bid did not go through.");
      }
    },
  });

  return (
    <form
      noValidate
      className="bid-slip px-5 py-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.12em] uppercase">Your bid</p>
      <form.Field name="amount">
        {(field) => (
          <TextField
            field={bindStringField(field)}
            label="Amount"
            className="mt-3"
            inputMode="numeric"
            placeholder={String(floor)}
          />
        )}
      </form.Field>
      <p className="bid-slip-hint mt-2 text-sm">
        Bid at least {formatMoney(floor)}. If nobody bids higher before time runs out, you win.
      </p>
      <form.Field name="maxAmount">
        {(field) => (
          <TextField
            field={bindStringField(field)}
            label="Snag to (optional)"
            className="mt-4"
            inputMode="numeric"
            placeholder="Leave blank"
          />
        )}
      </form.Field>
      <p className="bid-slip-hint mt-2 text-sm">
        Set a ceiling. The book taps +1 € for you until someone goes past it.
      </p>
      <FormBanner message={banner} />
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || bid.isPending}
            className="mt-5 h-12 w-full rounded-none border-0 bg-[var(--stud)] font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--bib)] uppercase hover:bg-[#0c0c0c]"
          >
            {isSubmitting || bid.isPending ? "Placing bid…" : "Place bid"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function ProofStrip({ item }: { item: AuctionItem }) {
  const shots = [
    item.collarPhotoUrl ? { src: item.collarPhotoUrl, label: "Collar" } : null,
    item.washPhotoUrl ? { src: item.washPhotoUrl, label: "Wash" } : null,
    item.labelPhotoUrl ? { src: item.labelPhotoUrl, label: "Label" } : null,
    item.coaUrl ? { src: item.coaUrl, label: "COA" } : null,
  ].filter((shot): shot is { src: string; label: string } => Boolean(shot));

  if (shots.length === 0) return null;

  return (
    <div className="proof-strip mt-6">
      <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.14em] text-[var(--muted-foreground)] uppercase">
        Proof
      </p>
      <ul>
        {shots.map((shot) => (
          <li key={shot.label}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.src} alt="" />
            <span>{shot.label}</span>
          </li>
        ))}
      </ul>
    </div>
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
