import { formatMatchDay, formatMoney, pad, remainingParts } from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatMoney", () => {
  it("prints whole euros", () => {
    expect(formatMoney(620).replace(/\s/g, " ")).toContain("620");
    expect(formatMoney(620)).toMatch(/€/);
  });
});

describe("formatMatchDay", () => {
  it("prints the grass date without a kickoff time", () => {
    expect(formatMatchDay("2002-06-30T12:00:00.000Z")).toBe("30 Jun 2002");
  });
});

describe("remainingParts", () => {
  it("returns null when the clock has hit zero", () => {
    expect(remainingParts(new Date(Date.now() - 1000).toISOString())).toBeNull();
  });

  it("splits a live clock", () => {
    const parts = remainingParts(new Date(Date.now() + 90_000).toISOString());
    expect(parts).not.toBeNull();
    expect(parts!.minutes).toBe(1);
    expect(parts!.seconds).toBeGreaterThanOrEqual(0);
  });
});

describe("pad", () => {
  it("keeps squad numbers two wide", () => {
    expect(pad(7)).toBe("07");
    expect(pad(11)).toBe("11");
  });
});
