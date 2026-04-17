/**
 * Content-Security-Policy builder für Website.
 * Website hat: Supabase Auth, Vercel Speed Insights, NextJS framework scripts.
 * Kein Sentry, kein Deepgram (anders als tools-app).
 * Reference: Phase 13 RESEARCH.md "CSP-Directives — Vollständige Host-Liste" website-app.
 */
export function buildCspDirectives(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // Nonce + strict-dynamic erlauben React/Next-Scripts; explizite Hosts für Speed Insights Loader.
    // 'unsafe-eval' NUR in dev (React Refresh).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind v4 generiert inline styles → unsafe-inline für styles akzeptabel (für scripts NICHT).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    [
      "connect-src 'self'",
      "https://wbohulnuwqrhystaamjc.supabase.co",
      "wss://wbohulnuwqrhystaamjc.supabase.co",
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
    ].join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}
