import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ye Vercel ko faltu warnings ignore karne bolega
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ye Vercel ki strict checking band kar dega
    ignoreBuildErrors: true,
  },
};

export default nextConfig;