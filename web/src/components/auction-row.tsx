import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { JerseyBack } from "@/components/jersey-back";
import { StatusPill } from "@/components/status-pill";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function AuctionRow({ listing, index = 0 }: { listing: KitListing; index?: number }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <Link
      href={`/auctions/${listing.id}`}
      className={`kit-hover reveal delay-${Math.min(index + 1, 5)} group grid grid-cols-[auto_1fr] items-center gap-4 border-y border-[var(--chalk)]/20 bg-black/25 px-3 py-4 md:grid-cols-[96px_1fr_auto] md:px-5`}
    >
      <JerseyBack number={number} color={listing.color} />

      <div className="min-w-0">
        <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.18em] text-[var(--line)]">
          {listing.club}
          {listing.league ? ` · ${listing.league}` : ""}
        </p>
        <h3 className="truncate text-4xl leading-none text-[var(--chalk)] md:text-5xl">{listing.playerName}</h3>
        <p className="mt-1 text-sm text-[var(--chalk)]/70">
          {listing.season} · {listing.kitType} · {listing.size} · {listing.condition}
        </p>
      </div>

      <div className="col-span-2 flex items-end justify-between gap-4 md:col-span-1 md:flex-col md:items-end">
        <StatusPill status={listing.status} />
        <div className="text-right">
          <p className="font-[family-name:var(--font-teko)] text-3xl leading-none text-[var(--line)]">
            {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
          </p>
          <Countdown endsAt={listing.auctionEnd} className="text-lg text-[var(--chalk)]/80" />
        </div>
      </div>
    </Link>
  );
}
