"use client";

import { SearchFilters } from "@/components/auctions/search-filters";
import { PegWall } from "@/components/pitch";
import { useSearchQuery } from "@/lib/query/hooks";
import { fromSearchItem, type PagedResult, type SearchItem, type SearchQuery } from "@/lib/types";

export function SearchView({
  query,
  initial,
}: {
  query: SearchQuery;
  initial: PagedResult<SearchItem>;
}) {
  const { data = initial } = useSearchQuery(query, initial);
  const listings = data.results.map(fromSearchItem);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          VAR check
        </p>
        <h1 className="reveal delay-1 mt-1 text-6xl text-[var(--chalk)] md:text-8xl">Find the shirt.</h1>
      </div>

      <SearchFilters query={query} />

      <p className="mb-6 font-[family-name:var(--font-teko)] text-lg tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
        {data.totalCount} shirts on the grass
      </p>

      {listings.length === 0 ? (
        <p className="border border-dashed border-[var(--chalk)]/30 px-6 py-20 text-center font-[family-name:var(--font-teko)] text-3xl tracking-[0.12em] text-[var(--chalk)]/70">
          Offside — nothing in this replay.
        </p>
      ) : (
        <PegWall listings={listings} />
      )}
    </div>
  );
}
