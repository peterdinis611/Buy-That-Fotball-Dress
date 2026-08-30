import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LotTicket } from "@/features/auctions";
import { JsonLd } from "@/components/seo";
import { getAuction, getBids } from "@/lib/api";
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

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={auctionJsonLd(auction)} />
      <div className="relative mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <Link
          href="/auctions"
          className="nav-line font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-[var(--ink)] uppercase"
        >
          ← All lots
        </Link>
        <LotTicket auction={auction} bids={bids} />
      </div>
    </div>
  );
}
