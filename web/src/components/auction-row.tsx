import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { StatusPill } from "@/components/status-pill";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function AuctionRow({ listing, index = 0 }: { listing: KitListing; index?: number }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <Link
      href={`/auctions/${listing.id}`}
      className={`kit-hover reveal delay-${Math.min(index + 1, 5)} group grid grid-cols-[auto_1fr] items-stretch gap-4 border border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_78%,transparent)] px-4 py-5 md:grid-cols-[140px_1fr_auto] md:px-6`}
    >
      <span className="font-[family-name:var(--font-shoulders)] text-6xl leading-none tracking-[-0.08em] text-[color-mix(in_oklab,var(--flood)_18%,transparent)] transition-colors group-hover:text-[var(--line)] md:text-7xl">
        {number}
      </span>

      <div className="min-w-0 self-center">
        <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.32em] text-[var(--line)] uppercase">
          {listing.club}
          {listing.league ? ` · ${listing.league}` : ""}
        </p>
        <h3 className="mt-1 truncate text-3xl normal-case tracking-[-0.04em] text-[var(--flood)] md:text-4xl">
          {listing.playerName}
        </h3>
        <p className="mt-2 text-sm italic text-[var(--flood)]/65">
          {listing.season} · {listing.kitType} · {listing.size} · {listing.condition}
        </p>
      </div>

      <div className="col-span-2 flex items-end justify-between gap-4 md:col-span-1 md:flex-col md:items-end">
        <StatusPill status={listing.status} />
        <div className="text-right">
          <p className="font-[family-name:var(--font-plex)] text-lg text-[var(--flood)]">
            {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
          </p>
          <Countdown endsAt={listing.auctionEnd} className="text-xs text-[var(--flood)]/70" />
        </div>
      </div>
    </Link>
  );
}
