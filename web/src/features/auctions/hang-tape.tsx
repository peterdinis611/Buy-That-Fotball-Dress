"use client";

import { useState } from "react";
import { useAuth, useHangPeg } from "@/hooks";
import type { SearchQuery } from "@/lib/types";

function tapeFromQuery(query: SearchQuery) {
  const club = query.q?.trim() || query.club?.trim() || undefined;
  return {
    club,
    league: query.league,
    size: query.size,
    kitType: query.kitType,
    status: "Live",
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
  };
}

function canHang(query: SearchQuery) {
  const tape = tapeFromQuery(query);
  return Boolean(tape.club || tape.league || tape.size || tape.kitType || tape.minPrice != null || tape.maxPrice != null);
}

export function HangTape({ query }: { query: SearchQuery }) {
  const { user } = useAuth();
  const hang = useHangPeg();
  const [note, setNote] = useState<string | null>(null);

  if (!user || !canHang(query)) return null;

  return (
    <div className="hang-tape">
      <button
        type="button"
        className="hang-tape-btn"
        disabled={hang.isPending}
        onClick={async () => {
          setNote(null);
          try {
            await hang.mutateAsync(tapeFromQuery(query));
            setNote("Hung. A letter lands when a matching shirt is listed.");
          } catch (err) {
            setNote(err instanceof Error ? err.message : "Could not hang this tape.");
          }
        }}
      >
        {hang.isPending ? "Hanging…" : "Hang this filter"}
      </button>
      {note ? <p className="hang-tape-note">{note}</p> : null}
    </div>
  );
}
