"use client";

import Link from "next/link";
import { useOfficePegsQuery, useScratchPeg, useVerifyPeg } from "@/hooks";
import { formatMoney } from "@/lib/format";

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
                    <button
                      type="button"
                      className="office-act office-act-verify"
                      disabled={verify.isPending}
                      onClick={() => verify.mutate(peg.id)}
                    >
                      Verify
                    </button>
                  )}
                  <button
                    type="button"
                    className="office-act"
                    disabled={scratch.isPending}
                    onClick={() => {
                      if (window.confirm(`Scratch ${peg.item.playerName}? The shirt leaves the wall.`)) {
                        scratch.mutate(peg.id);
                      }
                    }}
                  >
                    Scratch
                  </button>
                </div>
              ) : (
                <span className="office-mute">{peg.item.verifiedBy ? "Verified · Desk" : "Desk"}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
