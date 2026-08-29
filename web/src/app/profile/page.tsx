import type { Metadata } from "next";
import { ProfileGate } from "@/features/profile";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your lots",
  description: "Shirts you listed, auctions you bid in, and lots you won.",
  alternates: { canonical: "/profile" },
  ...noIndex,
};

export default function ProfilePage() {
  return <ProfileGate />;
}
