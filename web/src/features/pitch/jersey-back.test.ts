import { kitColors } from "@/features/pitch/jersey-back";
import { describe, expect, it } from "vitest";

describe("kitColors", () => {
  it("reads Brazil yellow and Madrid white", () => {
    expect(kitColors("Yellow").fill).toBe("#ffdf00");
    expect(kitColors("White").fill).toBe("#f4f1ea");
    expect(kitColors("Blue/Red").fill).toBe("#a50044");
  });

  it("falls back to chalk", () => {
    expect(kitColors("chalk").fill).toBe("#f4f1ea");
  });
});
