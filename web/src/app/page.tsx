import { FeaturedHero } from "@/components/featured-hero";
import { PegWall } from "@/components/kit-peg";
import { PitchBoard } from "@/components/pitch-board";
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
  const rest = listings.filter((item) => item.id !== featured?.id).slice(0, 10);

  return (
    <div>
      <div className="overflow-hidden bg-black py-2">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-teko)] text-2xl tracking-[0.22em] text-[var(--line)]">
          {[...ticker, ...ticker].map((club, index) => (
            <span key={`${club}-${index}`}>· {club}</span>
          ))}
        </div>
      </div>

      {featured ? (
        <FeaturedHero listing={featured} />
      ) : (
        <PitchBoard
          overlay={
            <div className="absolute inset-x-5 bottom-8 z-10 max-w-xl md:inset-auto md:bottom-10 md:left-10">
              <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.28em] text-[var(--line)]">
                Kick-off delayed
              </p>
              <h1 className="reveal delay-1 mt-1 text-6xl leading-[0.82] text-[var(--chalk)] md:text-8xl">
                The tunnel is dark.
              </h1>
              <p className="reveal delay-2 mt-4 max-w-sm text-[var(--chalk)]/80">
                The XI is already marked in chalk. Wake the services and the shirts walk out.
              </p>
              <div className="reveal delay-3 mt-6 flex flex-wrap items-center gap-4">
                <Link href="/sell" className="banner-cta text-2xl">
                  <span>Sub on</span>
                </Link>
                <p className="text-xs text-[var(--chalk)]/55">Auction · Search · Gateway on 5025–5027</p>
              </div>
            </div>
          }
        />
      )}

      {rest.length > 0 ? (
        <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.22em] text-[var(--line)]">
                Starting XI
              </p>
              <h2 className="text-5xl text-[var(--chalk)] md:text-6xl">Still on the pitch</h2>
            </div>
            <Link
              href="/auctions"
              className="nav-line font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--line)] uppercase"
            >
              Full squad →
            </Link>
          </div>
          <PegWall listings={rest} />
        </section>
      ) : null}
    </div>
  );
}
