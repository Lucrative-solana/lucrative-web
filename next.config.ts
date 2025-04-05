import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/dev/widhdraw",
        destination: "http://localhost:4000/purchase", 
      },
      {
        source: "/api/register/seller/item",
        destination: "http://localhost:4000/seller/items",
      },
      {
        source: "/api/get-my-items",
        destination: "http://localhost:4000/search/my-register-item",
      }
    ]
  }
};

export default nextConfig;
