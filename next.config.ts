import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const CSP = [
  "default-src 'self'",
  // dev : Next.js webpack/HMR utilise eval() ; prod : pas nécessaire
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",    // requis par Tailwind
  "img-src 'self' data: https:",         // favicons Google, screenshots thum.io, thumbnails Wikipedia
  // dev : WebSocket HMR sur ws://localhost ; prod : connect-src 'self' suffit
  isDev
    ? "connect-src 'self' ws://localhost:* wss://localhost:*"
    : "connect-src 'self'",
  "font-src 'self'",
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-DNS-Prefetch-Control',   value: 'on' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy',  value: CSP },
        ],
      },
    ]
  },
};

export default nextConfig;
