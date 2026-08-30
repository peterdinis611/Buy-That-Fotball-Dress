import Link from "next/link";

const steps = [
  { n: "01", mark: "In", title: "Pick a live shirt", copy: "Only lots marked Live are open. The clock on the board is the time left to bid." },
  { n: "02", mark: "Bid", title: "Bid higher", copy: "Your bid must beat the current price. Sign in first. You cannot bid on a shirt you listed." },
  { n: "03", mark: "Win", title: "Lead until zero", copy: "If you are still the highest bid when time runs out, the shirt is yours." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y-4 border-[var(--ink)] bg-[var(--tape)]">
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <p className="view-in font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
          How an auction works
        </p>
        <h2 className="view-in mt-1 max-w-[18ch] text-5xl leading-[0.9] text-[var(--ink)] md:text-6xl">
          Highest bid when the clock hits zero wins.
        </h2>
        <ol className="stagger-in mt-8">
          {steps.map((step) => (
            <li key={step.n} className="sub-row">
              <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.14em] text-[var(--led)]">
                {step.n}
              </span>
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.16em] text-[var(--bib)] uppercase">
                  {step.mark}
                </p>
                <h3 className="mt-1 text-3xl text-[var(--ink)]">{step.title}</h3>
                <p className="mt-2 max-w-xl text-[var(--ink)]/75">{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
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
