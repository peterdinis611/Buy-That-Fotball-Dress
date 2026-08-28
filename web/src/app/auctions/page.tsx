import { AuctionRow } from "@/components/auction-row";
import { getAuctions } from "@/lib/api";
import { fromAuction } from "@/lib/types";

export default async function AuctionsPage() {
  const auctions = await getAuctions();
  const listings = auctions.map(fromAuction);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 max-w-xl">
        <p className="reveal font-[family-name:var(--font-plex)] text-[10px] tracking-[0.34em] text-[var(--line)] uppercase">
          Transfer board
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl text-[var(--flood)] md:text-7xl">Every shirt on a peg.</h1>
        <p className="reveal delay-2 mt-4 italic text-[var(--flood)]/70">
          Live lots first. Finished nights stay in the archive as proof they existed.
        </p>
      </div>

      {listings.length === 0 ? (
        <p className="border border-dashed border-[var(--border)] px-6 py-16 text-center italic text-[var(--flood)]/60">
          Nothing hanging. Wake the gateway.
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
