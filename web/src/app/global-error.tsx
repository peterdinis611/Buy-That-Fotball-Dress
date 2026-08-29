"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full bg-[#cfd3ce] text-[#10203f]">
        <div className="relative mx-auto max-w-[900px] overflow-hidden px-5 py-24 md:px-8">
          <p className="pointer-events-none absolute -right-2 top-6 font-[family-name:var(--font-display)] text-[48vw] leading-none text-[#10203f]/10 select-none md:text-[16rem]">
            500
          </p>
          <p className="relative font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[#e31c23]">
            Off the board
          </p>
          <h1 className="relative mt-2 max-w-[14ch] text-7xl leading-[0.86] uppercase md:text-8xl">
            The board went dark.
          </h1>
          <p className="relative mt-6 max-w-md text-lg text-[#10203f]/75">
            KIT VAULT could not load. Try again, or come back to live lots.
          </p>
          <div className="relative mt-10 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex bg-[#f5c400] px-5 py-3 font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[#161616] uppercase"
            >
              Try again
            </button>
            <a
              href="/"
              className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[#10203f] uppercase"
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
