import type { Metadata } from "next";
import { SellGate } from "@/features/sell";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sell a shirt",
  description: "List a match-worn shirt. Set a starting price and an end time, then buyers bid up from there.",
  alternates: { canonical: "/sell" },
  ...noIndex,
};

export default function SellPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 py-12 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-16">
      <div className="md:sticky md:top-8">
        <p className="reveal font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
          List a shirt
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">
          List a match-worn shirt.
        </h1>
        <p className="reveal delay-2 mt-4 max-w-sm text-lg text-[var(--ink)]/75">
          Set a starting price and an end time. Buyers bid up from there. Match-worn only.
        </p>
      </div>
      <SellGate />
    </div>
  );
}
