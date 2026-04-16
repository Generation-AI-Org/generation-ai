# Session: Auth Debugging

**Datum:** 2026-04-16
**Status:** IN PROGRESS
**Problem:** Login funktioniert, aber Session wird nicht persistiert (Cookies werden nicht gesetzt)

## Problem-Beschreibung

User kann sich einloggen (Password + Magic Link), wird aber nach Redirect oder Page Refresh ausgeloggt.
Debug-Endpoint `/api/debug-auth` zeigt `cookieCount: 0` - keine Cookies werden gesetzt.

## Analyse

### Getestete Hypothesen

1. **proxy.ts vs middleware.ts** - Next.js 16 verwendet proxy.ts ✓
2. **Server-Side vs Client-Side Callback** - Beide getestet
3. **PKCE vs Implicit Flow** - PKCE erfordert gleichen Browser/Device
4. **Magic Link mit token_hash** - Docs zeigen: `verifyOtp` statt `exchangeCodeForSession`
5. **Cookie-Handler nicht aufgerufen** - `setAll` wird nie getriggert

### Root Cause (vermutet)

`@supabase/ssr` Browser-Client setzt Cookies nicht automatisch nach `signInWithPassword`.
Der `onAuthStateChange` Listener feuert, aber `setAll` wird nicht aufgerufen.

## Commits in dieser Session

| Commit | Beschreibung |
|--------|--------------|
| `4389ac3` | Cookie direkt nach Login speichern (aktuell) |
| `b26d323` | Broken getSession() Verifikation entfernt |
| `ffcf014` | onAuthStateChange Listener für Cookie-Speicherung |
| `d6ea1ef` | Explizite Cookie-Handler mit Logging |
| `ee2760d` | verifyOtp für Magic Link statt exchangeCodeForSession |
| `f9401c6` | Implicit flow versucht (nicht Lösung) |
| `1699a32` | Client-side callback für PKCE |
| `e0e01ab` | Cookies auf Response statt cookieStore |
| `ccc573b` | Server-side callback + Session verification |
| `24dfd73` | proxy.ts statt middleware.ts (Next.js 16) |
| `b9da167` | Debug-Endpoint /api/debug-auth |

## Supabase Dashboard Änderungen

- **Site URL:** `https://tools.generation-ai.org` (war falsch: `/auth/callback`)
- **Magic Link Template:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink`
- **Rate Limit:** 100/5min (erhöht für Testing)

## Betroffene Dateien

### Geändert
- `apps/tools-app/lib/supabase/browser.ts` - Explizite Cookie-Handler + onAuthStateChange
- `apps/tools-app/app/login/page.tsx` - Direktes Cookie-Speichern nach Login
- `apps/tools-app/app/auth/callback/page.tsx` - token_hash + code Support
- `apps/tools-app/proxy.ts` - Session refresh

### Neu erstellt
- `apps/tools-app/app/auth/confirm/route.ts` - Server-side verifyOtp
- `apps/tools-app/app/api/debug-auth/route.ts` - Debug-Endpoint

## Dokumentation gelesen

- Supabase SSR Docs (context7)
- PKCE Flow vs Implicit Flow
- Magic Link mit token_hash vs code
- Cookie-Konfiguration für @supabase/ssr

## Nächste Schritte

1. Testen ob direktes Cookie-Setzen funktioniert (Commit 4389ac3)
2. Falls nicht: Browser-Console Logs analysieren
3. Ggf. Supabase-JS Version prüfen
4. Ggf. Custom Cookie-Storage implementieren

## Erkenntnisse

1. Magic Link verwendet `token_hash` + `verifyOtp`, nicht `code` + `exchangeCodeForSession`
2. PKCE erfordert gleichen Browser/Device (code_verifier in Cookies)
3. `@supabase/ssr` sollte automatisch Cookies setzen, tut es aber scheinbar nicht
4. Next.js 16 verwendet proxy.ts, nicht middleware.ts
