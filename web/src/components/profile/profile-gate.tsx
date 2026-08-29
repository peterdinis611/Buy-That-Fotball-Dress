"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth";
import { DressingRoom } from "./dressing-room";

export function ProfileGate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <p className="px-5 py-12 text-[var(--ink)]/60">Loading your lots…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8">
        <div className="ticket max-w-lg p-8">
          <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.16em] text-[var(--bib)]">
            Sign in required
          </p>
          <h2 className="mt-2 text-5xl text-[var(--chalk)]">Sign in to see your lots.</h2>
          <p className="mt-3 max-w-sm text-[var(--chalk)]/75">
            Your profile shows shirts you listed, bids you placed, and lots you won.
          </p>
          <Link href="/login?next=/profile" className="banner-cta mt-8 text-2xl">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return <DressingRoom user={user} />;
}
