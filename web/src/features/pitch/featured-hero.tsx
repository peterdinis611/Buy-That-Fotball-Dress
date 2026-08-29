import Link from "next/link";
import type { CSSProperties } from "react";
import { Countdown } from "@/features/auctions";
import { JerseyBack } from "./jersey-back";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function FeaturedHero({ listing }: { listing: KitListing }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";
  const bid = listing.currentHighBid ?? listing.reservePrice;
  const live = listing.status === "Live";

  return (
    <section className="relative overflow-hidden border-b-4 border-[var(--ink)]">
      <div className="pointer-events-none ghost-num absolute -right-4 top-0 font-[family-name:var(--font-display)] text-[34vw] leading-none text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none">
        {number}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-12 md:grid-cols-[1fr_0.9fr] md:px-8 md:py-16">
        <div>
          <p className="reveal font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-[var(--led)]">
            Live now
          </p>
          <h1 className="reveal delay-1 mt-2 max-w-[14ch] text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">
            {listing.playerName}
          </h1>
          <p className="reveal delay-2 mt-4 max-w-md text-lg text-[var(--ink)]/80">
            {listing.club} {listing.season} {listing.kitType.toLowerCase()} shirt, size {listing.size}. Match-worn.
            {live
              ? " Bid higher than the current price before the clock hits zero."
              : " This lot is no longer taking bids."}
          </p>

          <div className="reveal delay-3 relative mt-8 flex min-h-[280px] items-end justify-center md:justify-start">
            <JerseyBack
              number={number}
              color={listing.color}
              className="peg-sway relative z-10 h-64 w-52 md:h-72 md:w-56"
              style={{ "--hang": "-6deg" } as CSSProperties}
            />
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrl}
                alt={`${listing.club} ${listing.playerName} shirt`}
                className="absolute right-0 top-0 hidden h-64 w-48 rotate-3 border-4 border-[var(--ink)] object-cover md:block"
              />
            ) : null}
          </div>
        </div>

        <aside className="sub-board board-slam overflow-hidden">
          <div className="sub-board-bib px-5 py-2 text-center text-lg">Live lot</div>
          <div className="p-6 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="live-dot inline-flex items-center gap-2 bg-[var(--led)] px-2 py-0.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
                {live ? "Live" : listing.status === "Finished" ? "Ended" : "Unsold"}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">{listing.club}</span>
            </div>
            <p className="text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Current bid</p>
            <p key={bid} className="led-num bid-punch mt-1 text-6xl leading-none md:text-7xl">
              {formatMoney(bid)}
            </p>
            <p className="mt-6 text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Time left</p>
            <Countdown endsAt={listing.auctionEnd} className="led-num mt-1 block text-5xl" />
            <Link href={`/auctions/${listing.id}`} className="banner-cta mt-8 w-full justify-center text-2xl">
              Bid on this shirt
            </Link>
            <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">
              Starting price {formatMoney(listing.reservePrice)}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
