import type { MetadataRoute } from "next";
import { absoluteUrl, listPublicUrls } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls = await listPublicUrls();

  return urls.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
