import Link from "next/link";
import { JerseyBack } from "./jersey-back";

const steps = [
  {
    n: "1",
    title: "Pick a live shirt",
    copy: "Only lots marked Live are open. The clock on the board is the time left to bid.",
    color: "red",
  },
  {
    n: "2",
    title: "Bid higher",
    copy: "Your bid must beat the current price. Sign in first. You cannot bid on a shirt you listed.",
    color: "white",
  },
  {
    n: "3",
    title: "Lead until zero",
    copy: "If you are still the highest bid when time runs out, the shirt is yours.",
    color: "yellow",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y-4 border-[var(--ink)] bg-[var(--tape)]">
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
          How an auction works
        </p>
        <h2 className="mt-1 max-w-[18ch] text-5xl leading-[0.9] text-[var(--ink)] md:text-6xl">
          Highest bid when the clock hits zero wins.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.n} className="relative bg-[var(--ground)] px-5 pb-6 pt-8">
              <JerseyBack number={step.n} color={step.color} className="absolute -top-7 right-4 h-16 w-14" />
              <h3 className="pr-16 text-3xl text-[var(--ink)]">{step.title}</h3>
              <p className="mt-3 text-[var(--ink)]/75">{step.copy}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--muted-foreground)]">
          Starting price is the seller’s minimum. If nobody reaches it, the shirt stays unsold.{" "}
          <Link href="/auctions" className="text-[var(--led)] underline-offset-4 hover:underline">
            See live lots
          </Link>
        </p>
      </div>
    </section>
  );
}
