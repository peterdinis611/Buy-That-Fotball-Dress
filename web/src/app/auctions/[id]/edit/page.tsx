import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditGate } from "@/features/sell";
import { getAuction } from "@/lib/api";
import { noIndex } from "@/lib/seo";

type EditParams = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Edit listing",
  ...noIndex,
};

export default async function EditAuctionPage({ params }: EditParams) {
  const { id } = await params;
  const auction = await getAuction(id);
  if (!auction) notFound();

  return (
    <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 py-12 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-16">
      <div className="md:sticky md:top-8">
        <p className="reveal font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-[var(--led)]">
          Edit listing
        </p>
        <h1 className="reveal delay-1 mt-2 text-6xl leading-[0.86] text-[var(--ink)] md:text-8xl">
          Change the board.
        </h1>
        <p className="reveal delay-2 mt-4 max-w-sm text-lg text-[var(--ink)]/75">
          Update the shirt, starting price, or clock while the lot is still live.
        </p>
      </div>
      <EditGate auction={auction} />
    </div>
  );
}
