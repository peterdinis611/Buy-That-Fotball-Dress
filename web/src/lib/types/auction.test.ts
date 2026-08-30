import { fromAuction, isOpenLot, type Auction } from "@/lib/types";
import { cantona, kane } from "@/stories/fixtures";
import { describe, expect, it } from "vitest";

const ronaldo: Auction = {
  id: "9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466",
  reservePrice: 400,
  seller: "selecao.archive",
  winner: "kitvault",
  highBidder: "kitvault",
  soldAmount: 620,
  currentHighBid: 620,
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
    league: "World Cup",
    match: "World Cup final",
    matchDate: "2002-06-30T12:00:00.000Z",
    opponent: "Germany",
    pitchPhotoUrl: "https://placehold.co/grass.png",
  },
};

describe("fromAuction", () => {
  it("lifts provenance onto the listing", () => {
    const listing = fromAuction(ronaldo);
    expect(listing.playerName).toBe("Ronaldo Nazário");
    expect(listing.match).toBe("World Cup final");
    expect(listing.opponent).toBe("Germany");
    expect(listing.pitchPhotoUrl).toContain("grass");
  });
});

describe("isOpenLot", () => {
  it("is live only while the clock still runs", () => {
    expect(isOpenLot(kane)).toBe(true);
    expect(isOpenLot(cantona)).toBe(false);
    expect(isOpenLot(fromAuction(ronaldo))).toBe(false);
  });
});
