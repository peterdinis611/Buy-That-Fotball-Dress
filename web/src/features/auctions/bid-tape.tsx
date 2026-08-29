"use client";

import { useBidsQuery, useAuth } from "@/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import type { Bid } from "@/lib/types";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function BidTape({ auctionId, initial }: { auctionId: string; initial?: Bid[] }) {
  const { data = initial ?? [] } = useBidsQuery(auctionId, initial);
  const { user } = useAuth();

  return (
    <div className="mt-8 border-t border-dashed border-white/15 pt-6">
      <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-[var(--bib)] uppercase">
        The book
      </p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">Highest first. This is every bid on the lot.</p>

      {data.length === 0 ? (
        <p className="mt-5 border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
          No bids yet. Open it.
        </p>
      ) : (
        <ol className="mt-4 max-h-72 overflow-y-auto">
          {data.map((bid, index) => {
            const mine = sameName(user?.username, bid.bidder);
            return (
              <li
                key={bid.id}
                className={`flex items-baseline justify-between gap-3 border-b border-white/10 py-3 ${mine ? "text-[var(--bib)]" : "text-[var(--chalk)]"}`}
              >
                <span className="w-8 shrink-0 font-[family-name:var(--font-display)] text-sm tracking-[0.14em] text-[var(--muted-foreground)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-display)] text-xl leading-none tracking-[0.04em] uppercase">
                    {mine ? "You" : bid.bidder}
                  </p>
                  <p className="mt-1 text-[11px] tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                    {formatDate(bid.createdAt)}
                  </p>
                </div>
                <span className={`led-num shrink-0 text-2xl ${index === 0 ? "bid-punch" : ""}`}>
                  {formatMoney(bid.amount)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
