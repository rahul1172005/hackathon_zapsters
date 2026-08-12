import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses for faster network transfer
  compress: true,

  // Prevent unnecessary re-renders by enabling strict mode
  reactStrictMode: true,

  // Enable optimistic client navigation
  experimental: {
    optimisticClientCache: true,
  },

  // Enable static page generation caching
  output: "standalone",
};

export default nextConfig;
