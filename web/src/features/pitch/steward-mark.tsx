import { formatDate } from "@/lib/format";

export function StewardMark({
  by,
  at,
  className = "",
}: {
  by?: string | null;
  at?: string | null;
  className?: string;
}) {
  if (!by) return null;

  return (
    <span className={`steward-mark ${className}`} aria-label={`Verified by ${by}`}>
      <span className="steward-mark-flag">Verified</span>
      <span className="steward-mark-by">{by}</span>
      {at ? <span className="steward-mark-when">{formatDate(at)}</span> : null}
    </span>
  );
}
