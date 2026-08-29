"use client";

import { JerseyBack, PegWall } from "@/features/pitch";
import { fromAuction, type AuthUser, type KitListing } from "@/lib/types";
import { usePlayerSheetQuery } from "@/hooks";
import type { CSSProperties } from "react";

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

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none ghost-num absolute -left-6 top-0 font-[family-name:var(--font-display)] text-[42vw] leading-[0.72] text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none md:text-[22vw]">
        {number}
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid items-end gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
              Your lots
            </p>
            <h1 className="mt-2 text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">Profile.</h1>
            <p className="mt-4 max-w-sm text-lg text-[var(--ink)]/75">
              Shirts you listed, lots you are watching, auctions you bid in, and shirts you won.
            </p>
          </div>

          <div className="locker-bay reveal delay-2 flex items-end gap-6 md:justify-end">
            <JerseyBack
              number={number}
              color="red"
              className="peg-sway h-44 w-36"
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

        <dl className="reveal delay-3 mt-12 grid grid-cols-2 gap-px bg-[var(--ink)]/15 md:grid-cols-4">
          <Stat label="Watching" value={watching.length} />
          <Stat label="For sale" value={listed.length} />
          <Stat label="Your bids" value={chasing.length} />
          <Stat label="Won" value={won.length} />
        </dl>

        {sheet.isError ? (
          <p className="mt-8 border border-[var(--cardinal)] px-4 py-3 text-[var(--cardinal)]">
            {sheet.error instanceof Error ? sheet.error.message : "Could not load your lots."}
          </p>
        ) : null}

        <Rack
          title="Watching"
          kicker="Lots on your peg"
          listings={watching}
          empty="Watch a live lot to hang it here before you bid."
          loading={sheet.isLoading}
        />
        <Rack
          title="For sale"
          kicker="Shirts you listed"
          listings={listed}
          empty="You have not listed a shirt yet. Hang one from Sell a shirt."
          loading={sheet.isLoading}
        />
        <Rack
          title="Your bids"
          kicker="Auctions you joined"
          listings={chasing}
          empty="You have not bid on a live lot yet."
          loading={sheet.isLoading}
        />
        <Rack
          title="Won"
          kicker="Yours after the clock hit zero"
          listings={won}
          empty="No wins yet. Stay highest until time runs out."
          loading={sheet.isLoading}
          trophy
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--tape)] px-5 py-6">
      <dt className="font-[family-name:var(--font-display)] text-lg tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-[family-name:var(--font-display)] text-6xl leading-none text-[var(--led)]">{value}</dd>
    </div>
  );
}

function Rack({
  title,
  kicker,
  listings,
  empty,
  loading,
  trophy = false,
}: {
  title: string;
  kicker: string;
  listings: KitListing[];
  empty: string;
  loading: boolean;
  trophy?: boolean;
}) {
  return (
    <section className={`mt-16 ${trophy ? "trophy-rack" : ""}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl leading-none text-[var(--ink)] md:text-6xl">{title}</h2>
        </div>
        <p className="max-w-[18ch] text-right text-sm text-[var(--ink)]/55">{kicker}</p>
      </div>
      {loading ? (
        <p className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/50">
          Loading lots…
        </p>
      ) : (
        <PegWall listings={listings} empty={empty} />
      )}
    </section>
  );
}
