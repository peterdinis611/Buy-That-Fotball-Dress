"use client";

import Link from "next/link";
import { useOfficeTillsQuery, useWhistleTill } from "@/hooks";
import { formatMoney } from "@/lib/format";

export function TillsSheet() {
  const tills = useOfficeTillsQuery(true);
  const whistle = useWhistleTill();

  if (tills.isError) {
    return <p className="office-err">{tills.error instanceof Error ? tills.error.message : "Tills are dark."}</p>;
  }

  const rows = tills.data ?? [];
  const fights = rows.filter((row) => row.status === "Disputed");

  return (
    <section>
      <div className="office-sheet-head">
        <h2>Tills</h2>
        <p>
          {fights.length} disputed · {rows.length} desks
        </p>
      </div>
      {whistle.isError ? (
        <p className="office-err">{whistle.error instanceof Error ? whistle.error.message : "Whistle failed."}</p>
      ) : null}
      <ol className="office-tills">
        {rows.map((till) => {
          const fight = till.status === "Disputed";
          return (
            <li key={till.id} data-fight={fight}>
              <Link href={`/auctions/${till.auctionId}`}>
                <span className="office-peg-club">{till.club}</span>
                <strong>
                  {till.playerName} · {formatMoney(till.amount)}
                </strong>
                <em>
                  {till.buyer} buys from {till.seller} · {till.status}
                </em>
                {fight && till.disputeNote ? <q>{till.disputeNote}</q> : null}
              </Link>
              {fight ? (
                <button
                  type="button"
                  className="office-act"
                  data-whistle="true"
                  disabled={whistle.isPending}
                  onClick={() => {
                    if (window.confirm("Blow the whistle? The desk reopens at the last honest step.")) {
                      whistle.mutate(till.id);
                    }
                  }}
                >
                  Whistle
                </button>
              ) : (
                <span className="office-mute">{till.status}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
