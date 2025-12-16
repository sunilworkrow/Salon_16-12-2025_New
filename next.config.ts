import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add this to completely skip linting
  experimental: {
    eslint: {
      ignoreDuringBuilds: true,
    },
  },
   images: {
    domains: ["example.com"], // ✅ Add your external image host here
  },
};

export default nextConfig;