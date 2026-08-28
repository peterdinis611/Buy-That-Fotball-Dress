const hoarding = [
  "NO REPLICAS",
  "MATCH-WORN ONLY",
  "HOME & AWAY",
  "IF IT NEVER LEFT THE TUNNEL IT DOES NOT PLAY",
  "FULL TIME",
  "KIT VAULT",
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-0">
      <div className="hoarding py-2">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-teko)] text-2xl tracking-[0.18em]">
          {[...hoarding, ...hoarding].map((item, index) => (
            <span key={`${item}-${index}`}>· {item}</span>
          ))}
        </div>
      </div>
      <div className="border-t-4 border-[var(--chalk)] bg-black">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="max-w-lg text-sm text-[var(--chalk)]/75">
            No replicas. No training tops. If it never left the tunnel, it does not play.
          </p>
          <p className="font-[family-name:var(--font-teko)] text-2xl tracking-[0.22em] text-[var(--line)]">
            FULL TIME · KIT VAULT
          </p>
        </div>
      </div>
    </footer>
  );
}
