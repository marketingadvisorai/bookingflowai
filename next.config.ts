import type { NextConfig } from "next";
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      // Widget/embed paths — allow iframing
      source: '/widget/:path*',
      headers: [
        ...securityHeaders,
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" },
      ],
    },
    {
      source: '/embed/:path*',
      headers: [
        ...securityHeaders,
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" },
      ],
    },
    {
      source: '/book/:path*',
      headers: [
        ...securityHeaders,
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" },
      ],
    },
    {
      // All other paths — deny framing
      source: '/(.*)',
      headers: [
        ...securityHeaders,
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
  ],
};

export default nextConfig;
