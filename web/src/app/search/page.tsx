import { AuctionRow } from "@/components/auction-row";
import { SearchFilters } from "@/components/search-filters";
import { searchItems } from "@/lib/api";
import { fromSearchItem } from "@/lib/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = {
    club: first(params.club),
    playerName: first(params.playerName),
    status: first(params.status),
    size: first(params.size),
    kitType: first(params.kitType),
    page: 1,
    pageSize: 20,
  };

  const page = await searchItems(query);
  const listings = page.results.map(fromSearchItem);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          VAR check
        </p>
        <h1 className="reveal delay-1 mt-1 text-6xl text-[var(--chalk)] md:text-7xl">Find the shirt.</h1>
      </div>

      <SearchFilters query={query} />

      <p className="mb-4 font-[family-name:var(--font-teko)] text-[10px] tracking-[0.28em] text-[var(--muted-foreground)] uppercase">
        {page.totalCount} shirts on the grass
      </p>

      <div className="flex flex-col gap-3">
        {listings.map((listing, index) => (
          <AuctionRow key={listing.id} listing={listing} index={index} />
        ))}
      </div>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
