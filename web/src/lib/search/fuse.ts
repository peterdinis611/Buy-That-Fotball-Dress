import Fuse, { type IFuseOptions } from "fuse.js";
import type { KitListing } from "@/lib/types";

const options: IFuseOptions<KitListing> = {
  keys: [
    { name: "playerName", weight: 0.4 },
    { name: "club", weight: 0.3 },
    { name: "league", weight: 0.15 },
    { name: "season", weight: 0.1 },
    { name: "kitType", weight: 0.05 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  shouldSort: true,
};

export function fuseListings(listings: KitListing[], needle?: string) {
  const q = needle?.trim() ?? "";
  if (q.length < 2) return listings;
  return new Fuse(listings, options).search(q).map((hit) => hit.item);
}
