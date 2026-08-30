import { formatMatchDay } from "@/lib/format";

export type ProvenanceBits = {
  match?: string | null;
  opponent?: string | null;
  matchDate?: string | null;
  pitchPhotoUrl?: string | null;
};

export function hasWornStamp(row: ProvenanceBits) {
  return Boolean(row.match && row.opponent && row.matchDate);
}

export function WornStamp({
  row,
  compact = false,
  className = "",
}: {
  row: ProvenanceBits;
  compact?: boolean;
  className?: string;
}) {
  if (!hasWornStamp(row)) return null;

  return (
    <span className={`worn-stamp ${compact ? "worn-stamp-sm" : ""} ${className}`} aria-label={`Worn vs ${row.opponent}`}>
      <span className="worn-stamp-mark">Worn</span>
      <span className="worn-stamp-vs">vs {row.opponent}</span>
      <span className="worn-stamp-when">{formatMatchDay(row.matchDate!)}</span>
    </span>
  );
}
