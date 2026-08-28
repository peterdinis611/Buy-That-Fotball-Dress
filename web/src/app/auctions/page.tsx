import { SquadView } from "@/components/auctions/squad-view";
import { getAuctions } from "@/lib/api";

export default async function AuctionsPage() {
  const auctions = await getAuctions();
  return <SquadView auctions={auctions} />;
}
