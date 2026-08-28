import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/countdown";
import { StatusPill } from "@/components/status-pill";
import { getAuction } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

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
      <div className="pointer-events-none absolute left-[-6%] top-10 font-[family-name:var(--font-shoulders)] text-[48vw] leading-none text-[color-mix(in_oklab,var(--flood)_6%,transparent)] select-none">
        {number}
      </div>

      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
        <div className="reveal">
          <Link
            href="/auctions"
            className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.3em] text-[var(--line)] uppercase"
          >
            ← Back to the board
          </Link>
          <p className="mt-8 font-[family-name:var(--font-plex)] text-[11px] tracking-[0.34em] text-[var(--line)] uppercase">
            {item.club} · {item.season}
          </p>
          <h1 className="mt-3 text-6xl leading-[0.86] text-[var(--flood)] md:text-8xl">{item.playerName}</h1>
          <p className="mt-6 max-w-md text-lg italic text-[var(--flood)]/70">
            {item.kitType} kit in {item.color}. {item.condition}. Pegged by {auction.seller}.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-[var(--border)] pt-8 text-sm">
            {[
              ["Number", number],
              ["Size", item.size],
              ["League", item.league ?? "—"],
              ["Listed", formatDate(auction.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.28em] text-[var(--muted-foreground)] uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-[var(--flood)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="reveal delay-2 relative border border-[var(--line)] bg-[var(--card)] p-6 md:-rotate-1 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <StatusPill status={auction.status} />
            <Countdown endsAt={auction.auctionEnd} className="text-sm" />
          </div>

          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="mb-6 aspect-[3/4] w-full object-cover" />
          ) : null}

          <div className="space-y-4 border-t border-dashed border-[var(--border)] pt-6">
            <TicketLine label="Reserve" value={formatMoney(auction.reservePrice)} />
            <TicketLine
              label="High paddle"
              value={auction.currentHighBid ? formatMoney(auction.currentHighBid) : "Quiet room"}
            />
            {auction.winner ? <TicketLine label="Winner" value={auction.winner} /> : null}
            {auction.soldAmount ? <TicketLine label="Hammer" value={formatMoney(auction.soldAmount)} /> : null}
            <TicketLine label="Closes" value={formatDate(auction.auctionEnd)} />
          </div>

          <p className="mt-8 font-[family-name:var(--font-plex)] text-[10px] leading-relaxed tracking-[0.14em] text-[var(--muted-foreground)] uppercase">
            Paddles arrive with the bid service. Tonight you can look, hang, and hunt.
          </p>
        </aside>
      </div>
    </div>
  );
}

function TicketLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-[family-name:var(--font-plex)] text-[10px] tracking-[0.24em] text-[var(--muted-foreground)] uppercase">
        {label}
      </span>
      <span className="text-right text-[var(--flood)]">{value}</span>
    </div>
  );
}
