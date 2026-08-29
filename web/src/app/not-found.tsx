import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-24 md:px-8">
      <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
        Missing
      </p>
      <h1 className="mt-2 text-7xl leading-[0.86] text-[var(--ink)] md:text-8xl">That shirt is not here.</h1>
      <Link href="/auctions" className="banner-cta mt-10 text-2xl">
        Browse live lots
      </Link>
    </div>
  );
}
