import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Insights was renamed to Analytics; keep old links working.
  async redirects() {
    return [{ source: "/insights", destination: "/analytics", permanent: true }];
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
