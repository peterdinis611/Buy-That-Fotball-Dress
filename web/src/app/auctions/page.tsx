import { PegWall } from "@/components/kit-peg";
import { PitchBoard } from "@/components/pitch-board";
import { getAuctions } from "@/lib/api";
import { fromAuction } from "@/lib/types";
import Link from "next/link";

export default async function AuctionsPage() {
  const auctions = await getAuctions();
  const listings = auctions.map(fromAuction);

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-8 md:pt-16">
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          Team sheet
        </p>
        <h1 className="reveal delay-1 mt-1 text-7xl text-[var(--chalk)] md:text-8xl">The squad.</h1>
        <p className="reveal delay-2 mt-3 mb-10 max-w-xl text-[var(--chalk)]/75">
          Live shirts first. Full-time lots stay as proof the match happened.
        </p>
      </div>

      {listings.length === 0 ? (
        <PitchBoard
          overlay={
            <div className="absolute inset-x-5 bottom-8 z-10 max-w-lg md:left-10">
              <h2 className="text-5xl text-[var(--chalk)] md:text-6xl">Empty dressing room.</h2>
              <p className="mt-3 text-[var(--chalk)]/75">The gateway is still in the tunnel.</p>
              <Link href="/sell" className="banner-cta mt-6 text-2xl">
                <span>Sub on</span>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="mx-auto max-w-[1400px] px-5 pb-16 md:px-8">
          <PegWall listings={listings} />
        </div>
      )}
    </div>
  );
}
