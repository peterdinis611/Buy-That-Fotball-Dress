"use client";

import { useClock } from "@/hooks";
import { pad } from "@/lib/format";

export function MatchClock() {
  const now = useClock();
  const label = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <span
      key={label}
      className="scoreboard digit-tick font-[family-name:var(--font-display)] text-xl leading-none text-[var(--bib)]"
    >
      {label}
    </span>
  );
}
