import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We rely on Webpack/Turbopack to bundle firebase-admin and its dependencies 
  // into a format compatible with Serverless functions.
  // serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
};

export default nextConfig;
