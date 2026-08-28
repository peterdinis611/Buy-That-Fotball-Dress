"use client";

import { useEffect, useState } from "react";
import { pad, remainingParts } from "@/lib/format";

export function Countdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState(() => remainingParts(endsAt));

  useEffect(() => {
    const id = window.setInterval(() => setNow(remainingParts(endsAt)), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (!now) {
    return (
      <span className={`font-[family-name:var(--font-plex)] text-[var(--cardinal)] ${className}`}>
        WHISTLE
      </span>
    );
  }

  return (
    <span className={`font-[family-name:var(--font-plex)] tabular-nums tracking-widest ${className}`}>
      {now.days > 0 ? `${now.days}d ` : ""}
      {pad(now.hours)}:{pad(now.minutes)}:{pad(now.seconds)}
    </span>
  );
}
