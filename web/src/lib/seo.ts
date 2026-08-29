import type { Metadata } from "next";
import { getAuctions } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Auction } from "@/lib/types";

export const SITE_NAME = "KIT VAULT";
export const SITE_TAGLINE = "Bid on shirts that saw grass";
export const SITE_DESCRIPTION =
  "Live auctions for match-worn football jerseys. Highest bid when the clock hits zero wins.";

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const noIndex: Pick<Metadata, "robots"> = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export type PublicUrl = {
  path: string;
  lastModified?: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly";
  priority: number;
};

export async function listPublicUrls(): Promise<PublicUrl[]> {
  const auctions = await getAuctions();

  return [
    { path: "/", changeFrequency: "hourly", priority: 1, lastModified: new Date() },
    { path: "/auctions", changeFrequency: "hourly", priority: 0.9, lastModified: new Date() },
    { path: "/search", changeFrequency: "daily", priority: 0.8 },
    ...auctions.map((auction) => ({
      path: `/auctions/${auction.id}`,
      lastModified: new Date(auction.updatedAt || auction.createdAt),
      changeFrequency: auction.status === "Live" ? ("hourly" as const) : ("weekly" as const),
      priority: auction.status === "Live" ? 0.8 : 0.5,
    })),
  ];
}

export function auctionTitle(auction: Auction) {
  const { item } = auction;
  return `${item.playerName} ${item.club} ${item.season} shirt`;
}

export function auctionDescription(auction: Auction) {
  const { item } = auction;
  const price = formatMoney(auction.currentHighBid ?? auction.reservePrice);
  const state =
    auction.status === "Live"
      ? `Live auction. Current bid ${price}.`
      : auction.status === "Finished"
        ? `Auction ended. Sold for ${auction.soldAmount ? formatMoney(auction.soldAmount) : price}.`
        : `Auction ended unsold. Starting price ${formatMoney(auction.reservePrice)}.`;

  return `${item.kitType} ${item.club} shirt, size ${item.size}. ${state} Highest bid when the clock hits zero wins.`;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?playerName={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd(auctions: Auction[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Match-worn shirt auctions",
    itemListElement: auctions.slice(0, 20).map((auction, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/auctions/${auction.id}`),
      name: auctionTitle(auction),
    })),
  };
}

export function auctionJsonLd(auction: Auction) {
  const { item } = auction;
  const live = auction.status === "Live";
  const price = auction.currentHighBid ?? auction.reservePrice;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: auctionTitle(auction),
    description: auctionDescription(auction),
    image: item.imageUrl ? [item.imageUrl] : undefined,
    brand: { "@type": "Brand", name: item.club },
    sku: auction.id,
    url: absoluteUrl(`/auctions/${auction.id}`),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/auctions/${auction.id}`),
      priceCurrency: "EUR",
      price,
      availability: live ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      priceValidUntil: auction.auctionEnd,
    },
  };
}
