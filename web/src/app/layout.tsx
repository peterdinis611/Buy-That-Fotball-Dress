import type { Metadata, Viewport } from "next";
import { Karla, Saira_Extra_Condensed } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader, SiteFooter, Floodlights, BootClear } from "@/components/layout";
import { PitchBall } from "@/components/layout/pitch-ball";
import { Providers } from "@/providers";
import { JsonLd } from "@/components/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl, websiteJsonLd } from "@/lib/seo";
import { lightsBootScript } from "@/lib/theme";

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#cfd3ce" },
    { media: "(prefers-color-scheme: dark)", color: "#121812" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "football jersey auction",
    "match-worn shirts",
    "kit auction",
    "live football auctions",
    "football memorabilia",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${karla.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <div id="kit-boot" className="kit-boot" role="status" aria-label="Loading Kit Vault">
          <div className="kit-boot-spot">
            <PitchBall />
            <p className="kit-boot-mark">Kit Vault</p>
          </div>
        </div>
        <BootClear />
        <Script id="kit-vault-lights" strategy="beforeInteractive">
          {lightsBootScript}
        </Script>
        <JsonLd data={websiteJsonLd()} />
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
