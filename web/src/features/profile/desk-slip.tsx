"use client";

import Link from "next/link";
import { useState } from "react";
import { FormBanner } from "@/components/forms/field";
import {
  useAuth,
  useDisputeSettlement,
  usePaySettlement,
  useReceiveSettlement,
  useSettlementQuery,
  useShipSettlement,
} from "@/hooks";
import { formatMoney } from "@/lib/format";
import type { Auction, Settlement } from "@/lib/types";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function DeskSlip({ auction }: { auction: Auction }) {
  const { user } = useAuth();
  const desk = useSettlementQuery(auction.id, Boolean(auction.winner));
  const row = desk.data;
  if (!row) return null;

  const buyer = sameName(user?.username, row.buyer);
  const seller = sameName(user?.username, row.seller);
  if (!buyer && !seller) return null;

  return <DeskActions row={row} buyer={buyer} seller={seller} />;
}

function DeskActions({ row, buyer, seller }: { row: Settlement; buyer: boolean; seller: boolean }) {
  const pay = usePaySettlement(row.auctionId);
  const ship = useShipSettlement(row.auctionId);
  const receive = useReceiveSettlement(row.auctionId);
  const dispute = useDisputeSettlement(row.auctionId);
  const [banner, setBanner] = useState<string | null>(null);
  const pending = pay.isPending || ship.isPending || receive.isPending || dispute.isPending;

  async function run(action: () => Promise<unknown>) {
    setBanner(null);
    try {
      await action();
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "That did not go through.");
    }
  }

  return (
    <div className="bid-slip mt-8 px-5 py-6">
      <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.12em] uppercase">Desk · {row.status}</p>
      <p className="bid-slip-hint mt-2 text-sm">
        {formatMoney(row.amount)} · {row.buyer} buys from {row.seller}
        {row.tracking ? ` · ${row.tracking}` : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {buyer && row.status === "Opened" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => pay.mutateAsync(row.id))}
            className="inline-flex h-11 items-center bg-[var(--stud)] px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--bib)] uppercase"
          >
            {pay.isPending ? "Paying…" : "Pay"}
          </button>
        ) : null}
        {seller && row.status === "Paid" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => ship.mutateAsync(row.id))}
            className="inline-flex h-11 items-center bg-[var(--stud)] px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--bib)] uppercase"
          >
            {ship.isPending ? "Shipping…" : "Mark shipped"}
          </button>
        ) : null}
        {buyer && row.status === "Shipped" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => receive.mutateAsync(row.id))}
            className="inline-flex h-11 items-center bg-[var(--stud)] px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--bib)] uppercase"
          >
            {receive.isPending ? "Confirming…" : "Shirt received"}
          </button>
        ) : null}
        {(buyer || seller) && row.status !== "Received" && row.status !== "Disputed" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => dispute.mutateAsync(row.id))}
            className="inline-flex h-11 items-center border border-[var(--stud)]/30 px-5 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase"
          >
            Dispute
          </button>
        ) : null}
      </div>
      <FormBanner message={banner} />
    </div>
  );
}

export function DeskRail({ rows, loading }: { rows: Settlement[]; loading: boolean }) {
  if (loading) {
    return (
      <p className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/50">
        Loading desk…
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-12 text-center text-[var(--ink)]/60">
        No desks yet. When a lot sells, it opens here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--ink)]/15 border border-[var(--ink)]/15 bg-[var(--tape)]">
      {rows.map((row) => (
        <li key={row.id}>
          <Link href={`/auctions/${row.auctionId}`} className="flex items-baseline justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--led)] uppercase">
                {row.status}
              </p>
              <p className="text-2xl text-[var(--ink)]">{row.playerName}</p>
              <p className="text-sm text-[var(--ink)]/60">
                {row.club} · {row.buyer} / {row.seller}
              </p>
            </div>
            <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              {formatMoney(row.amount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
