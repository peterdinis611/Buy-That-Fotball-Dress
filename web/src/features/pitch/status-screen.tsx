import type { ReactNode } from "react";

export function StatusScreen({
  code,
  kicker,
  title,
  copy,
  actions,
}: {
  code: string;
  kicker: string;
  title: string;
  copy: string;
  actions: ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-[900px] overflow-hidden px-5 py-24 md:px-8">
      <p className="pointer-events-none ghost-num absolute -right-2 top-6 font-[family-name:var(--font-display)] text-[48vw] leading-none text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none md:text-[16rem]">
        {code}
      </p>
      <p className="reveal relative font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
        {kicker}
      </p>
      <h1 className="reveal delay-1 relative mt-2 max-w-[14ch] text-7xl leading-[0.86] text-[var(--ink)] md:text-8xl">{title}</h1>
      <p className="reveal delay-2 relative mt-6 max-w-md text-lg text-[var(--ink)]/75">{copy}</p>
      <div className="reveal delay-3 relative mt-10 flex flex-wrap items-center gap-5">{actions}</div>
    </div>
  );
}
