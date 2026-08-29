"use client";

import Link from "next/link";
import { StatusScreen } from "@/features/pitch";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusScreen
      code="500"
      kicker="Off the board"
      title="The board went dark."
      copy="Something broke while loading this page. Try again, or go back to live lots."
      actions={
        <>
          <button type="button" onClick={reset} className="banner-cta text-2xl">
            Try again
          </button>
          <Link
            href="/auctions"
            className="nav-line font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--ink)] uppercase"
          >
            Live lots
          </Link>
        </>
      }
    />
  );
}
