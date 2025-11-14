import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
    unoptimized: true,
  },
};

export default nextConfig;
