"use client";

import { useMemo, useState } from "react";
import { PegWall } from "./kit-peg";
import type { KitListing } from "@/lib/types";

export const railLeagues = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "MLS", "World Cup", "Niké Liga"];
export const railSizes = ["XS", "S", "M", "L", "XL", "XXL"];
export const railKits = ["Home", "Away", "Third", "Goalkeeper", "Special"];

type RailFilter = {
  league: string;
  size: string;
  kitType: string;
  minPrice: string;
  maxPrice: string;
  soon: boolean;
};

const blank: RailFilter = { league: "", size: "", kitType: "", minPrice: "", maxPrice: "", soon: false };

export function filterRail(listings: KitListing[], filter: RailFilter) {
  const min = filter.minPrice && /^\d+$/.test(filter.minPrice) ? Number(filter.minPrice) : null;
  const max = filter.maxPrice && /^\d+$/.test(filter.maxPrice) ? Number(filter.maxPrice) : null;
  const soonCut = Date.now() + 2 * 60 * 60 * 1000;

  return listings.filter((row) => {
    if (filter.league && (row.league ?? "").toLowerCase() !== filter.league.toLowerCase()) return false;
    if (filter.size && row.size.toUpperCase() !== filter.size.toUpperCase()) return false;
    if (filter.kitType && row.kitType.toLowerCase() !== filter.kitType.toLowerCase()) return false;
    const price = row.currentHighBid ?? row.reservePrice;
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    if (filter.soon && new Date(row.auctionEnd).getTime() > soonCut) return false;
    return true;
  });
}

export function FilteredPegWall({ listings, empty }: { listings: KitListing[]; empty?: string }) {
  const [filter, setFilter] = useState<RailFilter>(blank);
  const shown = useMemo(() => filterRail(listings, filter), [listings, filter]);
  const lit = Boolean(filter.league || filter.size || filter.kitType || filter.minPrice || filter.maxPrice || filter.soon);

  function set<K extends keyof RailFilter>(key: K, value: RailFilter[K]) {
    setFilter((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <div className="rail-clip" role="group" aria-label="Filter the wall">
        <ChipSelect label="League" value={filter.league} options={railLeagues} onChange={(value) => set("league", value)} />
        <ChipSelect label="Size" value={filter.size} options={railSizes} onChange={(value) => set("size", value)} />
        <ChipSelect label="Kit" value={filter.kitType} options={railKits} onChange={(value) => set("kitType", value)} />
        <label className={`rail-chip ${filter.minPrice ? "rail-chip-lit" : ""}`}>
          <span>Min €</span>
          <input
            inputMode="numeric"
            value={filter.minPrice}
            placeholder="—"
            onChange={(event) => set("minPrice", event.target.value.replace(/[^\d]/g, ""))}
          />
        </label>
        <label className={`rail-chip ${filter.maxPrice ? "rail-chip-lit" : ""}`}>
          <span>Max €</span>
          <input
            inputMode="numeric"
            value={filter.maxPrice}
            placeholder="—"
            onChange={(event) => set("maxPrice", event.target.value.replace(/[^\d]/g, ""))}
          />
        </label>
        <button
          type="button"
          className={`rail-chip rail-chip-btn ${filter.soon ? "rail-chip-lit" : ""}`}
          aria-pressed={filter.soon}
          onClick={() => set("soon", !filter.soon)}
        >
          Ends in 2h
        </button>
        {lit ? (
          <button type="button" className="rail-chip-clear" onClick={() => setFilter(blank)}>
            Clear
          </button>
        ) : null}
      </div>
      <PegWall listings={shown} empty={empty ?? (lit ? "Nothing on this clip. Loosen a filter." : undefined)} />
    </div>
  );
}

function ChipSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={`rail-chip ${value ? "rail-chip-lit" : ""}`}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
