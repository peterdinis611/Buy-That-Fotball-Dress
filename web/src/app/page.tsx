import { HomeView } from "@/components/pitch/home-view";
import { getAuctions } from "@/lib/api";

export default async function HomePage() {
  const auctions = await getAuctions();
  return <HomeView auctions={auctions} />;
}
