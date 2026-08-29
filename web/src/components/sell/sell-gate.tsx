"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth";
import { SellForm } from "./sell-form";

export function SellGate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <p className="text-[var(--ink)]/60">Checking your account…</p>;
  }

  if (!user) {
    return (
      <div className="ticket p-8">
        <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.16em] text-[var(--bib)]">
          Sign in required
        </p>
        <h2 className="mt-2 text-5xl text-[var(--chalk)]">Sign in to list a shirt.</h2>
        <p className="mt-3 max-w-sm text-[var(--chalk)]/75">Only a signed-in seller can open an auction.</p>
        <Link href="/login?next=/sell" className="banner-cta mt-8 text-2xl">
          Sign in
        </Link>
      </div>
    );
  }

  return <SellForm />;
}
