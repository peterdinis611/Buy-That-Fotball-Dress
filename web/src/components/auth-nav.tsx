"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function AuthNav() {
  const { user, ready, logout } = useAuth();

  if (!ready) {
    return <span className="hidden h-10 w-28 bg-black/40 md:inline-block" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--chalk)] uppercase md:inline nav-line"
        >
          Kick off
        </Link>
        <Link href="/sell" className="banner-cta text-2xl">
          <span>Sub on</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[16ch] truncate font-[family-name:var(--font-teko)] text-xl tracking-[0.12em] text-[var(--line)] md:inline">
        {user.displayName || user.username}
      </span>
      <button
        type="button"
        onClick={logout}
        className="hidden font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--chalk)]/70 uppercase hover:text-[var(--cardinal)] md:inline"
      >
        Full time
      </button>
      <Link href="/sell" className="banner-cta text-2xl">
        <span>Sub on</span>
      </Link>
    </div>
  );
}
