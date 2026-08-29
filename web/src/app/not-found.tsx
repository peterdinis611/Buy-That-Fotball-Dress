import type { Metadata } from "next";
import Link from "next/link";
import { StatusScreen } from "@/features/pitch";

export const metadata: Metadata = {
  title: "Shirt not found",
  description: "That shirt is not listed. Browse live lots instead.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      kicker="Missing"
      title="That shirt is not here."
      copy="This lot is gone, the link is wrong, or the shirt was never listed. Live auctions are still on the board."
      actions={
        <>
          <Link href="/auctions" className="banner-cta text-2xl">
            Browse live lots
          </Link>
          <Link
            href="/"
            className="nav-line font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--ink)] uppercase"
          >
            Back home
          </Link>
        </>
      }
    />
  );
}
