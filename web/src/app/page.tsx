import { HomeView } from "@/components/pitch/home-view";
import { JsonLd } from "@/components/seo";
import { getAuctions } from "@/lib/api";
import { itemListJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const auctions = await getAuctions();

  return (
    <>
      <JsonLd data={itemListJsonLd(auctions)} />
      <HomeView auctions={auctions} />
    </>
  );
}
