"use client";

import Link from "next/link";
import { useOfficeTillsQuery, useWhistleTill } from "@/hooks";
import { formatMoney } from "@/lib/format";
import { ConfirmAct } from "@/components/forms/confirm-act";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

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
      {rows.length === 0 ? (
        <Empty className="border border-dashed border-[var(--ink)]/20 py-12">
          <EmptyHeader>
            <EmptyTitle className="text-2xl">No tills</EmptyTitle>
            <EmptyDescription>Desks open when a lot sells.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
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
                    <ConfirmAct
                    title="Blow the whistle?"
                    body="The desk reopens at the last honest step."
                    confirmLabel="Whistle"
                    pending={whistle.isPending}
                    triggerClassName="office-act"
                    triggerLabel="Whistle"
                    dataWhistle
                    onConfirm={() => whistle.mutate(till.id)}
                  />
                ) : (
                  <span className="office-mute">{till.status}</span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
