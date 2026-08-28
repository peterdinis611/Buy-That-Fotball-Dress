import Link from "next/link";
import { MatchClock } from "@/components/match-clock";

const links = [
  { href: "/auctions", label: "Squad" },
  { href: "/search", label: "Replay" },
  { href: "/sell", label: "Sub on" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20">
      <div className="led-flicker flex items-center justify-between gap-4 bg-black px-5 py-1.5 font-[family-name:var(--font-teko)] text-lg tracking-[0.18em] text-[var(--line)] md:px-8">
        <span>90+1</span>
        <span className="hidden sm:inline">LIVE FROM THE TUNNEL</span>
        <MatchClock />
      </div>

      <div className="border-b-4 border-[var(--chalk)] bg-[color-mix(in_oklab,var(--pitch)_88%,black)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full border-2 border-[var(--chalk)] font-[family-name:var(--font-teko)] text-2xl text-[var(--chalk)]">
              KV
            </span>
            <span>
              <span className="block font-[family-name:var(--font-teko)] text-4xl leading-none tracking-wide text-[var(--chalk)] md:text-5xl">
                KIT VAULT
              </span>
              <span className="font-[family-name:var(--font-teko)] text-sm tracking-[0.28em] text-[var(--line)]">
                MATCH-WORN · HOME & AWAY
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--chalk)]/80 uppercase hover:text-[var(--line)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/sell"
            className="inline-flex bg-[var(--card-yellow)] px-3 py-2 font-[family-name:var(--font-teko)] text-lg tracking-[0.12em] text-black uppercase"
          >
            Sub on
          </Link>
        </div>
      </div>

      <nav className="flex gap-5 overflow-x-auto border-b border-[var(--border)] bg-black/40 px-5 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 font-[family-name:var(--font-teko)] text-lg tracking-[0.14em] text-[var(--chalk)] uppercase"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
