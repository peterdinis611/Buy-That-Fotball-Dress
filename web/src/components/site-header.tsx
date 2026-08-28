import Link from "next/link";

const links = [
  { href: "/auctions", label: "The board" },
  { href: "/search", label: "Archive" },
  { href: "/sell", label: "Hang a shirt" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[color-mix(in_oklab,var(--line)_18%,var(--border))]">
      <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6 px-5 py-5 md:px-8">
        <Link href="/" className="group block">
          <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.42em] text-[var(--line)]">
            EST. NIGHT MATCH
          </p>
          <span className="mt-1 block font-[family-name:var(--font-shoulders)] text-4xl leading-none tracking-[-0.06em] text-[var(--flood)] md:text-5xl">
            KIT<span className="text-[var(--line)]">VAULT</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 pb-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-plex)] text-[11px] tracking-[0.28em] uppercase text-[var(--flood)]/70 transition-colors hover:text-[var(--line)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/sell"
          className="mb-0.5 inline-flex items-center border border-[var(--line)] bg-[var(--line)] px-3 py-2 font-[family-name:var(--font-plex)] text-[10px] tracking-[0.22em] text-[var(--pitch)] uppercase transition-transform hover:-rotate-1"
        >
          List a kit
        </Link>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-[var(--border)] px-5 py-3 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 font-[family-name:var(--font-plex)] text-[10px] tracking-[0.24em] text-[var(--flood)]/80 uppercase"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
