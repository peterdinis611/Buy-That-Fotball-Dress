import { parseSearchQuery, toCatalogQuery } from "@/lib/validation/search";
import { describe, expect, it } from "vitest";

describe("parseSearchQuery", () => {
  it("keeps the catalog on live lots", () => {
    const query = parseSearchQuery({ q: "Ronaldo", size: "m", minPrice: "400" });
    expect(query.status).toBe("Live");
    expect(query.size).toBe("M");
    expect(query.minPrice).toBe(400);
    expect(query.q).toBe("Ronaldo");
  });

  it("ignores a junk sort", () => {
    const query = parseSearchQuery({ sort: "popular" });
    expect(query.sort).toBeUndefined();
    expect(query.status).toBe("Live");
  });
});

describe("toCatalogQuery", () => {
  it("forces live and a wide page", () => {
    const query = toCatalogQuery({ status: "Finished", page: 3, pageSize: 10, size: "L" });
    expect(query.status).toBe("Live");
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(50);
    expect(query.size).toBe("L");
  });
});
