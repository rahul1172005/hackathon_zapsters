import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // Compress responses for faster network transfer
  compress: true,

  // Disable X-Powered-By header for speed and security
  poweredByHeader: false,

  // Prevent unnecessary re-renders
  reactStrictMode: true,

  // Optimize large package bundles
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'clsx', 'tailwind-merge'],
  },

  // Optimized image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },

  // Proxy /api/* to the FastAPI backend so pages can call relative /api/v1/...
  rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
