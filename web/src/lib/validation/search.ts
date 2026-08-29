import * as v from "valibot";
import type { SearchQuery } from "@/lib/types";

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value?.trim() || undefined;
}

const statuses = ["Live", "Finished", "ReserveNotMet"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const kits = ["Home", "Away", "Third", "Goalkeeper", "Special"] as const;
const sorts = ["EndingSoon", "Newest", "PriceAsc", "PriceDesc"] as const;

export const searchQuerySchema = v.object({
  q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(100))),
  club: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(100))),
  playerName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(100))),
  status: v.optional(v.picklist(statuses)),
  size: v.optional(v.picklist(sizes)),
  kitType: v.optional(v.picklist(kits)),
  league: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(50))),
  sort: v.optional(v.picklist(sorts)),
  minPrice: v.optional(v.pipe(v.number(), v.minValue(0))),
  maxPrice: v.optional(v.pipe(v.number(), v.minValue(0))),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(50)), 20),
});

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  if (!value) return undefined;
  const match = allowed.find((entry) => entry.toLowerCase() === value.toLowerCase());
  return match;
}

function money(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  return Number(value);
}

export function parseSearchQuery(
  params: Record<string, string | string[] | undefined>,
): SearchQuery {
  const sort = pick(first(params.sort), sorts);
  const q =
    first(params.q) ||
    [first(params.club), first(params.playerName)].filter(Boolean).join(" ") ||
    undefined;
  const raw = {
    q,
    status: "Live",
    size: pick(first(params.size), sizes),
    kitType: pick(first(params.kitType), kits),
    league: first(params.league),
    sort: sort && sort !== "EndingSoon" ? sort : undefined,
    minPrice: money(first(params.minPrice)),
    maxPrice: money(first(params.maxPrice)),
    page: 1,
    pageSize: 50,
  };

  const result = v.safeParse(searchQuerySchema, raw);
  if (result.success) return { ...result.output, status: "Live" };
  return { page: 1, pageSize: 50, status: "Live" };
}

export function toCatalogQuery(query: SearchQuery): SearchQuery {
  return {
    status: "Live",
    size: query.size,
    kitType: query.kitType,
    league: query.league,
    sort: query.sort,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    page: 1,
    pageSize: 50,
  };
}
