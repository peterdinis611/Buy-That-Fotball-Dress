import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#cfd3ce",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e31c23",
            fontWeight: 700,
          }}
        >
          <span>Live auctions</span>
          <span>Match-worn shirts</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              alignItems: "center",
              justifyContent: "center",
              background: "#e31c23",
              color: "#eef0ea",
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 28,
            }}
          >
            KV
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 0.86,
              fontWeight: 800,
              letterSpacing: -2,
              textTransform: "uppercase",
              color: "#10203f",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              marginTop: 24,
              maxWidth: 760,
              fontSize: 32,
              lineHeight: 1.3,
              color: "#10203f",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5c400",
            color: "#161616",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
            padding: "16px 28px",
            alignSelf: "flex-start",
          }}
        >
          Highest bid when the clock hits zero wins
        </div>
      </div>
    ),
    size,
  );
}
