"use client";

import { useOfficeSquadQuery } from "@/hooks";
import { STEWARD_ROLE } from "@/lib/auth";

export function SquadSheet() {
  const squad = useOfficeSquadQuery(true);

  if (squad.isError) {
    return <p className="office-err">{squad.error instanceof Error ? squad.error.message : "Squad sheet is missing."}</p>;
  }

  const rows = squad.data ?? [];

  return (
    <section>
      <div className="office-sheet-head">
        <h2>Squad sheet</h2>
        <p>{squad.isLoading ? "…" : `${rows.length} names`}</p>
      </div>
      <ol className="office-squad">
        {rows.map((player, index) => (
          <li key={player.id} className="reveal" style={{ animationDelay: `${index * 0.04}s` }}>
            <span className="office-squad-no">{String(index + 1).padStart(2, "0")}</span>
            <span>
              <strong>{player.displayName || player.username}</strong>
              <em>{player.username}</em>
            </span>
            <span className="office-squad-mail">{player.email}</span>
            {player.roles.includes(STEWARD_ROLE) ? <span className="office-stamp" data-verb="steward">Steward</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
