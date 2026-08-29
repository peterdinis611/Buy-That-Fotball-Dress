import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { LotTicket } from "@/features/auctions";
import { JerseyBack } from "@/features/pitch";
import { JsonLd } from "@/components/seo";
import { getAuction, getBids } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { auctionDescription, auctionJsonLd, auctionTitle } from "@/lib/seo";

type AuctionParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: AuctionParams): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuction(id);

  if (!auction) {
    return {
      title: "Shirt not found",
      robots: { index: false, follow: true },
    };
  }

  const title = auctionTitle(auction);
  const description = auctionDescription(auction);
  const path = `/auctions/${auction.id}`;
  const image = auction.item.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AuctionDetailPage({ params }: AuctionParams) {
  const { id } = await params;
  const [auction, bids] = await Promise.all([getAuction(id), getBids(id)]);
  if (!auction) notFound();

  const { item } = auction;
  const number = item.playerNumber?.toString().padStart(2, "0") ?? "00";

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={auctionJsonLd(auction)} />
      <div className="pointer-events-none ghost-num absolute left-[-4%] top-4 font-[family-name:var(--font-display)] text-[40vw] leading-none text-[color-mix(in_oklab,var(--ink)_8%,transparent)] select-none">
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
            <JerseyBack
              number={number}
              color={item.color}
              className="peg-sway h-40 w-32"
              style={{ "--hang": "-5deg" } as CSSProperties}
            />
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

        <LotTicket auction={auction} bids={bids} />
      </div>
    </div>
  );
}
