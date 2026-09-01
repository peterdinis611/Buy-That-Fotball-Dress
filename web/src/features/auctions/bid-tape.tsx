"use client";

import { useBidsQuery, useAuth } from "@/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import type { Bid } from "@/lib/types";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">Highest first. In holds the lot. Out is beaten.</p>

      {data.length === 0 ? (
        <Empty className="mt-5 min-h-32 border border-dashed border-white/15">
          <EmptyHeader>
            <EmptyTitle className="text-[var(--chalk)]">No bids yet</EmptyTitle>
            <EmptyDescription className="text-[var(--muted-foreground)]">Open it.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea className="mt-4 h-80">
          <ol>
            {data.map((bid, index) => {
              const mine = sameName(user?.username, bid.bidder);
              const leading = index === 0;
              return (
                <li
                  key={bid.id}
                  className={`book-row ${mine ? "text-[var(--bib)]" : "text-[var(--chalk)]"}`}
                >
                  <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.14em] text-[var(--muted-foreground)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-[family-name:var(--font-display)] text-xl leading-none tracking-[0.04em] uppercase">
                      {mine ? "You" : bid.bidder}
                    </p>
                    <p className="mt-1 text-[11px] tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                      {formatDate(bid.createdAt)}
                      {bid.snag ? " · snag" : ""}
                      {bid.maxAmount && bid.maxAmount > bid.amount ? ` · to ${formatMoney(bid.maxAmount)}` : ""}
                    </p>
                  </div>
                  <span className="book-mark" data-kind={leading ? "in" : "out"}>
                    {leading ? "In" : "Out"}
                  </span>
                  <span className={`led-num shrink-0 text-2xl ${leading ? "bid-punch" : ""}`}>
                    {formatMoney(bid.amount)}
                  </span>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      )}
    </div>
  );
}
