import { absoluteUrl, listPublicUrls } from "@/lib/seo";

export async function GET() {
  const urls = await listPublicUrls();
  const body = urls.map((entry) => absoluteUrl(entry.path)).join("\n") + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
