import type { Metadata } from "next";
import { Barlow, Teko } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter, Floodlights } from "@/components/layout";
import { Providers } from "@/components/providers";

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KIT VAULT — shirts that saw grass",
  description: "Night-match auctions for real football jerseys.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${teko.variable} ${barlow.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <Floodlights />
        <div className="grain" />
        <Providers>
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
