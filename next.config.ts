import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
  images: {
    formats: ['image/webp'],  // Force WebP output for all images
    // Quality 75 is the sweet spot: visually nearly identical to 90, but ~40% smaller
    // This applies to ALL images served through next/image (both local and remote)
    // Combined with the upload API compression, this ensures images are always light
    deviceSizes: [640, 750, 828, 1080, 1200],  // Reduced from default (no 1920/2048)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',  // Cloudinary (admin uploads)
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',  // Firebase Storage
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',  // Placeholder fallbacks
      },
    ],
  },
};

export default nextConfig;
