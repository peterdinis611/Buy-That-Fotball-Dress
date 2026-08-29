"use client";

import { useCountdown } from "@/hooks";
import { pad } from "@/lib/format";

export function Countdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const remaining = useCountdown(endsAt);

  if (!remaining) {
    return (
      <span className={`scoreboard font-[family-name:var(--font-display)] text-[var(--cardinal)] ${className}`}>
        Ended
      </span>
    );
  }

  return (
    <span className={`scoreboard font-[family-name:var(--font-display)] tabular-nums tracking-widest ${className}`}>
      {remaining.days > 0 ? `${remaining.days}d ` : ""}
      {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
    </span>
  );
}
