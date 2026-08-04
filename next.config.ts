import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: firebase-admin ESM conflict with Turbopack on Vercel
  // jwks-rsa and jose are pure-ESM deps of firebase-admin and must NOT be bundled
  serverExternalPackages: [
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/auth',
    'firebase-admin/firestore',
    'firebase-admin/storage',
    'jwks-rsa',
    'jose',
  ],
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
