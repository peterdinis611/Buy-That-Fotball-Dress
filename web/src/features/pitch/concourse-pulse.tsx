type ConcoursePulseProps = {
  live: number;
  listed: number;
};

export function ConcoursePulse({ live, listed }: ConcoursePulseProps) {
  const liveLabel = live === 1 ? "1 shirt taking bids" : `${live} shirts taking bids`;
  const listedLabel = listed === 1 ? "1 on the board" : `${listed} on the board`;

  return (
    <div className="border-b-4 border-[var(--ink)] bg-[var(--stud)]">
      <p className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2.5 font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--tape)] uppercase md:px-8 md:text-xl">
        <span className="live-dot size-2 shrink-0 rounded-full bg-[var(--led)]" />
        <span>{liveLabel}</span>
        <span className="text-[var(--bib)]" aria-hidden>
          ·
        </span>
        <span>{listedLabel}</span>
        <span className="text-[var(--bib)]" aria-hidden>
          ·
        </span>
        <span className="text-[var(--bib)]">Highest bid when the clock hits zero wins</span>
      </p>
    </div>
  );
}
