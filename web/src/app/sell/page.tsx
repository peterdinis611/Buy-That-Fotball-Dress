import { SellForm } from "@/components/sell-form";

export default function SellPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 py-12 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-16">
      <div className="md:sticky md:top-8">
        <p className="reveal font-[family-name:var(--font-teko)] text-xl tracking-[0.28em] text-[var(--line)]">
          Fourth official
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl leading-[0.82] text-[var(--chalk)] md:text-8xl">
          Sub on a shirt.
        </h1>
        <p className="reveal delay-2 mt-4 max-w-sm text-lg text-[var(--chalk)]/75">
          If it never saw grass, it stays on the bench.
        </p>
        <p className="reveal delay-3 mt-10 font-[family-name:var(--font-teko)] text-[9rem] leading-none text-[var(--line)]/20">
          00
        </p>
      </div>
      <SellForm />
    </div>
  );
}
