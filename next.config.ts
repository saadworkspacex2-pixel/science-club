import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Payload limit for file processing paths (images are pre-compressed client-side)
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
