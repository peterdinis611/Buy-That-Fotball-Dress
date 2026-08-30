"use client";

import { useState } from "react";
import { fromAuction, type AuthUser } from "@/lib/types";
import { usePlayerSheetQuery } from "@/hooks";
import { LockerRail, type HookKind } from "./locker-hook";

type RackId = HookKind;

function squadNumber(name: string) {
  let n = 0;
  for (const char of name) n = (n + char.charCodeAt(0) * 7) % 99;
  return String(n + 1).padStart(2, "0");
}

export function DressingRoom({ user }: { user: AuthUser }) {
  const sheet = usePlayerSheetQuery(true);
  const number = squadNumber(user.username);
  const listed = (sheet.data?.listed ?? []).map(fromAuction);
  const chasing = (sheet.data?.chasing ?? []).map(fromAuction);
  const won = (sheet.data?.won ?? []).map(fromAuction);
  const watching = (sheet.data?.watching ?? []).map(fromAuction);

  const racks: {
    id: RackId;
    door: string;
    title: string;
    empty: string;
    listings: ReturnType<typeof fromAuction>[];
    emptyHref?: string;
    emptyCta?: string;
  }[] = [
    {
      id: "watching",
      door: "Watch",
      title: "Watching",
      empty: "Watch a live lot and it hangs in this locker.",
      listings: watching,
    },
    {
      id: "listed",
      door: "Sale",
      title: "For sale",
      empty: "This locker is empty. Hang a shirt from Sell.",
      listings: listed,
      emptyHref: "/sell",
      emptyCta: "Sell a shirt",
    },
    {
      id: "chasing",
      door: "Bids",
      title: "Your bids",
      empty: "You have not bid on a live lot yet.",
      listings: chasing,
    },
    {
      id: "won",
      door: "Won",
      title: "Won",
      empty: "No wins yet. Stay highest until the clock hits zero.",
      listings: won,
    },
  ];

  const preferred =
    chasing.length ? "chasing" : watching.length ? "watching" : listed.length ? "listed" : won.length ? "won" : "chasing";
  const [picked, setPicked] = useState<RackId | null>(null);
  const open = picked ?? preferred;
  const active = racks.find((rack) => rack.id === open) ?? racks[0];

  return (
    <div className="vault">
      <div className="vault-shell">
        <header className="vault-head">
          <div className="fluor-tube" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-[var(--bib)]">
                Dressing room
              </p>
              <h1 className="mt-1 text-6xl leading-[0.82] text-[#f3f1ec] md:text-7xl">Locker {number}</h1>
            </div>
            <div className="locker-plate px-5 py-3">
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-[#3a2a10] uppercase">
                Player
              </p>
              <p className="font-[family-name:var(--font-display)] text-4xl leading-none text-[#1a1208]">
                {user.displayName || user.username}
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[#5a4018]">
                {user.username} · #{number}
              </p>
            </div>
          </div>
        </header>

        {sheet.isError ? (
          <p className="mt-6 border border-[var(--cardinal)] px-4 py-3 text-[var(--cardinal)]">
            {sheet.error instanceof Error ? sheet.error.message : "Could not load your lots."}
          </p>
        ) : null}

        <div className="vault-bank">
          <nav className="vault-doors" aria-label="Lockers">
            {racks.map((rack, index) => (
              <button
                key={rack.id}
                type="button"
                data-open={open === rack.id}
                onClick={() => setPicked(rack.id)}
                className="vault-door"
              >
                <span className="vault-door-no">{String(index + 1).padStart(2, "0")}</span>
                <span className="vault-door-name">{rack.door}</span>
                <span className="vault-door-count">{rack.listings.length}</span>
              </button>
            ))}
          </nav>

          <section className="vault-cavity" aria-live="polite">
            <div className="vault-cavity-bar">
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-[var(--bib)] uppercase">
                Open · {active.title}
              </p>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[#b4b4aa] uppercase">
                {active.listings.length} kit{active.listings.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="peg-rail" />
            <LockerRail
              listings={active.listings}
              kind={active.id}
              username={user.username}
              empty={active.empty}
              emptyHref={active.emptyHref}
              emptyCta={active.emptyCta}
              loading={sheet.isLoading}
            />
            <div className="vault-bench" />
          </section>
        </div>
      </div>
    </div>
  );
}
