import Link from "next/link";
import type { CSSProperties } from "react";
import { Countdown, StatusPill } from "@/features/auctions";
import { JerseyBack } from "@/features/pitch";
import { WornStamp } from "@/features/pitch/worn-stamp";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { PegSkeleton } from "@/components/ui/skeleton";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export type HookKind = "watching" | "listed" | "chasing" | "won";

function hookMark(listing: KitListing, kind: HookKind, username?: string) {
  if (kind === "won") return { label: "Won", on: true };
  if (kind === "listed") return { label: "Yours", on: true };
  if (kind === "watching") return { label: "Peg", on: false };
  if (sameName(username, listing.highBidder)) return { label: "In", on: true };
  return { label: "Out", on: false };
}

export function LockerHook({
  listing,
  index,
  kind,
  username,
}: {
  listing: KitListing;
  index: number;
  kind: HookKind;
  username?: string;
}) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";
  const hang = index % 2 === 0 ? "-4deg" : "3deg";
  const mark = hookMark(listing, kind, username);
  const bid = listing.currentHighBid ?? listing.reservePrice;

  return (
    <Link
      href={`/auctions/${listing.id}`}
      className="kit-hover group relative flex min-w-0 flex-col items-center bg-[var(--tape)] px-3 pb-5 pt-7"
      style={{ "--peg": index, "--hang": hang } as CSSProperties}
    >
      <span className="absolute top-2 size-2.5 rounded-full bg-[var(--hook)] shadow-[0_6px_0_#6b5412]" />
      <span className="relative">
        <JerseyBack number={number} color={listing.color} className="peg-sway h-32 w-28 shrink-0" />
        <WornStamp row={listing} compact className="worn-stamp-peg" />
      </span>
      <div className="mt-3 flex w-full items-center justify-between gap-2 px-0.5">
        <p className="truncate font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--bib)]">
          {listing.club}
        </p>
        <span className={`shrink-0 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase ${mark.on ? "text-[var(--bib)]" : "text-[var(--muted-foreground)]"}`}>
          {mark.label}
        </span>
      </div>
      <h3 className="mt-1 w-full truncate text-center text-2xl leading-none text-[var(--ink)] lg:text-3xl">
        {listing.playerName}
      </h3>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--ink)]">
        {formatMoney(bid)}
      </p>
      <div className="mt-2 flex flex-col items-center gap-1">
        <StatusPill status={listing.status} />
        <Countdown endsAt={listing.auctionEnd} className="text-sm text-[var(--ink)]/70" />
      </div>
    </Link>
  );
}

export function LockerRail({
  listings,
  kind,
  username,
  empty,
  emptyHref,
  emptyCta,
  loading,
}: {
  listings: KitListing[];
  kind: HookKind;
  username?: string;
  empty: string;
  emptyHref?: string;
  emptyCta?: string;
  loading: boolean;
}) {
  if (loading) {
    return <PegSkeleton />;
  }

  if (listings.length === 0) {
    return (
      <Empty className="min-h-56 border border-dashed border-[var(--ink)]/18 bg-[var(--tape)]">
        <EmptyHeader>
          <EmptyTitle className="text-2xl text-[var(--ink)]">Empty locker</EmptyTitle>
          <EmptyDescription className="text-[var(--ink)]/65">{empty}</EmptyDescription>
        </EmptyHeader>
        {emptyHref && emptyCta ? (
          <EmptyContent>
            <Link href={emptyHref} className="banner-cta mt-2 text-2xl">
              {emptyCta}
            </Link>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  }

  return (
    <div className="peg-wall grid grid-cols-2 gap-px bg-[var(--stud)] sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing, index) => (
        <LockerHook key={listing.id} listing={listing} index={index} kind={kind} username={username} />
      ))}
    </div>
  );
}
