import Link from "next/link";
import { notFound } from "next/navigation";
import { LotTicket } from "@/components/auctions";
import { JerseyBack } from "@/components/pitch";
import { getAuction } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auction = await getAuction(id);
  if (!auction) notFound();

  const { item } = auction;
  const number = item.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-[-4%] top-4 font-[family-name:var(--font-display)] text-[40vw] leading-none text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none">
        {number}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
        <div className="reveal">
          <Link
            href="/auctions"
            className="nav-line font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--ink)] uppercase"
          >
            ← All lots
          </Link>
          <p className="mt-8 font-[family-name:var(--font-display)] text-xl tracking-[0.16em] text-[var(--led)] uppercase">
            {item.club} · {item.season}
          </p>
          <h1 className="mt-3 text-7xl leading-[0.86] text-[var(--ink)] md:text-8xl">{item.playerName}</h1>
          <p className="mt-6 max-w-md text-lg text-[var(--ink)]/75">
            {item.kitType} kit in {item.color}. {item.condition}. Listed by {auction.seller}.
          </p>

          <div className="mt-10 flex items-center gap-8">
            <JerseyBack number={number} color={item.color} className="h-40 w-32" />
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
              {[
                ["Number", number],
                ["Size", item.size],
                ["Competition", item.league ?? "—"],
                ["Listed", formatDate(auction.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 text-[var(--ink)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <LotTicket auction={auction} />
      </div>
    </div>
  );
}
