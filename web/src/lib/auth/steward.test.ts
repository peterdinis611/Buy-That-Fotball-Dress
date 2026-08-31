import { describe, expect, it } from "vitest";
import { isSteward } from "@/lib/auth";

describe("isSteward", () => {
  it("lets the match official through", () => {
    expect(isSteward({ roles: ["Steward"] })).toBe(true);
  });

  it("keeps the concourse out of the tunnel", () => {
    expect(isSteward({ roles: [] })).toBe(false);
    expect(isSteward(null)).toBe(false);
    expect(isSteward({ roles: ["Buyer"] })).toBe(false);
  });
});
