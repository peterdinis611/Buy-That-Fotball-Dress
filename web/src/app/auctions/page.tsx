import { AuctionRow } from "@/components/auction-row";
import { getAuctions } from "@/lib/api";
import { fromAuction } from "@/lib/types";

export default async function AuctionsPage() {
  const auctions = await getAuctions();
  const listings = auctions.map(fromAuction);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 max-w-xl">
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          Team sheet
        </p>
        <h1 className="reveal delay-1 mt-1 text-7xl text-[var(--chalk)]">The squad.</h1>
        <p className="reveal delay-2 mt-3 max-w-xl text-[var(--chalk)]/75">
          Live shirts first. Full-time lots stay as proof the match happened.
        </p>
      </div>

      {listings.length === 0 ? (
        <p className="border border-dashed border-[var(--chalk)]/40 px-6 py-16 text-center text-[var(--chalk)]/70">
          Empty dressing room. The gateway is still in the tunnel.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing, index) => (
            <AuctionRow key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
