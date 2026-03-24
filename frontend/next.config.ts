import type { NextConfig } from "next";

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "http://localhost:8000";
const parsedMediaUrl = new URL(mediaUrl);

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: parsedMediaUrl.protocol.replace(":", ""),
        hostname: parsedMediaUrl.hostname,
        port: parsedMediaUrl.port || undefined
      },
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" }
    ]
  }
};

export default nextConfig;
