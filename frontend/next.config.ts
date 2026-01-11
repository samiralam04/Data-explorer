import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image-server.worldofbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'www.worldofbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'images.worldofrarebooks.co.uk',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
