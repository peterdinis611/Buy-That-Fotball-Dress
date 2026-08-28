import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-24 md:px-8">
      <p className="font-[family-name:var(--font-teko)] text-xl tracking-[0.28em] text-[var(--cardinal)]">
        Offside
      </p>
      <h1 className="mt-2 text-7xl leading-[0.82] text-[var(--chalk)] md:text-8xl">Not on the pitch.</h1>
      <Link href="/auctions" className="banner-cta mt-10 text-2xl">
        <span>Back to the squad</span>
      </Link>
    </div>
  );
}
