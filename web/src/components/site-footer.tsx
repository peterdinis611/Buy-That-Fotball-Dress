export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t-4 border-[var(--chalk)] bg-black">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="max-w-lg text-sm text-[var(--chalk)]/75">
          No replicas. No training tops. If it never left the tunnel, it does not play.
        </p>
        <p className="font-[family-name:var(--font-teko)] text-xl tracking-[0.2em] text-[var(--line)]">
          FULL TIME · KIT VAULT
        </p>
      </div>
    </footer>
  );
}
