/**
 * Content-Security-Policy builder für tools-app.
 * Hosts: Supabase Auth+Realtime, Sentry DE-Region, Deepgram (voice WSS),
 *        Clearbit (ToolLogo), Vercel Speed Insights + Web Vitals.
 * Reference: Phase 13 RESEARCH.md "CSP-Directives — Vollständige Host-Liste" tools-app.
 */
export function buildCspDirectives(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic' + Nonce erlauben React/Next/Sentry-SDKs; expliziter Host für Vercel Speed Insights loader.
    // 'unsafe-eval' NUR in dev (React Refresh + Sentry SDK source-map replay).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind v4 inline styles → unsafe-inline für styles (für scripts NICHT).
    "style-src 'self' 'unsafe-inline'",
    // ToolLogo-Komponente lädt Logos von Clearbit (verified in Research).
    "img-src 'self' data: blob: https://logo.clearbit.com",
    "font-src 'self'",
    [
      "connect-src 'self'",
      // Supabase Auth + Realtime (WSS)
      "https://wbohulnuwqrhystaamjc.supabase.co",
      "wss://wbohulnuwqrhystaamjc.supabase.co",
      // Sentry — DE-Region, spezifische Org-Subdomain (kein *.sentry.io wildcard!)
      "https://o4511218002362368.ingest.de.sentry.io",
      // Deepgram Voice (REST + WSS)
      "https://api.deepgram.com",
      "wss://api.deepgram.com",
      // Vercel Speed Insights + Web Vitals reporting
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
    ].join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    // form-action 'self' reicht (Supabase-Auth wird via fetch/POST zu same-origin /api/auth/* gemacht).
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}
