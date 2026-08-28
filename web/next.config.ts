import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/gateway/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:5027"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
