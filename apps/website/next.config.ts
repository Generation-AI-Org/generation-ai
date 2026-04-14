import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP Direktiven für statische Website
// Report-Only Mode: Violations werden geloggt, nicht geblockt
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self' https://wbohulnuwqrhystaamjc.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

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
  // CSP in Report-Only Mode zum Testen (Violations werden geloggt, nichts geblockt)
  {
    key: "Content-Security-Policy-Report-Only",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
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

export default nextConfig;
