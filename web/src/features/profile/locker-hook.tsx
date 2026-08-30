import Link from "next/link";
import type { CSSProperties } from "react";
import { Countdown, StatusPill } from "@/features/auctions";
import { JerseyBack } from "@/features/pitch";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export type HookKind = "watching" | "listed" | "chasing" | "won";

function hookMark(listing: KitListing, kind: HookKind, username?: string) {
  if (kind === "won") return { label: "Won", kind: "won" as const };
  if (kind === "listed") return { label: "Yours", kind: "yours" as const };
  if (kind === "watching") return { label: "Peg", kind: "peg" as const };
  if (sameName(username, listing.highBidder)) return { label: "In", kind: "in" as const };
  return { label: "Out", kind: "out" as const };
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
      className="vault-hook group"
      style={{ "--peg": index, "--hang": hang } as CSSProperties}
    >
      <span className="vault-peg" />
      <JerseyBack number={number} color={listing.color} className="peg-sway h-36 w-28 shrink-0" />
      <div className="vault-slip">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--led)]">
            {listing.club}
          </p>
          <span className="book-mark shrink-0" data-kind={mark.kind === "in" || mark.kind === "won" ? "in" : "out"}>
            {mark.label}
          </span>
        </div>
        <h3 className="mt-1 truncate text-2xl leading-none text-[#f3f1ec]">{listing.playerName}</h3>
        <p className="mt-2 led-num text-3xl leading-none">{formatMoney(bid)}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <StatusPill status={listing.status} />
          <Countdown endsAt={listing.auctionEnd} className="text-sm text-[#f3f1ec]/70" />
        </div>
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
    return <p className="px-2 py-16 text-center text-[#f3f1ec]/45">Loading lots…</p>;
  }

  if (listings.length === 0) {
    return (
      <div className="vault-empty">
        <div className="flex justify-center gap-8 opacity-40">
          <JerseyBack number="00" color="chalk" ghost className="h-28 w-24" />
          <JerseyBack number="00" color="chalk" ghost className="h-28 w-24" />
        </div>
        <p className="mt-6 max-w-sm text-center text-[#f3f1ec]/65">{empty}</p>
        {emptyHref && emptyCta ? (
          <Link href={emptyHref} className="banner-cta mt-6 text-2xl">
            {emptyCta}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="vault-hooks">
      {listings.map((listing, index) => (
        <LockerHook key={listing.id} listing={listing} index={index} kind={kind} username={username} />
      ))}
    </div>
  );
}
