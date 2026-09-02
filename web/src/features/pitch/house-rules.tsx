const rules = [
  {
    card: "Match-worn",
    tone: "ink" as const,
    title: "Only shirts that saw grass",
    copy: "Match-worn kits only. Replicas, fan versions and unused training tops stay off the rail.",
  },
  {
    card: "Starting price",
    tone: "yellow" as const,
    title: "The seller sets a floor",
    copy: "Bid must beat the current price. If nobody reaches the starting price, the lot ends unsold.",
  },
  {
    card: "Own shirt",
    tone: "red" as const,
    title: "You cannot bid on your listing",
    copy: "Sign in to bid. The person who listed the shirt cannot bid on it.",
  },
  {
    card: "Desk cut",
    tone: "yellow" as const,
    title: "Hammer plus desk",
    copy: "The bid board is hammer. Buyer pays hammer plus 10% desk. Money sits at the house until the shirt is received — then the seller takes hammer. House keeps desk.",
  },
];

const toneClass = {
  ink: "bg-[var(--ink)] text-[var(--tape)]",
  yellow: "bg-[var(--bib)] text-[var(--stud)]",
  red: "bg-[var(--led)] text-white",
};

export function HouseRules() {
  return (
    <section className="border-b-4 border-[var(--ink)]">
      <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 py-14 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-20">
        <div className="view-in md:sticky md:top-8">
          <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
            House rules
          </p>
          <h2 className="mt-1 max-w-[12ch] text-5xl leading-[0.9] text-[var(--ink)] md:text-7xl">
            Same rules as a real auction, written for a shirt.
          </h2>
          <p className="mt-5 max-w-sm text-lg text-[var(--ink)]/75">
            No mystery fees on the board. The price you beat is hammer. Desk (10%) is shown at the till.
          </p>
        </div>

        <ul className="stagger-in grid gap-4">
          {rules.map((rule, index) => (
            <li
              key={rule.card}
              className={`ref-slip flex gap-4 bg-[var(--tape)] p-5 md:p-6 ${index === 1 ? "md:ml-8" : ""} ${index === 2 ? "md:-ml-4" : ""}`}
            >
              <span
                className={`grid h-28 w-[4.5rem] shrink-0 place-items-center px-1 text-center font-[family-name:var(--font-display)] text-lg leading-[1.05] tracking-[0.06em] uppercase shadow-[4px_6px_0_#161616] ${toneClass[rule.tone]}`}
              >
                {rule.card}
              </span>
              <div>
                <h3 className="text-3xl leading-none text-[var(--ink)]">{rule.title}</h3>
                <p className="mt-2 text-[var(--ink)]/75">{rule.copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
