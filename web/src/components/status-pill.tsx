import type { AuctionStatus } from "@/lib/types";

export function StatusPill({ status }: { status: AuctionStatus }) {
  if (status === "Live") {
    return (
      <span className="live-dot inline-flex items-center gap-2 border border-[var(--line)] bg-[color-mix(in_oklab,var(--line)_14%,transparent)] px-2 py-1 font-[family-name:var(--font-plex)] text-[10px] tracking-[0.28em] text-[var(--line)] uppercase">
        <span className="size-1.5 rounded-full bg-[var(--line)]" />
        Live
      </span>
    );
  }

  if (status === "Finished") {
    return (
      <span className="inline-flex border border-[var(--border)] px-2 py-1 font-[family-name:var(--font-plex)] text-[10px] tracking-[0.28em] text-[var(--muted-foreground)] uppercase">
        Sold
      </span>
    );
  }

  return (
    <span className="inline-flex border border-[var(--cardinal)] px-2 py-1 font-[family-name:var(--font-plex)] text-[10px] tracking-[0.22em] text-[var(--cardinal)] uppercase">
      Reserve unmet
    </span>
  );
}
