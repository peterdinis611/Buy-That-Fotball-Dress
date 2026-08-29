"use client";

import Link from "next/link";
import { PegWall } from "@/components/pitch";
import { useAuctionsQuery } from "@/lib/query/hooks";
import { fromAuction, type Auction } from "@/lib/types";

export function SquadView({ auctions }: { auctions: Auction[] }) {
  const { data = auctions } = useAuctionsQuery(auctions);
  const listings = data.map(fromAuction);

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-8 md:pt-16">
        <p className="reveal font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
          All lots
        </p>
        <h1 className="reveal delay-1 mt-1 text-7xl text-[var(--ink)] md:text-8xl">All shirts.</h1>
        <p className="reveal delay-2 mt-3 mb-10 max-w-xl text-[var(--ink)]/75">
          Open a live lot to bid. Highest bid when the clock hits zero wins. Ended lots stay up so you can see who won.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="mx-auto max-w-[1400px] px-5 pb-16 md:px-8">
          <h2 className="text-5xl text-[var(--ink)]">Nothing listed yet.</h2>
          <p className="mt-3 max-w-md text-[var(--ink)]/75">List a match-worn shirt to open the first auction.</p>
          <Link href="/sell" className="banner-cta mt-6 text-2xl">
            Sell a shirt
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-[1400px] px-5 pb-16 md:px-8">
          <div className="peg-rail" />
          <PegWall listings={listings} />
        </div>
      )}
    </div>
  );
}
