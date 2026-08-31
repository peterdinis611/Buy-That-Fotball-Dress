"use client";

import Link from "next/link";
import { useOfficeBoardQuery } from "@/hooks";
import { formatDate } from "@/lib/format";

const tiles = [
  { key: "squad", href: "/office/squad", label: "Squad", hint: "names on the sheet" },
  { key: "finishedPegs", href: "/office/pegs", label: "Sold", hint: "clock already zero" },
  { key: "openTills", href: "/office/tills", label: "Tills", hint: "desks still open" },
  { key: "disputedTills", href: "/office/tills", label: "Disputes", hint: "waiting on the whistle" },
] as const;

export function OfficeBoard() {
  const board = useOfficeBoardQuery(true);

  if (board.isError) {
    return <p className="office-err">{board.error instanceof Error ? board.error.message : "Board is dark."}</p>;
  }

  const data = board.data;

  return (
    <div className="office-board">
      <Link href="/office/pegs" className="office-hero-count reveal">
        <span className="office-hero-label">Live lots</span>
        <span className="office-hero-num">{data?.livePegs ?? "—"}</span>
        <span className="office-hero-hint">Scratch a peg if the shirt should never have hung.</span>
      </Link>

      <div className="office-tiles">
        {tiles.map((tile, index) => (
          <Link
            key={tile.key}
            href={tile.href}
            className="office-tile reveal"
            style={{ animationDelay: `${0.12 + index * 0.08}s` }}
          >
            <span className="office-tile-no">{String(index + 1).padStart(2, "0")}</span>
            <span className="office-tile-num">{data ? data[tile.key] : "—"}</span>
            <span className="office-tile-label">{tile.label}</span>
            <span className="office-tile-hint">{tile.hint}</span>
          </Link>
        ))}
      </div>

      <section className="office-carbon reveal delay-3">
        <div className="office-carbon-head">
          <h2>Clip</h2>
          <p>Carbon copy of every scratch and whistle.</p>
        </div>
        {!data?.clip.length ? (
          <p className="office-empty">No marks yet. The clip stays blank until you act.</p>
        ) : (
          <ol className="office-clip-list">
            {data.clip.map((mark) => (
              <li key={mark.id}>
                <span className="office-stamp" data-verb={mark.verb}>
                  {mark.verb}
                </span>
                <span>
                  <strong>{mark.subject}</strong>
                  <em>
                    {mark.steward} · {formatDate(mark.at)}
                  </em>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
