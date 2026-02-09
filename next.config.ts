import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'akcdn.detik.net.id',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cnnindonesia.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.kompas.com',
      },
      {
        protocol: 'https',
        hostname: 'img.antaranews.com',
      },
    ],
  },
};

export default nextConfig;
