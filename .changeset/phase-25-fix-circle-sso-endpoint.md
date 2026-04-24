---
"@genai/website": patch
---

fix(25): correct Circle SSO endpoint, token type, and response shape (Bug #2)

`generateSsoUrl` was implemented against an imagined API contract that did
not exist on Circle. Three independent defects compounded:

1. **Wrong endpoint:** `/api/admin/v2/headless_auth_tokens` → `/api/v1/headless/auth_token` (different API surface entirely: Headless Auth API, not Admin API v2).
2. **Wrong token type:** Admin API token cannot authenticate against Headless endpoints. Now uses a separately-minted "Headless Auth" token via new env var `CIRCLE_HEADLESS_TOKEN`.
3. **Wrong response model:** Circle does not return a passwordless `sso_url`. It returns a JWT `access_token`; the seamless-login URL is composed client-side as `${CIRCLE_COMMUNITY_URL}/session/cookies?access_token=<jwt>`.

Verified live against `app.circle.so/api/v1/headless/auth_token` (HTTP 200 with documented JWT response shape). After this fix users land directly inside the Circle community after confirming their email, instead of falling back to `/welcome?circle=pending`.

**New env var required:** `CIRCLE_HEADLESS_TOKEN` (mint in Circle Dashboard → Developers → Tokens → type "Headless Auth"). Already configured in Vercel Prod + Preview.
