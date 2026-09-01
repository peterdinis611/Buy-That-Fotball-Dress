"use client";

import Link from "next/link";
import { useOfficePegsQuery, useScratchPeg, useVerifyPeg } from "@/hooks";
import { formatMoney } from "@/lib/format";
import { ConfirmAct } from "@/components/forms/confirm-act";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function PegsSheet() {
  const pegs = useOfficePegsQuery(true);
  const scratch = useScratchPeg();
  const verify = useVerifyPeg();

  if (pegs.isError) {
    return <p className="office-err">{pegs.error instanceof Error ? pegs.error.message : "Pegs are down."}</p>;
  }

  const rows = pegs.data ?? [];
  const live = rows.filter((row) => row.status === "Live");

  return (
    <section>
      <div className="office-sheet-head">
        <h2>Pegs</h2>
        <p>
          {live.length} live · {rows.length} on the wall
        </p>
      </div>
      {scratch.isError ? (
        <p className="office-err">{scratch.error instanceof Error ? scratch.error.message : "Scratch failed."}</p>
      ) : null}
      {verify.isError ? (
        <p className="office-err">{verify.error instanceof Error ? verify.error.message : "Verify failed."}</p>
      ) : null}
      {rows.length === 0 ? (
        <Empty className="border border-dashed border-[var(--ink)]/20 py-12">
          <EmptyHeader>
            <EmptyTitle className="text-2xl">No pegs</EmptyTitle>
            <EmptyDescription>The wall is clear.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="office-pegs">
          {rows.map((peg) => {
            const canScratch = peg.status !== "Finished";
            return (
              <li key={peg.id} data-status={peg.status}>
                <Link href={`/auctions/${peg.id}`}>
                  <span className="office-peg-club">{peg.item.club}</span>
                  <strong>{peg.item.playerName}</strong>
                  <em>
                    {peg.item.season} · {peg.seller} · {peg.status}
                    {peg.currentHighBid ? ` · ${formatMoney(peg.currentHighBid)}` : ""}
                    {peg.item.verifiedBy ? ` · verified ${peg.item.verifiedBy}` : ""}
                  </em>
                </Link>
                {canScratch ? (
                  <div className="office-peg-acts">
                    {peg.item.verifiedBy ? (
                      <span className="office-mute">Verified</span>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger
                          disabled={verify.isPending}
                          className="office-act office-act-verify"
                          onClick={() => verify.mutate(peg.id)}
                        >
                          {verify.isPending ? <Spinner className="size-3.5" /> : "Verify"}
                        </TooltipTrigger>
                        <TooltipContent>Collar, wash, label checked</TooltipContent>
                      </Tooltip>
                    )}
                    <ConfirmAct
                      title={`Scratch ${peg.item.playerName}?`}
                      body="The shirt leaves the wall."
                      confirmLabel="Scratch"
                      pending={scratch.isPending}
                      triggerClassName="office-act"
                      triggerLabel="Scratch"
                      onConfirm={() => scratch.mutate(peg.id)}
                    />
                  </div>
                ) : (
                  <span className="office-mute">{peg.item.verifiedBy ? "Verified · Desk" : "Desk"}</span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
