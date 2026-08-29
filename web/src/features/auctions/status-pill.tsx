import type { AuctionStatus } from "@/lib/types";

export function StatusPill({ status }: { status: AuctionStatus }) {
  if (status === "Live") {
    return (
      <span className="live-dot inline-flex items-center gap-2 bg-[var(--led)] px-2 py-0.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
        Live
      </span>
    );
  }

  if (status === "Finished") {
    return (
      <span className="inline-flex bg-[var(--ink)] px-2 py-0.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--tape)] uppercase">
        Ended
      </span>
    );
  }

  return (
    <span className="inline-flex bg-[var(--stud)] px-2 py-0.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--bib)] uppercase">
      Unsold
    </span>
  );
}
