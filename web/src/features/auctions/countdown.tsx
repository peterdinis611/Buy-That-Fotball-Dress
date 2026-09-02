"use client";

import { useCountdown } from "@/hooks";
import { pad } from "@/lib/format";

export function Countdown({
  endsAt,
  injury,
  className = "",
}: {
  endsAt: string;
  injury?: boolean;
  className?: string;
}) {
  const { remaining, ready } = useCountdown(endsAt);

  if (!ready) {
    return (
      <span className={`scoreboard font-[family-name:var(--font-display)] tabular-nums tracking-widest ${className}`}>
        —
      </span>
    );
  }

  if (!remaining) {
    return (
      <span className={`scoreboard font-[family-name:var(--font-display)] text-[var(--cardinal)] ${className}`}>
        Ended
      </span>
    );
  }

  const label = `${remaining.days > 0 ? `${remaining.days}d ` : ""}${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}`;

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span
        key={label}
        className="scoreboard digit-tick font-[family-name:var(--font-display)] tabular-nums tracking-widest"
      >
        {label}
      </span>
      {injury ? (
        <span className="font-[family-name:var(--font-display)] text-[0.7em] tracking-[0.14em] text-[var(--led)] uppercase">
          +3 min
        </span>
      ) : null}
    </span>
  );
}
