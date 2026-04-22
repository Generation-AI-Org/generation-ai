/**
 * Content-Security-Policy builder für Website.
 * Website hat: Supabase Auth, NextJS framework scripts. Kein Speed Insights
 * (Free-Plan: nur tools-app), kein Sentry, kein Deepgram.
 * Reference: Phase 13 RESEARCH.md "CSP-Directives — Vollständige Host-Liste" website-app.
 */
export function buildCspDirectives(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // Nonce + strict-dynamic erlauben React/Next-Scripts.
    // 'unsafe-eval' NUR in dev (React Refresh).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind v4 generiert inline styles → unsafe-inline für styles akzeptabel (für scripts NICHT).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    [
      "connect-src 'self'",
      "https://wbohulnuwqrhystaamjc.supabase.co",
      "wss://wbohulnuwqrhystaamjc.supabase.co",
    ].join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}
