import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses for faster network transfer
  compress: true,

  // Prevent unnecessary re-renders
  reactStrictMode: true,
};

export default nextConfig;
