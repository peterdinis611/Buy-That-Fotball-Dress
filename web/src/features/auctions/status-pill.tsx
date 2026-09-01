import type { AuctionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function StatusPill({ status }: { status: AuctionStatus }) {
  if (status === "Live") {
    return (
      <Badge className="live-dot h-auto bg-[var(--led)] px-2 py-0.5 text-lg text-white">
        Live
      </Badge>
    );
  }

  if (status === "Finished") {
    return (
      <Badge className="h-auto bg-[var(--ink)] px-2 py-0.5 text-lg text-[var(--tape)]">
        Ended
      </Badge>
    );
  }

  return (
    <Badge className="h-auto bg-[var(--stud)] px-2 py-0.5 text-lg text-[var(--bib)]">
      Unsold
    </Badge>
  );
}
