import Link from "next/link";

const hoarding = [
  "HIGHEST BID WHEN THE CLOCK HITS ZERO WINS",
  "MATCH-WORN ONLY",
  "NO REPLICAS",
  "SIGN IN TO BID",
  "SELL A SHIRT FROM YOUR PEG",
];

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/auctions", label: "Live lots" },
      { href: "/search", label: "Find a shirt" },
      { href: "/sell", label: "Sell a shirt" },
    ],
  },
  {
    title: "How it works",
    links: [
      { href: "/#how-it-works", label: "The three steps" },
      { href: "/#faq", label: "Questions" },
      { href: "/#list-a-shirt", label: "List a shirt" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
      { href: "/profile", label: "Your locker" },
    ],
  },
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
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 md:grid-cols-[1.2fr_repeat(3,0.7fr)] md:px-8">
          <div>
            <p className="font-[family-name:var(--font-display)] text-5xl tracking-[0.08em] text-[var(--ink)]">
              KIT VAULT
            </p>
            <p className="mt-3 max-w-sm text-[var(--ink)]/75">
              Find a live shirt, bid higher than the current price, and keep the lead until time runs out.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.16em] text-[var(--led)] uppercase">
                {column.title}
              </p>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="nav-line font-[family-name:var(--font-display)] text-xl tracking-[0.06em] text-[var(--ink)] uppercase"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
