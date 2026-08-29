import * as v from "valibot";
import type { SearchQuery } from "@/lib/types";

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value?.trim() || undefined;
}

const statuses = ["Live", "Finished", "ReserveNotMet"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const kits = ["Home", "Away", "Third", "Goalkeeper", "Special"] as const;

export const searchQuerySchema = v.object({
  club: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(100))),
  playerName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(100))),
  status: v.optional(v.picklist(statuses)),
  size: v.optional(v.picklist(sizes)),
  kitType: v.optional(v.picklist(kits)),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(50)), 20),
});

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export function parseSearchQuery(
  params: Record<string, string | string[] | undefined>,
): SearchQuery {
  const raw = {
    club: first(params.club),
    playerName: first(params.playerName),
    status: "Live",
    size: pick(first(params.size), sizes),
    kitType: pick(first(params.kitType), kits),
    page: 1,
    pageSize: 20,
  };

  const result = v.safeParse(searchQuerySchema, raw);
  if (result.success) return result.output;
  return { page: 1, pageSize: 20, status: "Live" };
}
