"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Countdown } from "@/features/auctions";
import { JerseyBack, kitColors } from "./jersey-back";
import { WornStamp } from "./worn-stamp";
import { pushBoardToast } from "./board-toast";
import { formatMatchDay, formatMoney } from "@/lib/format";
import { fromAuction, type Auction, type KitListing } from "@/lib/types";
import { useAuth, useHangLotMutation, usePlayerSheetQuery, useSwipeCard, type SwipeDir } from "@/hooks";

const PASSED_KEY = "kit-vault-swipe-passed";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function clubWord(club: string) {
  return club.split(/\s+/)[0] ?? club;
}

function orderedPassed(lots: Auction[], passed: Set<string>) {
  const byId = new Map(lots.map((lot) => [lot.id, lot]));
  return [...passed]
    .map((id) => byId.get(id))
    .filter((lot): lot is Auction => Boolean(lot));
}

export function FeaturedHero({ lots }: { lots: Auction[] }) {
  const { user } = useAuth();
  const sheet = usePlayerSheetQuery(Boolean(user));
  const hang = useHangLotMutation();
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PASSED_KEY);
      if (raw) setPassed(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(PASSED_KEY, JSON.stringify([...passed]));
  }, [passed, hydrated]);

  const remaining = useMemo(
    () => lots.filter((lot) => !passed.has(lot.id)),
    [lots, passed],
  );
  const current = remaining[0];
  const peek = remaining.slice(1, 3);
  const listing = current ? fromAuction(current) : null;
  const watchingIds = useMemo(
    () => new Set((sheet.data?.watching ?? []).map((row) => row.id)),
    [sheet.data],
  );

  const currentRef = useRef(current);
  currentRef.current = current;
  const watchingRef = useRef(watchingIds);
  watchingRef.current = watchingIds;
  const userRef = useRef(user);
  userRef.current = user;

  const onCommit = useCallback(
    (dir: SwipeDir) => {
      const lot = currentRef.current;
      if (!lot) return;
      if (dir === "right") {
        const signedIn = userRef.current;
        if (!signedIn) {
          pushBoardToast({
            id: `watch-login-${lot.id}`,
            eyebrow: "Sign in",
            title: lot.item.playerName,
            detail: "Sign in to hang this shirt on your peg.",
            href: `/login?next=/auctions/${lot.id}`,
          });
        } else if (sameName(signedIn.username, lot.seller)) {
          pushBoardToast({
            id: `own-${lot.id}`,
            eyebrow: "Your listing",
            title: lot.item.playerName,
            detail: "That shirt is already on your peg.",
            href: `/auctions/${lot.id}`,
          });
        } else if (watchingRef.current.has(lot.id)) {
          pushBoardToast({
            id: `watching-${lot.id}`,
            eyebrow: "On your peg",
            title: lot.item.playerName,
            detail: "Already watching this shirt.",
            href: `/auctions/${lot.id}`,
          });
        } else {
          hang.mutate(lot, {
            onSuccess: () =>
              pushBoardToast({
                id: `watch-${lot.id}`,
                eyebrow: "Watching",
                title: lot.item.playerName,
                detail: `${lot.item.club} · hung on your peg`,
                href: `/auctions/${lot.id}`,
              }),
            onError: () =>
              pushBoardToast({
                id: `watch-err-${lot.id}`,
                eyebrow: "Missed",
                title: lot.item.playerName,
                detail: "Could not hang this shirt. Open the lot and try again.",
                href: `/auctions/${lot.id}`,
              }),
          });
        }
      }
      setPassed((prev) => new Set(prev).add(lot.id));
    },
    [hang],
  );

  const swipe = useSwipeCard({
    cardId: current?.id,
    enabled: Boolean(current),
    onCommit,
  });

  function onRailKey(event: KeyboardEvent<HTMLElement>) {
    if (!current) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      swipe.fling("left");
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      swipe.fling("right");
    }
  }

  function dealAgain() {
    setPassed(new Set());
    sessionStorage.removeItem(PASSED_KEY);
  }

  if (!current || !listing) {
    const gone = orderedPassed(lots, passed);
    return (
      <RailDone
        lots={gone.length > 0 ? gone : lots}
        onDeal={dealAgain}
        onPutBack={(id) => {
          setPassed((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }}
      />
    );
  }

  const number = listing.playerNumber?.toString().padStart(2, "0") ?? "00";
  const bid = listing.currentHighBid ?? listing.reservePrice;
  const live = listing.status === "Live";
  const position = lots.length - remaining.length + 1;

  return (
    <section
      className="lot-rail relative overflow-hidden border-b-4 border-[var(--ink)]"
      tabIndex={0}
      onKeyDown={onRailKey}
      aria-label="Live lots. Arrow left passes. Arrow right watches."
    >
      <div className="pointer-events-none ghost-num absolute -right-4 top-0 font-[family-name:var(--font-display)] text-[34vw] leading-none text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none">
        {number}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-5 py-12 lg:grid-cols-[1fr_minmax(15rem,18rem)_minmax(16rem,22rem)] lg:gap-6 md:px-8 md:py-16">
        <div>
          <p className="reveal font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-[var(--led)]">
            Live now
          </p>
          <h1
            key={listing.id}
            className="reveal delay-1 mt-2 max-w-[14ch] text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl"
          >
            {listing.playerName}
          </h1>
          <p className="reveal delay-2 mt-4 max-w-md text-lg text-[var(--ink)]/80">
            {listing.club} {listing.season} {listing.kitType.toLowerCase()} shirt, size {listing.size}.
            {listing.match && listing.opponent && listing.matchDate
              ? ` Worn vs ${listing.opponent} · ${formatMatchDay(listing.matchDate)}.`
              : " Match-worn."}
            {live
              ? " Bid higher than the current price before the clock hits zero."
              : " This lot is no longer taking bids."}
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] text-[var(--ink)]/55 uppercase">
            Shirt {position} of {lots.length} · flick the card
          </p>

          <div className="reveal delay-3 relative mt-8 hidden min-h-[280px] items-end justify-start lg:flex">
            <span className="relative z-10">
              <JerseyBack
                number={number}
                color={listing.color}
                className="peg-sway h-64 w-52 md:h-72 md:w-56"
                style={{ "--hang": "-6deg" } as CSSProperties}
              />
              <WornStamp row={listing} className="worn-stamp-lot" />
            </span>
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrl}
                alt={`${listing.club} ${listing.playerName} shirt`}
                className="absolute right-0 top-0 hidden h-64 w-48 rotate-3 border-4 border-[var(--ink)] object-cover xl:block"
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="lot-deck" aria-live="polite">
            {peek
              .slice()
              .reverse()
              .map((lot, i) => (
                <PeekCard
                  key={lot.id}
                  listing={fromAuction(lot)}
                  layer={peek.length - 1 - i}
                />
              ))}
            <article
              className={`lot-card ${swipe.exit === "left" ? "lot-card-exit-left" : ""} ${swipe.exit === "right" ? "lot-card-exit-right" : ""} ${swipe.dragging ? "lot-card-dragging" : ""}`}
              style={{ zIndex: 5, ...swipe.style }}
              {...swipe.bind}
              aria-grabbed={swipe.dragging}
              aria-label={`${listing.playerName}, ${listing.club} ${listing.playerNumber ?? ""}. Drag right to watch, left to pass.`}
            >
              <ShirtFace listing={listing} />
              <span className="lot-stamp lot-stamp-watch" style={{ opacity: swipe.watchHint }}>
                Watch
              </span>
              <span className="lot-stamp lot-stamp-pass" style={{ opacity: swipe.passHint }}>
                Pass
              </span>
            </article>
          </div>

          <p className="lot-hint mt-4 text-center font-[family-name:var(--font-display)] text-lg tracking-[0.16em] uppercase">
            <span className="text-[var(--led)]">← Pass</span>
            <span className="mx-3 text-[var(--ink)]/35">·</span>
            <span className="text-[var(--bib)]">Watch →</span>
          </p>
          <div className="mt-3 flex w-full max-w-[18rem] gap-2">
            <button type="button" className="lot-pass-btn" onClick={() => swipe.fling("left")}>
              Pass
            </button>
            <button type="button" className="lot-watch-btn" onClick={() => swipe.fling("right")}>
              Watch
            </button>
          </div>
        </div>

        <aside className="sub-board board-slam overflow-hidden">
          <div className="sub-board-bib px-5 py-2 text-center text-lg">Live lot</div>
          <div className="p-6 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="live-dot inline-flex items-center gap-2 bg-[var(--led)] px-2 py-0.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
                {live ? "Live" : listing.status === "Finished" ? "Ended" : "Unsold"}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">{listing.club}</span>
            </div>
            <p className="text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Current bid</p>
            <p key={`${listing.id}-${bid}`} className="led-num bid-punch mt-1 text-6xl leading-none md:text-7xl">
              {formatMoney(bid)}
            </p>
            <p className="mt-6 text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Time left</p>
            <Countdown key={listing.id} endsAt={listing.auctionEnd} injury={listing.injury} className="led-num mt-1 block text-5xl" />
            <Link href={`/auctions/${listing.id}`} className="banner-cta mt-8 w-full justify-center text-2xl">
              Bid on this shirt
            </Link>
            <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">
              Starting price {formatMoney(listing.reservePrice)}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function RailDone({
  lots,
  onDeal,
  onPutBack,
}: {
  lots: Auction[];
  onDeal: () => void;
  onPutBack: (id: string) => void;
}) {
  const last = lots[lots.length - 1];
  const listing = last ? fromAuction(last) : null;
  const bid = listing ? listing.currentHighBid ?? listing.reservePrice : 0;
  const mid = (lots.length - 1) / 2;

  return (
    <section className="rail-done relative border-b-4 border-[var(--ink)]">
      <div className="pointer-events-none ghost-num absolute -right-4 top-0 font-[family-name:var(--font-display)] text-[34vw] leading-none text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none">
        {lots.length.toString().padStart(2, "0")}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-5 py-12 lg:grid-cols-[1fr_minmax(16rem,1.1fr)_minmax(16rem,22rem)] md:px-8 md:py-16">
        <div>
          <p className="reveal font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-[var(--led)]">
            End of the rail
          </p>
          <h1 className="reveal delay-1 mt-2 max-w-[14ch] text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">
            You waved them all off.
          </h1>
          <p className="reveal delay-2 mt-4 max-w-md text-lg text-[var(--ink)]/80">
            {lots.length} {lots.length === 1 ? "shirt is" : "shirts are"} still taking bids. Tap a kit to put it back
            on the stack, or bid the last one you passed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={onDeal} className="banner-cta text-2xl">
              Deal them again
            </button>
            <Link href="/auctions" className="banner-cta text-2xl">
              All lots
            </Link>
          </div>
        </div>

        {lots.length > 0 ? (
          <div className="rail-fan" aria-label="Shirts you passed">
            {lots.map((lot, index) => (
              <button
                key={lot.id}
                type="button"
                className="rail-fan-card"
                style={
                  {
                    "--tilt": (index - mid) * 7,
                    "--z": index + 1,
                  } as CSSProperties
                }
                onClick={() => onPutBack(lot.id)}
                title={`Put ${lot.item.playerName} back on the stack`}
              >
                <ShirtFace listing={fromAuction(lot)} />
              </button>
            ))}
          </div>
        ) : null}

        {listing ? (
          <aside className="sub-board board-slam overflow-hidden">
            <div className="sub-board-bib px-5 py-2 text-center text-lg">Last passed</div>
            <div className="p-6 md:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="live-dot inline-flex items-center gap-2 bg-[var(--led)] px-2 py-0.5 font-[family-name:var(--font-display)] text-lg tracking-wide text-white uppercase">
                  Live
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">{listing.club}</span>
              </div>
              <p className="text-4xl leading-none text-[var(--chalk)]">{listing.playerName}</p>
              <p className="mt-5 text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Current bid</p>
              <p className="led-num bid-punch mt-1 text-6xl leading-none">{formatMoney(bid)}</p>
              <p className="mt-6 text-sm tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Time left</p>
              <Countdown endsAt={listing.auctionEnd} injury={listing.injury} className="led-num mt-1 block text-5xl" />
              <Link href={`/auctions/${listing.id}`} className="banner-cta mt-8 w-full justify-center text-2xl">
                Bid on this shirt
              </Link>
              <button type="button" className="rail-putback mt-3 w-full" onClick={() => onPutBack(listing.id)}>
                Put it back on the stack
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      {lots.length > 0 ? (
        <div className="relative mx-auto max-w-[1400px] px-5 pb-12 md:px-8">
          <p className="mb-3 font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
            Still live · tap to restack
          </p>
          <ul className="rail-back-list">
            {lots.map((lot) => {
              const row = fromAuction(lot);
              const price = row.currentHighBid ?? row.reservePrice;
              return (
                <li key={lot.id}>
                  <div className="rail-back-row">
                    <JerseyBack
                      number={row.playerNumber?.toString().padStart(2, "0") ?? "00"}
                      color={row.color}
                      className="h-14 w-12 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-[family-name:var(--font-display)] text-2xl leading-none text-[var(--ink)]">
                        {row.playerName}
                      </span>
                      <span className="mt-1 block truncate text-sm text-[var(--ink)]/60">{row.club}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-[family-name:var(--font-display)] text-2xl leading-none text-[var(--ink)]">
                        {formatMoney(price)}
                      </span>
                      <Countdown endsAt={row.auctionEnd} injury={row.injury} className="mt-1 block text-sm text-[var(--led)]" />
                    </span>
                    <button type="button" className="rail-back-btn" onClick={() => onPutBack(lot.id)}>
                      Put back
                    </button>
                    <Link href={`/auctions/${lot.id}`} className="rail-back-btn rail-back-btn-ink">
                      Bid
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function PeekCard({ listing, layer }: { listing: KitListing; layer: number }) {
  const tilt = layer % 2 === 0 ? 7 : -8;
  return (
    <div
      className="lot-card lot-card-peek"
      style={{
        transform: `scale(${0.94 - layer * 0.06}) rotate(${tilt}deg) translate(${(layer + 1) * 8}px, ${(layer + 1) * 12}px)`,
        zIndex: 3 - layer,
      }}
      aria-hidden
    >
      <ShirtFace listing={listing} muted />
    </div>
  );
}

function ShirtFace({ listing, muted = false }: { listing: KitListing; muted?: boolean }) {
  const kit = kitColors(listing.color);
  const number = listing.playerNumber?.toString() ?? "0";

  return (
    <div
      className="lot-card-face"
      style={{
        background: kit.fill,
        color: kit.number,
        opacity: muted ? 0.72 : 1,
      }}
    >
      {listing.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={listing.imageUrl} alt="" className="lot-card-photo" />
      ) : null}
      <span className="lot-card-stripe" style={{ background: kit.stripe }} />
      <p className="lot-card-club">{clubWord(listing.club)}</p>
      <p className="lot-card-number">{number}</p>
      <p className="lot-card-player">{listing.playerName}</p>
      <WornStamp row={listing} compact className="worn-stamp-card" />
    </div>
  );
}
