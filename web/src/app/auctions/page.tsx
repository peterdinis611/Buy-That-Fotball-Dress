import type { Metadata } from "next";
import { SquadView } from "@/components/auctions/squad-view";
import { JsonLd } from "@/components/seo";
import { getAuctions } from "@/lib/api";
import { SITE_DESCRIPTION, itemListJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Live lots",
  description: `Every match-worn shirt on the board. ${SITE_DESCRIPTION}`,
  alternates: { canonical: "/auctions" },
  openGraph: {
    title: "Live lots",
    description: "Browse live and ended auctions for match-worn football jerseys.",
    url: "/auctions",
  },
};

export default async function AuctionsPage() {
  const auctions = await getAuctions();

  return (
    <>
      <JsonLd data={itemListJsonLd(auctions)} />
      <SquadView auctions={auctions} />
    </>
  );
}
