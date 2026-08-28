import { SearchView } from "@/components/auctions/search-view";
import { searchItems } from "@/lib/api";
import { parseSearchQuery } from "@/lib/validation";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseSearchQuery(await searchParams);
  const initial = await searchItems(query);
  return <SearchView query={query} initial={initial} />;
}
