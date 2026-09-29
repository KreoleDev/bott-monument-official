import type { NextConfig } from "next";
const mediaOrigins = [
  process.env.STRAPI_URL || "http://localhost:1337",
  ...(process.env.MEDIA_ORIGINS || "").split(",").filter(Boolean),
];
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: mediaOrigins.map((origin) => {
      const url = new URL(origin);
      return {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/**",
      };
    }),
    // Local Strapi is intentionally used during development, never enable this for production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};
export default nextConfig;
