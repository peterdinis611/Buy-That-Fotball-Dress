"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";

export function AuthNav() {
  const { user, ready, logout } = useAuth();

  if (!ready) {
    return <span className="hidden h-10 w-28 bg-[var(--ground)] md:inline-block" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--ink)] uppercase md:inline nav-line"
        >
          Sign in
        </Link>
        <Link href="/sell" className="banner-cta text-2xl">
          Sell a shirt
        </Link>
      </div>
    );
  }

  const name = user.displayName || user.username;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="hidden max-w-[16ch] truncate font-[family-name:var(--font-display)] text-xl tracking-[0.06em] text-[var(--ink)] nav-line md:inline"
        title="Open your profile"
      >
        {name}
      </Link>
      <button
        type="button"
        onClick={logout}
        className="hidden font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--ink)]/60 uppercase hover:text-[var(--led)] md:inline"
      >
        Sign out
      </button>
      <Link href="/sell" className="banner-cta text-2xl">
        Sell a shirt
      </Link>
    </div>
  );
}

export function MobileAuthLinks() {
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--ink)] uppercase"
        >
          Sign in
        </Link>
        <Link
          href="/sell"
          className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--ink)] uppercase"
        >
          Sell
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/profile"
        className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--led)] uppercase"
      >
        Profile
      </Link>
      <Link
        href="/sell"
        className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--ink)] uppercase"
      >
        Sell
      </Link>
    </>
  );
}
