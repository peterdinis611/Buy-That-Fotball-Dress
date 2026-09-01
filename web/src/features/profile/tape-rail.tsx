"use client";

import Link from "next/link";
import { useDropPeg } from "@/hooks";
import { formatMoney } from "@/lib/format";
import type { SavedPeg } from "@/lib/types";

function tapeLine(peg: SavedPeg) {
  const bits = [
    peg.club,
    peg.league,
    peg.size,
    peg.kitType,
    peg.minPrice != null ? `from ${formatMoney(peg.minPrice)}` : null,
    peg.maxPrice != null ? `to ${formatMoney(peg.maxPrice)}` : null,
    peg.status === "Live" ? "live" : peg.status,
  ].filter(Boolean);
  return bits.join(" · ");
}

function tapeHref(peg: SavedPeg) {
  const params = new URLSearchParams();
  if (peg.club) params.set("q", peg.club);
  if (peg.league) params.set("league", peg.league);
  if (peg.size) params.set("size", peg.size);
  if (peg.kitType) params.set("kitType", peg.kitType);
  if (peg.minPrice != null) params.set("minPrice", String(peg.minPrice));
  if (peg.maxPrice != null) params.set("maxPrice", String(peg.maxPrice));
  const suffix = params.toString();
  return suffix ? `/search?${suffix}` : "/search";
}

export function TapeRail({ rows, loading }: { rows: SavedPeg[]; loading: boolean }) {
  const drop = useDropPeg();

  if (loading) {
    return (
      <p className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/50">
        Loading tape…
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/60">
        No tape hung. Filter the search rail and hang it — a letter lands when a matching shirt is listed.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--ink)]/15 border border-[var(--ink)]/15 bg-[var(--tape)]">
      {rows.map((peg) => (
        <li key={peg.id} className="tape-row">
          <Link href={tapeHref(peg)}>
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--bib)] uppercase">
              Tape
            </p>
            <p className="text-2xl text-[var(--ink)]">{tapeLine(peg)}</p>
          </Link>
          <button
            type="button"
            className="tape-drop"
            disabled={drop.isPending}
            onClick={() => drop.mutate(peg.id)}
          >
            Drop
          </button>
        </li>
      ))}
    </ul>
  );
}
