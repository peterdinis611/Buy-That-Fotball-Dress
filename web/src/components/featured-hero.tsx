import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { JerseyBack } from "@/components/jersey-back";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function FeaturedHero({ listing }: { listing: KitListing }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <section className="relative overflow-hidden border-b-4 border-[var(--chalk)]">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-16">
        <div>
          <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
            Kick-off lot
          </p>
          <h1 className="reveal delay-1 mt-2 max-w-[14ch] text-7xl leading-[0.85] text-[var(--chalk)] md:text-8xl">
            {listing.playerName}
          </h1>
          <p className="reveal delay-2 mt-5 max-w-md text-lg text-[var(--chalk)]/80">
            {listing.club} {listing.season} {listing.kitType.toLowerCase()} shirt. {listing.condition}. Size {listing.size}.
          </p>

          <div className="reveal delay-3 mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.16em] text-[var(--muted-foreground)]">
                Scoreline
              </p>
              <p className="font-[family-name:var(--font-teko)] text-6xl leading-none text-[var(--line)]">
                {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.16em] text-[var(--muted-foreground)]">
                Until the whistle
              </p>
              <Countdown endsAt={listing.auctionEnd} className="text-4xl text-[var(--chalk)]" />
            </div>
          </div>

          <Link
            href={`/auctions/${listing.id}`}
            className="reveal delay-4 mt-10 inline-flex bg-[var(--chalk)] px-5 py-3 font-[family-name:var(--font-teko)] text-2xl tracking-[0.14em] text-black uppercase hover:bg-[var(--line)]"
          >
            Walk out
          </Link>
        </div>

        <div className="reveal delay-3 relative flex min-h-[360px] items-center justify-center">
          <div className="absolute inset-8 rounded-full border border-[var(--chalk)]/40" />
          <JerseyBack number={number} color={listing.color} className="!h-64 !w-52 [&_span]:text-[9rem]" />
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt={`${listing.club} ${listing.playerName}`}
              className="absolute right-0 top-8 hidden h-72 w-52 -rotate-6 border-4 border-[var(--chalk)] object-cover md:block"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
