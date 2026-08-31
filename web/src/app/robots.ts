import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/sell", "/profile", "/office"],
      },
    ],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/sitemap.txt")],
    host: siteUrl(),
  };
}
