import { fuseListings } from "@/lib/search/fuse";
import { kane, liveWall, salah } from "@/stories/fixtures";
import { describe, expect, it } from "vitest";

describe("fuseListings", () => {
  it("passes the wall through when the needle is short", () => {
    expect(fuseListings(liveWall)).toEqual(liveWall);
    expect(fuseListings(liveWall, "s")).toEqual(liveWall);
  });

  it("finds a player on the pegs", () => {
    const hits = fuseListings(liveWall, "Salah");
    expect(hits.map((row) => row.id)).toEqual([salah.id]);
    expect(fuseListings(liveWall, "Kane")[0].id).toBe(kane.id);
  });
});
