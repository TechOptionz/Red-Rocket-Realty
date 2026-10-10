import type { NextConfig } from "next";

const YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a production build run alongside `next dev` (which owns .next) without clobbering it.
  distDir: process.env.RR_DIST_DIR || ".next",
  images: {
    // WebP only: AVIF at these qualities smooths away fine detail (photos read as blurry). The optimizer resizes the local 2000px JPEGs on demand.
    formats: ["image/webp"],
    deviceSizes: [360, 480, 640, 768, 960, 1200, 1440, 1920, 2400],
    imageSizes: [64, 96, 128, 180, 240, 320, 420, 520],
    // Every quality value used by <Photo>/<Image> in the app must be listed here (Next 15.5 rejects others).
    qualities: [70, 75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Local sources may carry a cache-busting query (the brand marks use ?v=N); Next 16 will require this to be explicit.
    localPatterns: [{ pathname: "/brand/**" }, { pathname: "/photos/**" }, { pathname: "/videos/**" }],
  },
  async headers() {
    return [
      // Photos, brand marks, and videos are content-stable files; let browsers and CDNs keep them for a year.
      { source: "/photos/:path*", headers: [{ key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` }] },
      { source: "/videos/:path*", headers: [{ key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` }] },
    ];
  },
};

export default nextConfig;
