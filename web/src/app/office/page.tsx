import type { Metadata } from "next";
import { OfficeBoard, OfficeGate } from "@/features/office";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Match office",
  description: "Steward tunnel — squad, pegs, tills.",
  ...noIndex,
};

export default function OfficePage() {
  return (
    <OfficeGate>
      <OfficeBoard />
    </OfficeGate>
  );
}
