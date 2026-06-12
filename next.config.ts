import type { NextConfig } from "next";

/** Server-side proxy target — set in production (e.g. Render/Railway internal URL). */
const backendOrigin =
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
