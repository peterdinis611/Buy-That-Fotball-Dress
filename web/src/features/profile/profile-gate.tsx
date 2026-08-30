"use client";

import Link from "next/link";
import { useAuth } from "@/hooks";
import { DressingRoom } from "./dressing-room";

export function ProfileGate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <p className="px-5 py-12 text-[var(--ink)]/60">Opening your locker…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8">
        <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.16em] text-[var(--led)]">
          Dressing room
        </p>
        <h1 className="mt-2 text-6xl text-[var(--ink)]">Sign in to open your locker.</h1>
        <p className="mt-4 max-w-sm text-lg text-[var(--ink)]/75">
          Shirts you listed, bids you placed, and lots you won hang in here.
        </p>
        <Link href="/login?next=/profile" className="banner-cta mt-8 text-2xl">
          Sign in
        </Link>
      </div>
    );
  }

  return <DressingRoom user={user} />;
}
