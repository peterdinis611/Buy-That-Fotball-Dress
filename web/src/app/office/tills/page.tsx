import type { Metadata } from "next";
import { OfficeGate, TillsSheet } from "@/features/office";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tills",
  description: "Whistle a disputed desk back open.",
  ...noIndex,
};

export default function OfficeTillsPage() {
  return (
    <OfficeGate>
      <TillsSheet />
    </OfficeGate>
  );
}
