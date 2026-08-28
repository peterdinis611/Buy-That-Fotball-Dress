import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-24 md:px-8">
      <p className="font-[family-name:var(--font-teko)] text-xl tracking-[0.2em] text-[var(--cardinal)]">
        Offside
      </p>
      <h1 className="mt-2 text-7xl text-[var(--chalk)]">Not on the pitch.</h1>
      <Link
        href="/auctions"
        className="mt-8 inline-block font-[family-name:var(--font-teko)] text-xl tracking-[0.16em] text-[var(--line)] uppercase"
      >
        Back to the squad →
      </Link>
    </div>
  );
}
