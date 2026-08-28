import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-24 md:px-8">
      <p className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.34em] text-[var(--cardinal)] uppercase">
        Red card
      </p>
      <h1 className="mt-3 text-7xl text-[var(--flood)]">This peg is empty.</h1>
      <Link
        href="/auctions"
        className="mt-8 inline-block font-[family-name:var(--font-plex)] text-xs tracking-[0.24em] text-[var(--line)] uppercase"
      >
        Return to the board →
      </Link>
    </div>
  );
}
