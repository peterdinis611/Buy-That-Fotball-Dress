import { SellForm } from "@/components/sell-form";

export default function SellPage() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-12 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-16">
      <div>
        <p className="reveal font-[family-name:var(--font-plex)] text-[10px] tracking-[0.34em] text-[var(--line)] uppercase">
          Kit man desk
        </p>
        <h1 className="reveal delay-1 mt-3 text-6xl leading-[0.86] text-[var(--flood)]">Hang it in the vault.</h1>
        <p className="reveal delay-2 mt-5 max-w-sm italic text-[var(--flood)]/70">
          Fill the peg card. If it never saw a pitch, it does not belong here.
        </p>
      </div>
      <SellForm />
    </div>
  );
}
