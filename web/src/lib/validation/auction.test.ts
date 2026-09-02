import * as v from "valibot";
import {
  bidFieldsSchema,
  sellFieldsSchema,
  toCreateAuctionPayload,
  toSellFields,
  type SellFields,
} from "@/lib/validation/auction";
import type { Auction } from "@/lib/types";
import { describe, expect, it } from "vitest";

function shirt(overrides: Partial<SellFields> = {}): SellFields {
  return {
    club: "Brazil",
    playerName: "Ronaldo Nazário",
    playerNumber: "9",
    season: "2002",
    color: "Yellow",
    size: "M",
    pitToPit: "",
    backLength: "",
    backNumber: "",
    kitType: "Home",
    condition: "Vintage",
    reservePrice: "400",
    league: "World Cup",
    auctionEnd: new Date(Date.now() + 86_400_000).toISOString().slice(0, 16),
    imageUrl: "",
    match: "",
    matchDate: "",
    opponent: "",
    pitchPhotoUrl: "",
    collarPhotoUrl: "",
    washPhotoUrl: "",
    labelPhotoUrl: "",
    coaUrl: "",
    ...overrides,
  };
}

describe("sellFieldsSchema", () => {
  it("lists a shirt without provenance", () => {
    expect(v.safeParse(sellFieldsSchema, shirt()).success).toBe(true);
  });

  it("stamps a match day when the grass fields are filled", () => {
    const parsed = v.parse(
      sellFieldsSchema,
      shirt({
        match: "World Cup final",
        matchDate: "2002-06-30",
        opponent: "Germany",
        pitchPhotoUrl: "https://placehold.co/grass.png",
      }),
    );
    const payload = toCreateAuctionPayload(parsed);
    expect(payload.item.match).toBe("World Cup final");
    expect(payload.item.opponent).toBe("Germany");
    expect(payload.item.matchDate).toBe("2002-06-30T12:00:00.000Z");
    expect(payload.item.pitchPhotoUrl).toBe("https://placehold.co/grass.png");
  });

  it("stamps kit tape when the measures are filled", () => {
    const parsed = v.parse(
      sellFieldsSchema,
      shirt({ pitToPit: "52", backLength: "71", backNumber: "25" }),
    );
    const payload = toCreateAuctionPayload(parsed);
    expect(payload.item.pitToPit).toBe(52);
    expect(payload.item.backLength).toBe(71);
    expect(payload.item.backNumber).toBe(25);
  });

  it("drops blank grass fields", () => {
    const payload = toCreateAuctionPayload(v.parse(sellFieldsSchema, shirt()));
    expect(payload.item.match).toBeUndefined();
    expect(payload.item.matchDate).toBeUndefined();
    expect(payload.item.opponent).toBeUndefined();
  });

  it("rejects a squad number over 99", () => {
    expect(v.safeParse(sellFieldsSchema, shirt({ playerNumber: "100" })).success).toBe(false);
  });

  it("rejects an end already on the clock", () => {
    expect(
      v.safeParse(sellFieldsSchema, shirt({ auctionEnd: new Date(Date.now() - 60_000).toISOString().slice(0, 16) }))
        .success,
    ).toBe(false);
  });
});

describe("toSellFields", () => {
  it("slices match date for the date input", () => {
    const auction: Auction = {
      id: "9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466",
      reservePrice: 400,
      seller: "selecao.archive",
      createdAt: "2026-08-18T13:10:19.765Z",
      updatedAt: "2026-08-28T15:36:14.585Z",
      auctionEnd: "2026-08-27T13:10:19.765Z",
      status: "Finished",
      item: {
        id: "item",
        club: "Brazil",
        playerName: "Ronaldo Nazário",
        playerNumber: 9,
        season: "2002",
        size: "M",
        color: "Yellow",
        kitType: "Home",
        condition: "Vintage",
        match: "World Cup final",
        matchDate: "2002-06-30T12:00:00.000Z",
        opponent: "Germany",
        pitchPhotoUrl: "https://placehold.co/grass.png",
      },
    };

    const fields = toSellFields(auction);
    expect(fields.match).toBe("World Cup final");
    expect(fields.matchDate).toBe("2002-06-30");
    expect(fields.opponent).toBe("Germany");
    expect(fields.playerNumber).toBe("9");
    expect(fields.pitToPit).toBe("");
  });
});

describe("bidFieldsSchema", () => {
  it("wants a whole euro over nothing", () => {
    expect(v.safeParse(bidFieldsSchema, { amount: "620", maxAmount: "" }).success).toBe(true);
    expect(v.safeParse(bidFieldsSchema, { amount: "0", maxAmount: "" }).success).toBe(false);
    expect(v.safeParse(bidFieldsSchema, { amount: "12.5", maxAmount: "" }).success).toBe(false);
    expect(v.safeParse(bidFieldsSchema, { amount: "", maxAmount: "" }).success).toBe(false);
  });
});
