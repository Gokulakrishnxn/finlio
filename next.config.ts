import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Insights was renamed to Analytics; keep old links working.
  async redirects() {
    return [
      { source: "/insights", destination: "/analytics", permanent: true },
      // Privacy moved into Settings → Privacy; the same details are in the Terms.
      { source: "/privacy", destination: "/terms#your-data", permanent: false },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
