import Link from "next/link";
import { MatchClock } from "./match-clock";
import { AuthNav, MobileAuthLinks } from "@/components/auth";

const links = [
  { href: "/auctions", label: "Live lots" },
  { href: "/search", label: "Find a shirt" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20">
      <div className="led-flicker flex items-center justify-between gap-4 bg-[var(--stud)] px-5 py-1.5 font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-[var(--bib)] md:px-8">
        <span className="flex items-center gap-2">
          <span className="live-dot size-2 rounded-full bg-[var(--led)]" />
          Live auctions
        </span>
        <span className="hidden tracking-[0.28em] sm:inline">MATCH-WORN SHIRTS</span>
        <MatchClock />
      </div>

      <div className="border-b-4 border-[var(--ink)] bg-[var(--tape)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid size-12 place-items-center bg-[var(--led)] text-[var(--tape)]">
              <span className="font-[family-name:var(--font-display)] text-3xl leading-none">KV</span>
            </span>
            <span>
              <span className="block font-[family-name:var(--font-display)] text-4xl leading-none tracking-wide text-[var(--ink)] md:text-5xl">
                KIT VAULT
              </span>
              <span className="text-xs tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
                Bid on shirts that saw grass
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-line font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--ink)] uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <AuthNav />
        </div>
      </div>

      <nav className="flex gap-6 overflow-x-auto border-b border-[var(--border)] bg-[var(--tape)] px-5 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--ink)] uppercase"
          >
            {link.label}
          </Link>
        ))}
        <MobileAuthLinks />
      </nav>
    </header>
  );
}
