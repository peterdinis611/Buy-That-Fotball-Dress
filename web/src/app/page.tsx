import { FeaturedHero } from "@/components/featured-hero";
import { AuctionRow } from "@/components/auction-row";
import { getAuctions } from "@/lib/api";
import { fromAuction } from "@/lib/types";
import Link from "next/link";

const ticker = [
  "GOAL",
  "Real Madrid",
  "CORNER",
  "Barcelona",
  "OFFSIDE",
  "Liverpool",
  "Bayern",
  "KICK-OFF",
  "Inter Miami",
  "United",
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
      <div className="overflow-hidden bg-black py-1.5">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          {[...ticker, ...ticker].map((club, index) => (
            <span key={`${club}-${index}`}>· {club}</span>
          ))}
        </div>
      </div>

      {featured ? (
        <FeaturedHero listing={featured} />
      ) : (
        <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-8">
          <h1 className="text-7xl text-[var(--chalk)]">Match postponed.</h1>
          <p className="mt-4 max-w-md text-[var(--chalk)]/70">
            Wake AuctionService, SearchService and Gateway (5025–5027), then kick off again.
          </p>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.22em] text-[var(--line)]">
              Starting XI
            </p>
            <h2 className="text-5xl text-[var(--chalk)]">Still on the pitch</h2>
          </div>
          <Link
            href="/auctions"
            className="font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--line)] uppercase"
          >
            Full squad →
          </Link>
        </div>

        <div className="flex flex-col">
          {rest.map((listing, index) => (
            <AuctionRow key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
