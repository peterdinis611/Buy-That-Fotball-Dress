"use client";

import { useState } from "react";
import Link from "next/link";
import { JerseyBack, PegWall } from "@/features/pitch";
import { fromAuction, type AuthUser, type KitListing } from "@/lib/types";
import { usePlayerSheetQuery } from "@/hooks";
import type { CSSProperties } from "react";

type RackId = "watching" | "listed" | "chasing" | "won";

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
  const racks: { id: RackId; title: string; kicker: string; empty: string; listings: KitListing[]; trophy?: boolean }[] = [
    {
      id: "watching",
      title: "Watching",
      kicker: "On your peg",
      empty: "Watch a live lot to hang it here before you bid.",
      listings: watching,
    },
    {
      id: "listed",
      title: "For sale",
      kicker: "You listed",
      empty: "You have not listed a shirt yet. Hang one from Sell a shirt.",
      listings: listed,
    },
    {
      id: "chasing",
      title: "Your bids",
      kicker: "You joined",
      empty: "You have not bid on a live lot yet.",
      listings: chasing,
    },
    {
      id: "won",
      title: "Won",
      kicker: "Yours now",
      empty: "No wins yet. Stay highest until time runs out.",
      listings: won,
      trophy: true,
    },
  ];

  const preferred =
    watching.length ? "watching" : listed.length ? "listed" : chasing.length ? "chasing" : won.length ? "won" : "watching";
  const [picked, setPicked] = useState<RackId | null>(null);
  const open = picked ?? preferred;
  const active = racks.find((rack) => rack.id === open) ?? racks[0];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none ghost-num absolute -left-6 top-0 font-[family-name:var(--font-display)] text-[42vw] leading-[0.72] text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none md:text-[22vw]">
        {number}
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="fluor-tube mb-8" />

        <div className="grid items-end gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <div className="reveal">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
              Dressing room
            </p>
            <h1 className="mt-2 text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">Your locker.</h1>
            <p className="mt-4 max-w-sm text-lg text-[var(--ink)]/75">
              Shirts on your peg, lots you listed, auctions you joined, and kits you won.
            </p>
            <Link href="/sell" className="banner-cta mt-8 text-2xl">
              Sell a shirt
            </Link>
          </div>

          <div className="locker-bay reveal delay-2 flex items-end gap-6 md:justify-end">
            <JerseyBack
              number={number}
              color="red"
              className="peg-sway h-44 w-36 md:h-52 md:w-40"
              style={{ "--hang": "-6deg" } as CSSProperties}
            />
            <div className="locker-plate mb-4 min-w-[14rem] px-5 py-4">
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
        </div>

        <div className="reveal delay-3 mt-12 grid grid-cols-2 gap-px bg-[var(--ink)] md:grid-cols-4">
          {racks.map((rack) => (
            <button
              key={rack.id}
              type="button"
              data-open={open === rack.id}
              onClick={() => setPicked(rack.id)}
              className="locker-door px-5 py-6"
            >
              <p className="locker-door-label text-lg">{rack.title}</p>
              <p className="locker-door-count mt-2 text-6xl">{rack.listings.length}</p>
              <p className="locker-door-kicker mt-2 text-sm">{rack.kicker}</p>
            </button>
          ))}
        </div>

        {sheet.isError ? (
          <p className="mt-8 border border-[var(--cardinal)] px-4 py-3 text-[var(--cardinal)]">
            {sheet.error instanceof Error ? sheet.error.message : "Could not load your lots."}
          </p>
        ) : null}

        <section className={`mt-14 ${active.trophy ? "trophy-rack" : ""}`}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-[var(--led)] uppercase">
                Open locker
              </p>
              <h2 className="text-5xl leading-none text-[var(--ink)] md:text-6xl">{active.title}</h2>
            </div>
            <p className="max-w-[18ch] text-right text-sm text-[var(--ink)]/55">{active.kicker}</p>
          </div>
          <div className="peg-rail" />
          {sheet.isLoading ? (
            <p className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/50">
              Loading lots…
            </p>
          ) : (
            <PegWall listings={active.listings} empty={active.empty} />
          )}
        </section>
      </div>
    </div>
  );
}
