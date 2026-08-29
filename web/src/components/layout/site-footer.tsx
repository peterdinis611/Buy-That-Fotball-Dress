const hoarding = [
  "HIGHEST BID WHEN THE CLOCK HITS ZERO WINS",
  "MATCH-WORN ONLY",
  "NO REPLICAS",
  "SIGN IN TO BID",
  "SELL A SHIRT FROM YOUR PEG",
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-0">
      <div className="hoarding py-2">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-display)] text-2xl tracking-[0.14em]">
          {[...hoarding, ...hoarding].map((item, index) => (
            <span key={`${item}-${index}`}>· {item}</span>
          ))}
        </div>
      </div>
      <div className="border-t-4 border-[var(--ink)] bg-[var(--tape)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="max-w-lg text-sm text-[var(--ink)]/80">
            Find a live shirt, bid higher than the current price, and keep the lead until time runs out.
          </p>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.14em] text-[var(--ink)]">
            KIT VAULT
          </p>
        </div>
      </div>
    </footer>
  );
}
