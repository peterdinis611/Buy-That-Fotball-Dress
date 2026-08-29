import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e31c23",
          color: "#eef0ea",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: -0.5,
        }}
      >
        KV
      </div>
    ),
    size,
  );
}
