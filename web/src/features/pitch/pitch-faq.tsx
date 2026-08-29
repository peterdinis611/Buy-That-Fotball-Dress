const questions = [
  {
    q: "What does Live mean?",
    a: "The auction is open. You can bid until the clock on the board hits zero.",
  },
  {
    q: "How much do I have to bid?",
    a: "At least one euro above the current bid. If nobody has bid yet, start from the starting price.",
  },
  {
    q: "What if nobody reaches the starting price?",
    a: "The lot ends unsold. The shirt stays with the seller.",
  },
  {
    q: "Who wins?",
    a: "Whoever is still the highest bidder when time runs out. You will see that lot under Won on your profile.",
  },
  {
    q: "Can I sell a replica?",
    a: "No. List match-worn shirts only. The board is for kits that played.",
  },
  {
    q: "Do I need an account?",
    a: "Yes, to bid or to list a shirt. Browsing live lots is open to everyone.",
  },
];

export function PitchFaq() {
  return (
    <section id="faq" className="view-in border-b-4 border-[var(--ink)] bg-[var(--tape)]">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-[var(--led)]">
          Questions
        </p>
        <h2 className="mt-1 max-w-[16ch] text-5xl leading-[0.9] text-[var(--ink)] md:text-6xl">
          Before you raise a paddle.
        </h2>

        <div className="mt-10 divide-y-2 divide-[var(--ink)] border-y-2 border-[var(--ink)]">
          {questions.map((item) => (
            <details key={item.q} className="locker-faq group">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] uppercase md:text-3xl">
                <span>{item.q}</span>
                <span className="shrink-0 text-[var(--led)] transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="max-w-2xl text-lg text-[var(--ink)]/75">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
