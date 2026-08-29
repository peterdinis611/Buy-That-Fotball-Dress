import * as v from "valibot";
import type { CreateAuctionPayload } from "@/lib/types";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const kits = ["Home", "Away", "Third", "Goalkeeper", "Special"] as const;
const conditions = ["New", "NewWithTags", "Used", "Vintage"] as const;

export const sellFieldsSchema = v.object({
  club: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Club is required."),
    v.maxLength(100, "Club name is too long."),
  ),
  playerName: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Player is required."),
    v.maxLength(100, "Player name is too long."),
  ),
  playerNumber: v.pipe(
    v.string(),
    v.trim(),
    v.check(
      (value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 99),
      "Squad number is 0–99.",
    ),
  ),
  season: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Season is required."),
    v.maxLength(20, "Season is too long."),
  ),
  color: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Color is required."),
    v.maxLength(50, "Color is too long."),
  ),
  size: v.picklist(sizes, "Pick a size."),
  kitType: v.picklist(kits, "Pick a kit."),
  condition: v.picklist(conditions, "Pick a condition."),
  reservePrice: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Starting price is required."),
    v.check((value) => /^\d+$/.test(value), "Starting price must be a whole number."),
  ),
  league: v.pipe(v.string(), v.trim(), v.maxLength(50, "League is too long.")),
  auctionEnd: v.pipe(
    v.string(),
    v.nonEmpty("End time is required."),
    v.check((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid end time."),
    v.check((value) => new Date(value).getTime() > Date.now(), "End time must be in the future."),
  ),
  imageUrl: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(500, "Photo URL is too long."),
    v.check((value) => value === "" || /^https?:\/\/.+/i.test(value), "Photo must be a URL."),
  ),
});

export type SellFields = v.InferOutput<typeof sellFieldsSchema>;

export function toCreateAuctionPayload(fields: SellFields): CreateAuctionPayload {
  return {
    reservePrice: Number(fields.reservePrice),
    auctionEnd: new Date(fields.auctionEnd).toISOString(),
    item: {
      club: fields.club,
      playerName: fields.playerName,
      playerNumber: fields.playerNumber === "" ? undefined : Number(fields.playerNumber),
      season: fields.season,
      size: fields.size,
      color: fields.color,
      kitType: fields.kitType,
      condition: fields.condition,
      league: fields.league || undefined,
      imageUrl: fields.imageUrl || undefined,
    },
  };
}

export { sizes, kits, conditions };

export const bidFieldsSchema = v.object({
  amount: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Put a number on the shot."),
    v.check((value) => /^\d+$/.test(value), "Whole euros only."),
    v.check((value) => Number(value) > 0, "A shot has to be more than nothing."),
  ),
});

export type BidFields = v.InferOutput<typeof bidFieldsSchema>;
