import type { Metadata } from "next";
import { SearchView } from "@/features/auctions/search-view";
import { searchItems } from "@/lib/api";
import { parseSearchQuery } from "@/lib/validation";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = parseSearchQuery(await searchParams);
  const parts = [query.playerName, query.club].filter(Boolean);
  const title = parts.length ? `Find ${parts.join(" ")}` : "Find a shirt";
  const description = parts.length
    ? `Match-worn shirts matching ${parts.join(" · ")}.`
    : "Search live auctions by club, player, league, price, or kit.";

  return {
    title,
    description,
    alternates: { canonical: "/search" },
    openGraph: {
      title,
      description,
      url: "/search",
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = parseSearchQuery(await searchParams);
  const initial = await searchItems(query);
  return <SearchView query={query} initial={initial} />;
}
