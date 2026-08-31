import type { Metadata } from "next";
import { OfficeGate, PegsSheet } from "@/features/office";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pegs",
  description: "Scratch a lot off the wall.",
  ...noIndex,
};

export default function OfficePegsPage() {
  return (
    <OfficeGate>
      <PegsSheet />
    </OfficeGate>
  );
}
