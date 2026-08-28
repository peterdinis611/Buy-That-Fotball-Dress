"use client";

import { useEffect, useState } from "react";
import { pad } from "@/lib/format";

export function MatchClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="scoreboard font-[family-name:var(--font-teko)] text-xl leading-none text-[var(--line)]">
      {pad(now.getHours())}:{pad(now.getMinutes())}
    </span>
  );
}
