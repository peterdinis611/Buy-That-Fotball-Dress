"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth";
import { SellForm } from "./sell-form";

export function SellGate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <p className="text-[var(--chalk)]/60">Checking the team sheet…</p>;
  }

  if (!user) {
    return (
      <div className="ticket p-8">
        <p className="font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          Still in the tunnel
        </p>
        <h2 className="mt-2 text-5xl text-[var(--chalk)]">Kick off first.</h2>
        <p className="mt-3 max-w-sm text-[var(--chalk)]/75">Only a named player can sub a shirt on.</p>
        <Link href="/login?next=/sell" className="banner-cta mt-8 text-2xl">
          <span>Kick off</span>
        </Link>
      </div>
    );
  }

  return <SellForm />;
}
