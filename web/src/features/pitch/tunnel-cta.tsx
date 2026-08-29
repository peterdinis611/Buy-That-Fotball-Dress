import Link from "next/link";
import type { CSSProperties } from "react";
import { JerseyBack } from "./jersey-back";

export function TunnelCta() {
  return (
    <section id="list-a-shirt" className="tunnel-cta view-in relative overflow-hidden border-b-4 border-[var(--ink)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 tunnel-hatch md:w-14" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 tunnel-hatch md:w-14" aria-hidden />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:px-24 md:py-24">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.22em] text-[var(--bib)]">
            Got a shirt at home?
          </p>
          <h2 className="mt-2 max-w-[14ch] text-6xl leading-[0.86] text-[var(--tape)] md:text-8xl">
            Hang it on the rail. Let people bid.
          </h2>
          <p className="mt-5 max-w-md text-lg text-[var(--tape)]/75">
            Set a starting price and an end time. Buyers bid up from there. Match-worn only.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/sell" className="banner-cta text-2xl">
              Sell a shirt
            </Link>
            <Link
              href="/auctions"
              className="nav-line font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--tape)] uppercase"
            >
              Browse live lots
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[220px] md:block">
          <JerseyBack
            number="07"
            color="red"
            className="peg-sway absolute right-8 top-0 h-52 w-40"
            style={{ "--hang": "-12deg" } as CSSProperties}
          />
          <JerseyBack
            number="10"
            color="blue"
            className="peg-sway absolute right-28 top-10 h-56 w-44"
            style={{ "--hang": "6deg", animationDuration: "5.2s" } as CSSProperties}
          />
          <JerseyBack
            number="09"
            color="yellow"
            className="peg-sway absolute right-0 top-16 h-48 w-36"
            style={{ "--hang": "-3deg", animationDuration: "3.8s" } as CSSProperties}
          />
        </div>
      </div>
    </section>
  );
}
