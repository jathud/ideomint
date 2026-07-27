import type { NextConfig } from "next";
import dns from "dns";

// Configure Node.js DNS resolvers for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore
}

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=(), browsing-topics=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'credentialless',
  },
  {
    // Content-Security-Policy:
    // - default-src 'self'          → only load resources from own domain by default
    // - script-src  'self' 'unsafe-inline' 'unsafe-eval' → Next.js requires these for hydration
    // - style-src   'self' 'unsafe-inline' fonts.googleapis.com
    // - img-src     allows own domain, data URIs, Cloudinary, Unsplash, PayHere CDN
    // - connect-src allows Supabase API, PayHere, Cloudinary API calls from browser
    // - frame-ancestors 'none' → stronger than X-Frame-Options (prevents clickjacking)
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.payhere.lk",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://www.payhere.lk",
      "media-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://www.payhere.lk",
      "frame-src 'self' https://www.payhere.lk",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.payhere.lk",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Allow ideofest subdomain to be used as a dev origin
  allowedDevOrigins: [
    'ideofest.localhost',
    '*.ideofest.localhost',
  ],

  experimental: {
    inlineCss: true,
    viewTransition: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
