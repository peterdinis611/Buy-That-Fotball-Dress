"use client";

import Link from "next/link";
import { useAuth } from "@/hooks";
import { OfficeShell } from "./office-shell";

export function OfficeGate({ children }: { children: React.ReactNode }) {
  const { user, steward, ready } = useAuth();

  if (!ready) {
    return <p className="office-wait">Opening the tunnel…</p>;
  }

  if (!user) {
    return (
      <div className="office-shut">
        <p className="office-kicker">Match office</p>
        <h1>Officials only.</h1>
        <p>The tunnel stays shut unless you are on the steward sheet.</p>
        <Link href="/login?next=/office" className="banner-cta mt-8 text-2xl">
          Sign in
        </Link>
      </div>
    );
  }

  if (!steward) {
    return (
      <div className="office-shut">
        <p className="office-kicker">Match office</p>
        <h1>Wrong door.</h1>
        <p>
          {user.displayName || user.username}, this corridor is for the match steward. Your locker is on the other side.
        </p>
        <Link href="/profile" className="banner-cta mt-8 text-2xl">
          Open your locker
        </Link>
      </div>
    );
  }

  return <OfficeShell name={user.displayName || user.username}>{children}</OfficeShell>;
}
