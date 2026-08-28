import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { JerseyBack } from "@/components/jersey-back";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function FeaturedHero({ listing }: { listing: KitListing }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <section className="relative overflow-hidden border-b-4 border-[var(--chalk)]">
      <div className="pointer-events-none absolute -right-8 top-0 font-[family-name:var(--font-teko)] text-[38vw] leading-none text-[color-mix(in_oklab,var(--chalk)_6%,transparent)] select-none">
        {number}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-16">
        <div>
          <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.28em] text-[var(--line)]">
            Kick-off lot
          </p>
          <h1 className="reveal delay-1 mt-2 max-w-[12ch] text-7xl leading-[0.82] text-[var(--chalk)] md:text-9xl">
            {listing.playerName}
          </h1>
          <p className="reveal delay-2 mt-5 max-w-md text-lg text-[var(--chalk)]/80">
            {listing.club} {listing.season} {listing.kitType.toLowerCase()} shirt. {listing.condition}. Size {listing.size}.
          </p>

          <div className="reveal delay-3 mt-8 flex flex-wrap items-end gap-10">
            <div>
              <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.16em] text-[var(--muted-foreground)]">
                Scoreline
              </p>
              <p className="font-[family-name:var(--font-teko)] text-7xl leading-none text-[var(--line)]">
                {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.16em] text-[var(--muted-foreground)]">
                Until the whistle
              </p>
              <Countdown endsAt={listing.auctionEnd} className="text-5xl text-[var(--chalk)]" />
            </div>
          </div>

          <Link href={`/auctions/${listing.id}`} className="banner-cta reveal delay-4 mt-10 text-3xl">
            <span>Walk out</span>
          </Link>
        </div>

        <div className="reveal delay-3 relative flex min-h-[420px] items-center justify-center">
          <div className="absolute size-[min(420px,80vw)] rounded-full border border-[var(--chalk)]/35 shadow-[0_0_80px_rgb(232_255_106/0.12)]" />
          <div className="absolute size-[min(280px,55vw)] rounded-full border border-[var(--chalk)]/20" />
          <JerseyBack number={number} color={listing.color} className="relative z-10 h-72 w-56 md:h-80 md:w-64" />
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt={`${listing.club} ${listing.playerName}`}
              className="absolute right-0 top-6 hidden h-72 w-52 -rotate-6 border-4 border-[var(--chalk)] object-cover shadow-[12px_18px_0_var(--line)] md:block"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
