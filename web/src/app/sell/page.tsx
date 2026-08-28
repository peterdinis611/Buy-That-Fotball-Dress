import { SellForm } from "@/components/sell-form";

export default function SellPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-12 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-16">
      <div>
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.22em] text-[var(--line)]">
          Fourth official
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl leading-[0.86] text-[var(--chalk)]">Sub on a shirt.</h1>
        <p className="reveal delay-2 mt-4 max-w-sm text-[var(--chalk)]/75">
          If it never saw grass, it stays on the bench.
        </p>
      </div>
      <SellForm />
    </div>
  );
}
