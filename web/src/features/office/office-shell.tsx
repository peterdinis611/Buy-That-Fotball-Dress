"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const doors = [
  { href: "/office", label: "Board", no: "01" },
  { href: "/office/squad", label: "Squad", no: "02" },
  { href: "/office/pegs", label: "Pegs", no: "03" },
  { href: "/office/tills", label: "Tills", no: "04" },
];

export function OfficeShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="office-tunnel">
      <aside className="office-arm" aria-hidden="true">
        <span>Official</span>
        <span>Steward</span>
        <span>Kit Vault</span>
      </aside>

      <div className="office-clip">
        <header className="office-head">
          <div>
            <p className="office-kicker">Match office</p>
            <h1>Tunnel.</h1>
            <p className="office-sub">
              {name} · whistle, scratch, keep the sheet honest.
            </p>
          </div>
          <nav className="office-doors" aria-label="Office">
            {doors.map((door) => {
              const on = door.href === "/office" ? path === "/office" : path.startsWith(door.href);
              return (
                <Link key={door.href} href={door.href} data-on={on} className="office-door">
                  <span className="office-door-no">{door.no}</span>
                  <span>{door.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
