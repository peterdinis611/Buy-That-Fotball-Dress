import type { Metadata } from "next";
import { OfficeGate, SquadSheet } from "@/features/office";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Squad sheet",
  description: "Names on the KIT VAULT sheet.",
  ...noIndex,
};

export default function OfficeSquadPage() {
  return (
    <OfficeGate>
      <SquadSheet />
    </OfficeGate>
  );
}
