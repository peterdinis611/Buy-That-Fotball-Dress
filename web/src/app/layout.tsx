import type { Metadata } from "next";
import { Karla, Saira_Extra_Condensed } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter, Floodlights } from "@/components/layout";
import { Providers } from "@/components/providers";

const display = Saira_Extra_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const karla = Karla({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KIT VAULT — bid on shirts that saw grass",
  description: "Live auctions for match-worn football jerseys. Highest bid when the clock hits zero wins.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${karla.variable} h-full`}>
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
