"use client";

import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { BoardLetter } from "@/lib/types";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { SlipSkeleton } from "@/components/ui/skeleton";
import { useReadAllLetters, useReadLetter } from "@/hooks";

function kindLabel(kind: string) {
  if (kind === "outbid") return "Outbid";
  if (kind === "won") return "You won";
  if (kind === "paid") return "Ship it";
  if (kind === "shipped") return "On the way";
  if (kind === "tape") return "Tape match";
  return "Board";
}

function hrefFrom(body: string) {
  const match = body.match(/\/auctions\/[0-9a-f-]{36}/i);
  return match?.[0] ?? "/profile";
}

function unread(letter: BoardLetter) {
  return !letter.readAt;
}

export function LetterRail({ rows, loading }: { rows: BoardLetter[]; loading: boolean }) {
  const mark = useReadLetter();
  const markAll = useReadAllLetters();
  const unreadCount = rows.filter(unread).length;

  if (loading) {
    return <SlipSkeleton label="Loading letters" />;
  }

  if (rows.length === 0) {
    return (
      <Empty className="min-h-56 border border-dashed border-[var(--ink)]/18 bg-[var(--tape)]">
        <EmptyHeader>
          <EmptyTitle className="text-2xl text-[var(--ink)]">No letters on this hook</EmptyTitle>
          <EmptyDescription className="text-[var(--ink)]/60">
            Outbid, won, ship it, and tape match land here. Mailpit is still the SMTP tray.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      {unreadCount > 0 ? (
        <button
          type="button"
          disabled={markAll.isPending}
          onClick={() => markAll.mutate()}
          className="mb-3 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--bib)] uppercase underline-offset-4 hover:underline disabled:opacity-60"
        >
          {markAll.isPending ? "Marking…" : "Mark read"}
        </button>
      ) : null}
      <ul className="divide-y divide-[var(--ink)]/15 border border-[var(--ink)]/15 bg-[var(--tape)]">
        {rows.map((letter) => {
          const fresh = unread(letter);
          return (
            <li key={letter.id} data-unread={fresh ? "true" : "false"}>
              <Link
                href={hrefFrom(letter.body)}
                onClick={() => {
                  if (fresh) mark.mutate(letter.id);
                }}
                className="block px-5 py-4"
              >
                <p
                  className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] uppercase"
                  style={{ color: fresh ? "var(--led)" : "var(--bib)" }}
                >
                  {kindLabel(letter.kind)}
                  {fresh ? " · Unread" : ""}
                </p>
                <p className="text-2xl text-[var(--ink)]">{letter.subject}</p>
                <p className="mt-1 text-sm text-[var(--ink)]/65">{letter.body.split("\n")[0]}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-sm tracking-[0.1em] text-[var(--ink)]/45 uppercase">
                  {formatDate(letter.createdAt)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
