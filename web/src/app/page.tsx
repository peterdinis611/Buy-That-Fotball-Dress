import { FeaturedHero } from "@/components/featured-hero";
import { AuctionRow } from "@/components/auction-row";
import { getAuctions } from "@/lib/api";
import { fromAuction } from "@/lib/types";
import Link from "next/link";

const ticker = [
  "Real Madrid",
  "Barcelona",
  "Liverpool",
  "Bayern",
  "Inter Miami",
  "Manchester United",
  "Brazil 2002",
  "Slovan",
];

export default async function HomePage() {
  const auctions = await getAuctions();
  const listings = auctions.map(fromAuction);
  const live = listings.filter((item) => item.status === "Live");
  const featured = live[0] ?? listings[0];
  const rest = listings.filter((item) => item.id !== featured?.id).slice(0, 5);

  return (
    <div>
      <div className="overflow-hidden border-b border-[var(--border)] py-2">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-plex)] text-[11px] tracking-[0.35em] text-[var(--line)] uppercase">
          {[...ticker, ...ticker].map((club, index) => (
            <span key={`${club}-${index}`}>· {club}</span>
          ))}
        </div>
      </div>

      {featured ? (
        <FeaturedHero listing={featured} />
      ) : (
        <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
          <h1 className="text-6xl text-[var(--flood)] md:text-8xl">The locker is empty.</h1>
          <p className="mt-4 max-w-md italic text-[var(--flood)]/70">
            Start AuctionService, SearchService and Gateway on 5025–5027, then refresh.
          </p>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.32em] text-[var(--line)] uppercase">
              Still on the pegs
            </p>
            <h2 className="text-4xl text-[var(--flood)] md:text-5xl">The rest of the tunnel</h2>
          </div>
          <Link
            href="/auctions"
            className="font-[family-name:var(--font-plex)] text-[11px] tracking-[0.24em] text-[var(--line)] uppercase hover:underline"
          >
            Full board →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {rest.map((listing, index) => (
            <AuctionRow key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
