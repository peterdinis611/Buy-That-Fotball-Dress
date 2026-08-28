import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { formatMoney } from "@/lib/format";
import type { KitListing } from "@/lib/types";

export function FeaturedHero({ listing }: { listing: KitListing }) {
  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="pointer-events-none absolute -right-8 top-[-12%] font-[family-name:var(--font-shoulders)] text-[42vw] leading-none tracking-[-0.1em] text-[color-mix(in_oklab,var(--flood)_7%,transparent)] select-none">
        {number}
      </div>

      <div className="mx-auto grid max-w-[1400px] items-end gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-24">
        <div>
          <p className="reveal font-[family-name:var(--font-plex)] text-[11px] tracking-[0.4em] text-[var(--line)] uppercase">
            Tonight&apos;s floodlight lot
          </p>
          <h1 className="reveal delay-1 mt-4 max-w-[12ch] text-6xl leading-[0.82] text-[var(--flood)] md:text-8xl">
            {listing.playerName}
          </h1>
          <p className="reveal delay-2 mt-6 max-w-md text-lg italic text-[var(--flood)]/75">
            {listing.club} {listing.season} {listing.kitType.toLowerCase()} shirt. {listing.condition}. Size {listing.size}.
          </p>

          <div className="reveal delay-3 mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.28em] text-[var(--muted-foreground)] uppercase">
                Standing
              </p>
              <p className="font-[family-name:var(--font-shoulders)] text-5xl text-[var(--line)]">
                {formatMoney(listing.currentHighBid ?? listing.reservePrice)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.28em] text-[var(--muted-foreground)] uppercase">
                Whistle
              </p>
              <Countdown endsAt={listing.auctionEnd} className="text-2xl text-[var(--flood)]" />
            </div>
          </div>

          <Link
            href={`/auctions/${listing.id}`}
            className="reveal delay-4 mt-10 inline-flex border border-[var(--line)] px-5 py-3 font-[family-name:var(--font-plex)] text-xs tracking-[0.28em] text-[var(--line)] uppercase transition-colors hover:bg-[var(--line)] hover:text-[var(--pitch)]"
          >
            Open the lot
          </Link>
        </div>

        <div className="reveal delay-3 relative aspect-[3/4] max-h-[540px] w-full justify-self-end overflow-hidden border border-[var(--line)]/40 bg-[var(--card)] md:rotate-2">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt={`${listing.club} ${listing.playerName}`}
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-[family-name:var(--font-shoulders)] text-[30vw] text-[var(--line)]/20 md:text-[12rem]">
              {number}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-[var(--pitch)]/80 px-4 py-3 font-[family-name:var(--font-plex)] text-[10px] tracking-[0.24em] text-[var(--flood)] uppercase">
            <span>{listing.kitType}</span>
            <span>{listing.color}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
