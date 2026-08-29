"use client";

import Link from "next/link";
import { ConcoursePulse } from "./concourse-pulse";
import { FeaturedHero } from "./featured-hero";
import { HouseRules } from "./house-rules";
import { HowItWorks } from "./how-it-works";
import { PegWall } from "./kit-peg";
import { PitchFaq } from "./pitch-faq";
import { TunnelCta } from "./tunnel-cta";
import { useAuctionsQuery } from "@/hooks";
import { fromAuction, isOpenLot, type Auction } from "@/lib/types";

export function HomeView({ auctions }: { auctions: Auction[] }) {
  const { data = auctions } = useAuctionsQuery(auctions);
  const listings = data.map(fromAuction).filter(isOpenLot);
  const featured = listings[0];
  const rest = listings.slice(1, 11);

  return (
    <div>
      {featured ? (
        <FeaturedHero listing={featured} />
      ) : (
        <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8">
          <p className="reveal font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
            No live lots
          </p>
          <h1 className="reveal delay-1 mt-2 max-w-[14ch] text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">
            No shirts listed yet.
          </h1>
          <p className="mt-4 max-w-md text-lg text-[var(--ink)]/75">
            List a match-worn shirt to open the first auction, or come back when someone else does.
          </p>
          <Link href="/sell" className="banner-cta mt-8 text-2xl">
            Sell a shirt
          </Link>
        </section>
      )}

      <ConcoursePulse live={listings.length} listed={listings.length} />
      <HowItWorks />

      {rest.length > 0 ? (
        <section className="view-in mx-auto max-w-[1400px] px-5 py-14 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
                More shirts
              </p>
              <h2 className="text-5xl text-[var(--ink)] md:text-6xl">Also live</h2>
            </div>
            <Link
              href="/auctions"
              className="nav-line font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--ink)] uppercase"
            >
              All lots →
            </Link>
          </div>
          <div className="peg-rail mb-0" />
          <PegWall listings={rest} />
        </section>
      ) : null}

      <HouseRules />
      <PitchFaq />
      <TunnelCta />
    </div>
  );
}
