import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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
  // MDX als gültiges Page-Extension neben tsx (Phase 24 level-profiles + Phase 26 D-10).
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Expose env vars to client bundle at build time
  env: {
    // Cookie domain must be inlined at build time for browser client
    NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "",
    // Phase 26 Block B: tools-app public API endpoint (declared hier für Cohesion,
    // konsumiert in Plan 26-05 via Server-Component)
    NEXT_PUBLIC_TOOLS_APP_URL:
      process.env.NEXT_PUBLIC_TOOLS_APP_URL || "https://tools.generation-ai.org",
  },

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
  // V1: keine remark/rehype-Plugins — deutsche Artikel mit 2-3 Absätzen brauchen
  // keine Tabellen (remark-gfm). Plugins bleiben bewusst leer für minimale
  // Trust-Surface (Threat T-26-01-03).
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
