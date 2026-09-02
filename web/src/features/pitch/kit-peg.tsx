import Link from "next/link";
import type { CSSProperties } from "react";
import { Countdown } from "@/features/auctions/countdown";
import { StatusPill } from "@/features/auctions/status-pill";
import { JerseyBack } from "./jersey-back";
import { WornStamp } from "./worn-stamp";
import { StewardMark } from "./steward-mark";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function KitPeg({ listing, index = 0 }: { listing: KitListing; index?: number }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";
  const hang = index % 2 === 0 ? "-3deg" : "2deg";

  return (
    <Link
      href={`/auctions/${listing.id}`}
      className="kit-hover group relative flex min-w-0 flex-col items-center bg-[var(--tape)] px-3 pb-5 pt-7 sm:px-4"
      style={{ "--peg": index, "--hang": hang } as CSSProperties}
    >
      <span className="absolute top-2 size-2.5 rounded-full bg-[var(--hook)] shadow-[0_6px_0_#6b5412]" />
      <span className="relative">
        <JerseyBack number={number} color={listing.color} className="peg-sway h-28 w-24 shrink-0" />
        <WornStamp row={listing} compact className="worn-stamp-peg" />
        <StewardMark by={listing.verifiedBy} className="steward-mark-peg" />
      </span>
      <p className="mt-4 w-full truncate text-center font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--bib)]">
        {listing.club}
      </p>
      <h3 className="w-full truncate px-0.5 text-center text-2xl leading-none text-[var(--ink)] lg:text-3xl">
        {listing.playerName}
      </h3>
      <p className="mt-1 w-full truncate text-center text-xs text-[var(--muted-foreground)]">
        {listing.season} · {listing.kitType} · {listing.size}
      </p>
      <div className="mt-3">
        <StatusPill status={listing.status} />
      </div>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--ink)]">
        {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
      </p>
      <p className="mt-1 text-[11px] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">Current bid</p>
      <Countdown endsAt={listing.auctionEnd} injury={listing.injury} className="text-base text-[var(--ink)]/85" />
    </Link>
  );
}

export function PegWall({ listings, empty }: { listings: KitListing[]; empty?: string }) {
  if (listings.length === 0) {
    return empty ? (
      <Empty className="min-h-56 border border-dashed border-[var(--ink)]/20 bg-[var(--tape)]">
        <EmptyHeader>
          <EmptyTitle className="text-2xl text-[var(--ink)]">Empty rail</EmptyTitle>
          <EmptyDescription className="text-[var(--ink)]/60">{empty}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : null;
  }

  return (
    <div className="peg-wall grid grid-cols-2 gap-px bg-[var(--stud)] sm:grid-cols-3 lg:grid-cols-5">
      {listings.map((listing, index) => (
        <KitPeg key={listing.id} listing={listing} index={index} />
      ))}
    </div>
  );
}
