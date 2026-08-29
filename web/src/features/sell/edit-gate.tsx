"use client";

import Link from "next/link";
import { useAuth } from "@/hooks";
import { isOpenLot, type Auction } from "@/lib/types";
import { SellForm } from "./sell-form";

export function EditGate({ auction }: { auction: Auction }) {
  const { user, ready } = useAuth();
  const own = Boolean(user && user.username.toLowerCase() === auction.seller.toLowerCase());
  const live = isOpenLot(auction);

  if (!ready) {
    return <p className="text-[var(--ink)]/60">Checking your account…</p>;
  }

  if (!user) {
    return (
      <div className="ticket board-slam p-8">
        <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.16em] text-[var(--bib)]">
          Sign in required
        </p>
        <h2 className="mt-2 text-5xl text-[var(--chalk)]">Sign in to edit this lot.</h2>
        <Link href={`/login?next=/auctions/${auction.id}/edit`} className="banner-cta mt-8 text-2xl">
          Sign in
        </Link>
      </div>
    );
  }

  if (!own) {
    return (
      <div className="ticket board-slam p-8">
        <h2 className="text-5xl text-[var(--chalk)]">This is not your listing.</h2>
        <Link href={`/auctions/${auction.id}`} className="banner-cta mt-8 text-2xl">
          Back to the lot
        </Link>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="ticket board-slam p-8">
        <h2 className="text-5xl text-[var(--chalk)]">This lot is closed.</h2>
        <p className="mt-3 max-w-sm text-[var(--chalk)]/75">Only live shirts can be edited.</p>
        <Link href={`/auctions/${auction.id}`} className="banner-cta mt-8 text-2xl">
          Back to the lot
        </Link>
      </div>
    );
  }

  return <SellForm auction={auction} />;
}
