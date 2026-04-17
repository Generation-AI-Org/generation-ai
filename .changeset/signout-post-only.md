---
"@genai/tools-app": patch
---

Fix session drop ~1s after login in tools-app.

`/auth/signout` exposed a GET handler and two components rendered
`<Link href="/auth/signout">`. Next.js App Router prefetches visible
`<Link>`s → every prefetch issued a real GET /auth/signout, which
destroyed the session cookies the moment a logout link came on
screen. Login appeared to succeed, then the user was logged out
before any interaction.

- Remove the GET handler from `auth/signout/route.ts` (POST only).
- Replace `<Link href="/auth/signout">` with `<form method="POST"
  action="/auth/signout">` + button in `AppShell` and `FilterBar`.

Canonical Supabase pattern — mutating auth state via a prefetchable
GET link was the real root cause behind the "cookie vanishes after
login" bug that phase-12 could not fully eliminate.
