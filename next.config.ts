import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/dev/widhdraw",
        destination: "http://localhost:4000/purchase", 
      }
    ]
  }
};

export default nextConfig;
