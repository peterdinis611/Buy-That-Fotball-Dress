import Link from "next/link";

const steps = [
  {
    n: "01",
    mark: "In",
    title: "Pick a live shirt",
    copy: "Only lots marked Live are open. The clock on the board is the time left to bid.",
  },
  {
    n: "02",
    mark: "Bid",
    title: "Bid higher",
    copy: "Your bid must beat the current price. Sign in first. You cannot bid on a shirt you listed.",
  },
  {
    n: "03",
    mark: "Win",
    title: "Lead until zero",
    copy: "If you are still the highest bid when time runs out, the shirt is yours.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how-auction">
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-20">
        <header className="how-auction-mast view-in">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
              How an auction works
            </p>
            <h2 className="mt-1 max-w-[16ch] text-5xl leading-[0.88] text-[var(--ink)] md:text-7xl">
              Highest bid when the clock hits zero wins.
            </h2>
          </div>

          <div className="how-zero" aria-hidden>
            <p className="how-zero-label">Time left</p>
            <div className="led-clock">
              <span className="led-cell">
                <span className="led-cell-value led-flicker">00</span>
                <span className="led-cell-unit">m</span>
              </span>
              <span className="led-cell">
                <span className="led-cell-value led-flicker">00</span>
                <span className="led-cell-unit">s</span>
              </span>
            </div>
            <p className="how-zero-stamp">Clock hit zero</p>
          </div>
        </header>

        <ol className="how-paddles view-in">
          {steps.map((step) => (
            <li key={step.n} className="how-paddle-bay">
              <article className="how-paddle">
                <p className="how-paddle-bib">{step.mark}</p>
                <div className="how-paddle-face">
                  <p className="how-paddle-no led-num">{step.n}</p>
                  <h3 className="how-paddle-title">{step.title}</h3>
                  <p className="how-paddle-copy">{step.copy}</p>
                </div>
                <span className="how-paddle-grip" />
              </article>
            </li>
          ))}
        </ol>

        <p className="how-auction-note">
          Starting price is the seller’s minimum. If nobody reaches it, the shirt stays unsold.{" "}
          <Link href="/auctions" className="how-auction-link">
            See live lots
          </Link>
        </p>
      </div>
    </section>
  );
}
