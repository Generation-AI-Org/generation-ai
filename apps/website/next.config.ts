import type { NextConfig } from "next";
import createMDX from '@next/mdx'

// CSP moved to proxy.ts (Phase 13) — nonce-based via Next.js 16 Middleware Pattern

const securityHeaders = [
  // HSTS: 2 Jahre, includeSubDomains für alle Subdomains, preload für Browser-Listen
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Verhindert MIME-Type Sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Verhindert Einbettung in iframes (Clickjacking-Schutz)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Kontrolliert Referrer-Informationen
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Deaktiviert nicht benötigte Browser-Features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Expose env vars to client bundle at build time
  env: {
    // Cookie domain must be inlined at build time for browser client
    NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '',
  },

  // Allow .mdx as a page extension (Phase 24 — level-profile MDX rendering)
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  async headers() {
    return [
      {
        // Security Headers für alle Routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig);
