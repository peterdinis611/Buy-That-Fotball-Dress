import Link from "next/link";
import { MatchClock } from "./match-clock";
import { AuthNav } from "@/components/auth";

const links = [
  { href: "/auctions", label: "Squad" },
  { href: "/search", label: "Replay" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20">
      <div className="led-flicker flex items-center justify-between gap-4 bg-black px-5 py-1.5 font-[family-name:var(--font-teko)] text-lg tracking-[0.22em] text-[var(--line)] md:px-8">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--cardinal)]" />
          90+1
        </span>
        <span className="hidden tracking-[0.38em] sm:inline">LIVE FROM THE TUNNEL</span>
        <MatchClock />
      </div>

      <div className="border-b-4 border-[var(--chalk)] bg-[color-mix(in_oklab,var(--pitch)_70%,black)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid size-12 place-items-center rounded-full bg-[var(--cardinal)] shadow-[0_0_0_3px_var(--chalk),0_0_0_6px_#04180d]">
              <span className="font-[family-name:var(--font-teko)] text-3xl leading-none text-[var(--chalk)]">
                KV
              </span>
            </span>
            <span>
              <span className="block font-[family-name:var(--font-teko)] text-4xl leading-none tracking-wide text-[var(--chalk)] md:text-5xl">
                KIT VAULT
              </span>
              <span className="font-[family-name:var(--font-teko)] text-sm tracking-[0.32em] text-[var(--line)]">
                MATCH-WORN · HOME & AWAY
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-line font-[family-name:var(--font-teko)] text-2xl tracking-[0.16em] text-[var(--chalk)]/85 uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <AuthNav />
        </div>
      </div>

      <nav className="flex gap-6 overflow-x-auto border-b border-[var(--border)] bg-black/50 px-5 py-2 md:hidden">
        {[...links, { href: "/login", label: "Kick off" }, { href: "/sell", label: "Sub on" }].map((link) => (
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
