"use client";

import { SearchFilters } from "./search-filters";
import { HangTape } from "./hang-tape";
import { PegWall } from "@/features/pitch";
import { useSearchQuery } from "@/hooks";
import { fuseListings } from "@/lib/search/fuse";
import { fromSearchItem, isOpenLot, type PagedResult, type SearchItem, type SearchQuery } from "@/lib/types";
import { toCatalogQuery } from "@/lib/validation";

export function SearchView({
  query,
  initial,
}: {
  query: SearchQuery;
  initial: PagedResult<SearchItem>;
}) {
  const catalog = toCatalogQuery(query);
  const { data = initial } = useSearchQuery(catalog, initial);
  const listings = fuseListings(data.results.map(fromSearchItem).filter(isOpenLot), query.q);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="reveal font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
          Search
        </p>
        <h1 className="reveal delay-1 mt-1 text-6xl text-[var(--ink)] md:text-8xl">Find a shirt.</h1>
      </div>

      <SearchFilters query={query} />
      <HangTape query={query} />

      <p className="mb-6 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        {listings.length} shirts
      </p>

      {listings.length === 0 ? (
        <p className="border border-dashed border-[var(--ink)]/20 bg-[var(--tape)] px-6 py-20 text-center text-lg text-[var(--ink)]/70">
          No shirts on this rail. Clear a filter or browse live lots.
        </p>
      ) : (
        <PegWall listings={listings} />
      )}
    </div>
  );
}
