---
"@genai/auth": minor
"@genai/tools-app": patch
"@genai/website": patch
---

Fix broken login session persistence in tools-app and consolidate
the auth implementation across the monorepo.

- `@genai/auth`: new canonical `updateSession` middleware helper +
  cross-domain cookie support via `NEXT_PUBLIC_COOKIE_DOMAIN`.
  The barrel is now client-safe; server helpers live on subpaths
  (`/server`, `/middleware`, `/helpers`).
- `tools-app`: all manual `document.cookie` hacks removed. Auth now
  flows through `@genai/auth` — root cause of the session blocker
  was a custom `btoa(JSON.stringify(...))` format incompatible with
  `@supabase/ssr`'s native base64-URL/chunked encoding.
- `website`: migrated to `@genai/auth` shims + new `proxy.ts` for
  session refresh, enabling cross-domain cookies with tools-app.

Net change: −360 lines of broken auth code removed.
Ref: `.planning/phases/12-auth-rewrite/PLAN.md`
