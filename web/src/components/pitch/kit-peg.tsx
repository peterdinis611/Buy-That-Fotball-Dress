import Link from "next/link";
import { Countdown } from "@/components/auctions/countdown";
import { StatusPill } from "@/components/auctions/status-pill";
import { JerseyBack } from "./jersey-back";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function KitPeg({ listing, index = 0 }: { listing: KitListing; index?: number }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";
  const tilt = index % 2 === 0 ? "-rotate-3" : "rotate-2";

  return (
    <Link
      href={`/auctions/${listing.id}`}
      className={`kit-hover reveal delay-${Math.min(index + 1, 5)} group relative flex flex-col items-center bg-[var(--tape)] px-4 pb-5 pt-7`}
    >
      <span className="absolute top-2 size-2.5 rounded-full bg-[#c9a227] shadow-[0_6px_0_#6b5412]" />
      <JerseyBack number={number} color={listing.color} className={`h-28 w-24 transition-transform duration-500 ${tilt} group-hover:rotate-0`} />
      <p className="mt-4 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--led)]">
        {listing.club}
      </p>
      <h3 className="text-center text-3xl leading-none text-[var(--ink)]">{listing.playerName}</h3>
      <p className="mt-1 text-center text-xs text-[var(--ink)]/60">
        {listing.season} · {listing.kitType} · {listing.size}
      </p>
      <div className="mt-3">
        <StatusPill status={listing.status} />
      </div>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--ink)]">
        {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
      </p>
      <p className="mt-1 text-[11px] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">Current bid</p>
      <Countdown endsAt={listing.auctionEnd} className="text-base text-[var(--ink)]/80" />
    </Link>
  );
}

export function PegWall({ listings, empty }: { listings: KitListing[]; empty?: string }) {
  if (listings.length === 0) {
    return empty ? (
      <p className="border border-dashed border-[var(--ink)]/20 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/60">
        {empty}
      </p>
    ) : null;
  }

  return (
    <div className="peg-wall grid grid-cols-2 gap-px bg-[var(--ink)]/10 sm:grid-cols-3 lg:grid-cols-5">
      {listings.map((listing, index) => (
        <KitPeg key={listing.id} listing={listing} index={index} />
      ))}
    </div>
  );
}
