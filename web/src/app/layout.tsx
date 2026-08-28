import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono, Literata } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const display = Archivo_Black({
  variable: "--font-shoulders",
  subsets: ["latin"],
  weight: "400",
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "KIT VAULT — shirts that saw grass",
  description: "A floodlit archive for match-worn and rare football jerseys.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${literata.variable} ${plex.variable} h-full`}
    >
      <body className="pitch-lines relative flex min-h-full flex-col">
        <div className="floodlight" />
        <div className="grain" />
        <SiteHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
