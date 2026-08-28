export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-8 md:flex-row md:items-end md:justify-between md:px-8">
        <p className="max-w-md text-sm italic text-[var(--flood)]/70">
          No replicas. No training knockoffs. Only shirts that left the tunnel.
        </p>
        <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.3em] text-[var(--line)] uppercase">
          Floodlit kit archive · 90+1
        </p>
      </div>
    </footer>
  );
}
