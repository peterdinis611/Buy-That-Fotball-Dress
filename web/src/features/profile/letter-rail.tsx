"use client";

import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { BoardLetter } from "@/lib/types";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { SlipSkeleton } from "@/components/ui/skeleton";

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

export function LetterRail({ rows, loading }: { rows: BoardLetter[]; loading: boolean }) {
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
    <ul className="divide-y divide-[var(--ink)]/15 border border-[var(--ink)]/15 bg-[var(--tape)]">
      {rows.map((letter) => (
        <li key={letter.id}>
          <Link href={hrefFrom(letter.body)} className="block px-5 py-4">
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--bib)] uppercase">
              {kindLabel(letter.kind)}
            </p>
            <p className="text-2xl text-[var(--ink)]">{letter.subject}</p>
            <p className="mt-1 text-sm text-[var(--ink)]/65">{letter.body.split("\n")[0]}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-sm tracking-[0.1em] text-[var(--ink)]/45 uppercase">
              {formatDate(letter.createdAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
