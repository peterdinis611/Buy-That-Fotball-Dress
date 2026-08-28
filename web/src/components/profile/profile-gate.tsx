"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth";
import { DressingRoom } from "./dressing-room";

export function ProfileGate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <p className="text-[var(--chalk)]/60">The kit man is unlocking the pegs…</p>;
  }

  if (!user) {
    return (
      <div className="ticket max-w-lg p-8">
        <p className="font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          Still in the tunnel
        </p>
        <h2 className="mt-2 text-5xl text-[var(--chalk)]">Kick off first.</h2>
        <p className="mt-3 max-w-sm text-[var(--chalk)]/75">
          The dressing room only opens for a named player.
        </p>
        <Link href="/login?next=/profile" className="banner-cta mt-8 text-2xl">
          <span>Kick off</span>
        </Link>
      </div>
    );
  }

  return <DressingRoom user={user} />;
}
