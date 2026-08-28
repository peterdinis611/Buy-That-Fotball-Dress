"use client";

import { JerseyBack, PegWall } from "@/components/pitch";
import { fromAuction, type AuthUser, type KitListing } from "@/lib/types";
import { usePlayerSheetQuery } from "@/lib/query/hooks";

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

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-6 top-0 font-[family-name:var(--font-teko)] text-[42vw] leading-[0.72] text-[color-mix(in_oklab,var(--chalk)_8%,transparent)] select-none md:text-[22vw]">
        {number}
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid items-end gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal">
            <p className="font-[family-name:var(--font-teko)] text-xl tracking-[0.28em] text-[var(--line)]">
              Dressing room
            </p>
            <h1 className="mt-2 text-6xl leading-[0.82] text-[var(--chalk)] md:text-8xl">Your sheet.</h1>
            <p className="mt-4 max-w-sm text-lg text-[var(--chalk)]/75">
              Pegs, chases, and shirts you lifted. Nothing hangs here that did not see grass.
            </p>
          </div>

          <div className="locker-bay reveal delay-2 flex items-end gap-6 md:justify-end">
            <JerseyBack number={number} color="red" className="h-44 w-36 -rotate-6" />
            <div className="locker-plate mb-4 min-w-[14rem] px-5 py-4">
              <p className="font-[family-name:var(--font-teko)] text-sm tracking-[0.28em] text-[#3a2a10] uppercase">
                Squad name
              </p>
              <p className="font-[family-name:var(--font-teko)] text-4xl leading-none text-[#1a1208]">
                {user.displayName || user.username}
              </p>
              <p className="mt-1 font-[family-name:var(--font-teko)] text-lg tracking-[0.18em] text-[#5a4018]">
                {user.username} · #{number}
              </p>
            </div>
          </div>
        </div>

        <dl className="reveal delay-3 mt-12 grid grid-cols-3 gap-px bg-[var(--chalk)]/15">
          <Stat label="Hanging" value={listed.length} />
          <Stat label="Chasing" value={chasing.length} />
          <Stat label="Lifted" value={won.length} />
        </dl>

        {sheet.isError ? (
          <p className="mt-8 border border-[var(--cardinal)] px-4 py-3 text-[var(--cardinal)]">
            {sheet.error instanceof Error ? sheet.error.message : "The kit man lost the sheet."}
          </p>
        ) : null}

        <Rack
          index="01"
          title="Hanging"
          kicker="Shirts you listed"
          listings={listed}
          empty="Nothing on your peg. Sub a shirt on."
          loading={sheet.isLoading}
        />
        <Rack
          index="02"
          title="Chasing"
          kicker="Lots you have shot at"
          listings={chasing}
          empty="No chase on. Walk the squad and put a number on a shirt."
          loading={sheet.isLoading}
        />
        <Rack
          index="03"
          title="Lifted"
          kicker="Won after the whistle"
          listings={won}
          empty="The cabinet is empty. Keep chasing."
          loading={sheet.isLoading}
          trophy
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-black/45 px-5 py-6">
      <dt className="font-[family-name:var(--font-teko)] text-lg tracking-[0.22em] text-[var(--muted-foreground)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-[family-name:var(--font-teko)] text-6xl leading-none text-[var(--line)]">{value}</dd>
    </div>
  );
}

function Rack({
  index,
  title,
  kicker,
  listings,
  empty,
  loading,
  trophy = false,
}: {
  index: string;
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
          <p className="font-[family-name:var(--font-teko)] text-lg tracking-[0.28em] text-[var(--line)]">
            {index}
          </p>
          <h2 className="text-5xl leading-none text-[var(--chalk)] md:text-6xl">{title}</h2>
        </div>
        <p className="max-w-[18ch] text-right text-sm text-[var(--chalk)]/55">{kicker}</p>
      </div>
      {loading ? (
        <p className="border border-dashed border-[var(--chalk)]/18 px-5 py-12 text-center text-[var(--chalk)]/50">
          Unlocking the pegs…
        </p>
      ) : (
        <PegWall listings={listings} empty={empty} />
      )}
    </section>
  );
}
