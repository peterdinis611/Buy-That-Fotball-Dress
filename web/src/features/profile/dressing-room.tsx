"use client";

import { useState, type CSSProperties } from "react";
import { JerseyBack } from "@/features/pitch";
import { fromAuction, type AuthUser } from "@/lib/types";
import { useMySettlementsQuery, usePlayerSheetQuery, useSavedPegsQuery } from "@/hooks";
import { DeskRail } from "./desk-slip";
import { TapeRail } from "./tape-rail";
import { LockerRail, type HookKind } from "./locker-hook";
import { Alert, AlertDescription } from "@/components/ui/alert";

type RackId = HookKind | "desk" | "tape";

function squadNumber(name: string) {
  let n = 0;
  for (const char of name) n = (n + char.charCodeAt(0) * 7) % 99;
  return String(n + 1).padStart(2, "0");
}

export function DressingRoom({ user }: { user: AuthUser }) {
  const sheet = usePlayerSheetQuery(true);
  const desks = useMySettlementsQuery(true);
  const tape = useSavedPegsQuery(true);
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
    desks.data?.length ? "desk" : chasing.length ? "chasing" : watching.length ? "watching" : listed.length ? "listed" : won.length ? "won" : "chasing";
  const [picked, setPicked] = useState<RackId | null>(null);
  const open = picked ?? preferred;
  const active = open === "desk" ? null : (racks.find((rack) => rack.id === open) ?? racks[0]);

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
          <div className="reveal">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
              Dressing room
            </p>
            <h1 className="mt-2 text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">Your locker.</h1>
            <p className="mt-4 max-w-sm text-lg text-[var(--ink)]/75">
              Shirts on your peg, lots you listed, auctions you joined, and kits you won.
            </p>
          </div>

          <div className="locker-bay reveal delay-2 flex items-end gap-6">
            <JerseyBack
              number={number}
              color="red"
              className="peg-sway h-40 w-32 md:h-48 md:w-40"
              style={{ "--hang": "-6deg" } as CSSProperties}
            />
            <div className="locker-plate mb-3 min-w-[13rem] px-5 py-4">
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

        {sheet.isError ? (
          <Alert variant="destructive" className="mt-8 border-[var(--cardinal)] bg-transparent">
            <AlertDescription className="text-[var(--cardinal)]">
              {sheet.error instanceof Error ? sheet.error.message : "Could not load your lots."}
            </AlertDescription>
          </Alert>
        ) : null}

        <nav className="bay-strip reveal delay-3 mt-12" aria-label="Lockers">
            {racks.map((rack, index) => (
              <button
                key={rack.id}
                type="button"
                data-open={open === rack.id}
                onClick={() => setPicked(rack.id)}
                className="bay-tab"
              >
                <span className="bay-tab-no">{String(index + 1).padStart(2, "0")}</span>
                <span className="bay-tab-name">{rack.door}</span>
                <span className="bay-tab-count">{rack.listings.length}</span>
              </button>
            ))}
            <button
              type="button"
              data-open={open === "desk"}
              onClick={() => setPicked("desk")}
              className="bay-tab"
            >
              <span className="bay-tab-no">05</span>
              <span className="bay-tab-name">Desk</span>
              <span className="bay-tab-count">{desks.data?.length ?? 0}</span>
            </button>
            <button
              type="button"
              data-open={open === "tape"}
              onClick={() => setPicked("tape")}
              className="bay-tab"
            >
              <span className="bay-tab-no">06</span>
              <span className="bay-tab-name">Tape</span>
              <span className="bay-tab-count">{tape.data?.length ?? 0}</span>
            </button>
        </nav>

        <section className="mt-10" aria-live="polite">
          {open === "tape" ? (
            <>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-5xl leading-none text-[var(--ink)] md:text-6xl">Tape</h2>
                <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
                  {tape.data?.length ?? 0} hung
                </p>
              </div>
              <div className="peg-rail" />
              <TapeRail rows={tape.data ?? []} loading={tape.isLoading} />
            </>
          ) : open === "desk" || !active ? (
            <>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-5xl leading-none text-[var(--ink)] md:text-6xl">Desk</h2>
                <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
                  {desks.data?.length ?? 0} open
                </p>
              </div>
              <div className="peg-rail" />
              <DeskRail rows={desks.data ?? []} loading={desks.isLoading} />
            </>
          ) : (
            <>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="text-5xl leading-none text-[var(--ink)] md:text-6xl">{active.title}</h2>
                <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
                  {active.listings.length} kit{active.listings.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="peg-rail" />
              <LockerRail
                listings={active.listings}
                kind={active.id as HookKind}
                username={user.username}
                empty={active.empty}
                emptyHref={active.emptyHref}
                emptyCta={active.emptyCta}
                loading={sheet.isLoading}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
