"use client";

import { useClock } from "@/hooks";
import { pad } from "@/lib/format";

export function MatchClock() {
  const now = useClock();

  return (
    <span className="scoreboard font-[family-name:var(--font-display)] text-xl leading-none text-[var(--bib)]">
      {pad(now.getHours())}:{pad(now.getMinutes())}
    </span>
  );
}
