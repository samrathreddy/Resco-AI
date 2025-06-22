import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Simple configuration to avoid conflicts
  webpack: (config) => {
    // Ignore canvas package which isn't needed for PDF.js
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
