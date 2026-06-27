import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // force restart 6
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
// Force NextJS restart 3
