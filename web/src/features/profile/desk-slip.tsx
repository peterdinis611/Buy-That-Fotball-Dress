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
import type { Auction, DeskStatus, Settlement } from "@/lib/types";

function sameName(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function tillStamp(status: DeskStatus) {
  if (status === "Opened") return { paid: false, label: "Unpaid" };
  if (status === "Disputed") return { paid: false, label: "Disputed" };
  return { paid: true, label: status === "Paid" ? "Paid" : status };
}

export function DeskSlip({ auction }: { auction: Auction }) {
  const { user } = useAuth();
  const desk = useSettlementQuery(auction.id, Boolean(auction.winner));
  const row = desk.data;
  if (!row) return null;

  const buyer = sameName(user?.username, row.buyer);
  const seller = sameName(user?.username, row.seller);
  if (!buyer && !seller) return null;

  return <Till row={row} buyer={buyer} seller={seller} />;
}

function Till({ row, buyer, seller }: { row: Settlement; buyer: boolean; seller: boolean }) {
  const pay = usePaySettlement(row.auctionId);
  const ship = useShipSettlement(row.auctionId);
  const receive = useReceiveSettlement(row.auctionId);
  const dispute = useDisputeSettlement(row.auctionId);
  const [banner, setBanner] = useState<string | null>(null);
  const [tracking, setTracking] = useState(row.tracking ?? "");
  const [reason, setReason] = useState("");
  const [openDispute, setOpenDispute] = useState(false);
  const pending = pay.isPending || ship.isPending || receive.isPending || dispute.isPending;
  const stamp = tillStamp(row.status);
  const closed = row.status === "Received" || row.status === "Disputed";

  async function run(action: () => Promise<unknown>) {
    setBanner(null);
    try {
      await action();
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "That did not go through.");
    }
  }

  return (
    <div className="till mt-8">
      <div className="till-head">
        <p className="till-kicker">Desk</p>
        <p className="till-stamp led-num" data-paid={stamp.paid ? "true" : "false"}>
          {stamp.label}
        </p>
      </div>

      <p className="till-amount">{formatMoney(row.amount)}</p>
      <p className="till-meta">
        {row.buyer} buys from {row.seller}
        {row.paymentRef ? ` · ${row.paymentRef}` : ""}
        {row.tracking ? ` · ${row.tracking}` : ""}
      </p>

      {row.status === "Opened" && buyer ? (
        <p className="till-hint">Pay at this till. The seller ships after the slip is marked paid.</p>
      ) : null}
      {row.status === "Opened" && seller ? (
        <p className="till-hint">Waiting for {row.buyer} to pay.</p>
      ) : null}
      {row.status === "Paid" && seller ? (
        <p className="till-hint">Paid. Add a tracking number, then mark it shipped.</p>
      ) : null}
      {row.status === "Paid" && buyer ? (
        <p className="till-hint">Paid. Waiting for {row.seller} to ship.</p>
      ) : null}
      {row.status === "Shipped" && buyer ? (
        <p className="till-hint">On the way. Confirm when the shirt is in your hands.</p>
      ) : null}
      {row.status === "Shipped" && seller ? (
        <p className="till-hint">Shipped. Waiting for {row.buyer} to confirm.</p>
      ) : null}
      {row.status === "Received" ? <p className="till-hint">Closed. Shirt received.</p> : null}
      {row.status === "Disputed" ? (
        <p className="till-hint">
          Raised by {row.disputedBy}
          {row.disputeNote ? ` · ${row.disputeNote}` : ""}
        </p>
      ) : null}

      <div className="till-actions">
        {buyer && row.status === "Opened" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => pay.mutateAsync(row.id))}
            className="till-pay"
          >
            {pay.isPending ? "Paying…" : `Pay ${formatMoney(row.amount)}`}
          </button>
        ) : null}

        {seller && row.status === "Paid" ? (
          <form
            className="till-form"
            onSubmit={(event) => {
              event.preventDefault();
              void run(() => ship.mutateAsync({ id: row.id, tracking }));
            }}
          >
            <label className="till-field">
              <span>Tracking</span>
              <input
                value={tracking}
                onChange={(event) => setTracking(event.target.value)}
                placeholder="Carrier slip"
                autoComplete="off"
                minLength={4}
                maxLength={80}
                required
              />
            </label>
            <button type="submit" disabled={pending} className="till-pay">
              {ship.isPending ? "Shipping…" : "Mark shipped"}
            </button>
          </form>
        ) : null}

        {buyer && row.status === "Shipped" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => receive.mutateAsync(row.id))}
            className="till-pay"
          >
            {receive.isPending ? "Confirming…" : "Shirt received"}
          </button>
        ) : null}

        {!closed ? (
          openDispute ? (
            <form
              className="till-form"
              onSubmit={(event) => {
                event.preventDefault();
                void run(() => dispute.mutateAsync({ id: row.id, note: reason }));
              }}
            >
              <label className="till-field">
                <span>Why</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="What went wrong"
                  minLength={8}
                  maxLength={400}
                  rows={3}
                  required
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={pending} className="till-ghost">
                  {dispute.isPending ? "Raising…" : "Raise dispute"}
                </button>
                <button type="button" onClick={() => setOpenDispute(false)} className="till-quiet">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button type="button" disabled={pending} onClick={() => setOpenDispute(true)} className="till-quiet">
              Dispute
            </button>
          )
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
      {rows.map((row) => {
        const stamp = tillStamp(row.status);
        return (
          <li key={row.id}>
            <Link href={`/auctions/${row.auctionId}`} className="flex items-baseline justify-between gap-4 px-5 py-4">
              <div>
                <p
                  className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] uppercase"
                  style={{ color: stamp.paid ? "var(--bib)" : "var(--led)" }}
                >
                  {stamp.label}
                </p>
                <p className="text-2xl text-[var(--ink)]">{row.playerName}</p>
                <p className="text-sm text-[var(--ink)]/60">
                  {row.club} · {row.buyer} / {row.seller}
                  {row.paymentRef ? ` · ${row.paymentRef}` : ""}
                  {row.tracking ? ` · ${row.tracking}` : ""}
                </p>
              </div>
              <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                {formatMoney(row.amount)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
