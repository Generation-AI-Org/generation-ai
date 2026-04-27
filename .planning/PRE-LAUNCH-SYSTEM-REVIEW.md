# Pre-Launch System Review

Date: 2026-04-27
Branch: `audit/pre-launch-system-review`
Base branch reviewed: `develop`

## Scope

Reviewed launch-critical areas across:

- Website launch surface: home, join, welcome/auth confirm, test assessment, community, events, legal pages, header/nav/footer.
- Tools-App launch surface: public tool library, chat, extraction APIs, voice APIs, auth boundary, header/footer alignment.
- Shared packages: `@genai/auth`, `@genai/circle`, `@genai/emails`, shared config/types.
- Auth/Supabase/Circle/CSP/email integration and docs.
- Planning artifacts: STATE, ROADMAP, BACKLOG, phase 25/27/28 launch artifacts.

No production deploy, merge to `main`, push, live-service write, or `.env*`/secret inspection was performed.

## Launch-Gate Snapshot

Current launch posture: **not launch-ready yet**.

Reason: Code-level P0 blockers found in the audit were fixed in this branch, but manual launch gates remain open:

- Vercel/Supabase/Circle env check must confirm `CIRCLE_API_TOKEN`, `CIRCLE_HEADLESS_TOKEN`, Supabase keys, Resend keys, and Upstash rate-limit vars.
- Phase 25 Human UAT must be rerun against preview/prod-like config for the current two-mail flow: Circle invitation plus Resend Tools magic link.
- Website and Tools visual QA must be rerun after these fixes.
- Local E2E selector/test-contract updates for `/join`, `/events/[slug]`, and Tools-App header/chat smoke are complete and passing.
- No live Circle provisioning, Supabase signup, or email delivery was verified in this pass.

## Severity Findings

### P0

1. **Admin authorization trusted `user_metadata.role`**
   - Impact: Supabase user metadata can be client-writable depending on policy/client paths, so this could allow admin privilege escalation.
   - Status: Fixed. Admin access now uses `ADMIN_EMAIL_ALLOWLIST` only.

2. **Website `/auth/confirm` trusted `user_metadata.circle_member_id` for Circle SSO**
   - Impact: A manipulated metadata value could mint a Circle SSO URL for the wrong Circle member.
   - Status: Fixed. Confirm now queries service-role-only `user_circle_links` by Supabase user ID.

3. **Tools `/api/voice/token` exposed the Deepgram API key**
   - Impact: Public browser access could receive the provider secret.
   - Status: Fixed. Endpoint now returns `410` and directs clients to server-side transcription.

4. **Circle provisioning failure still sent success copy promising Circle email**
   - Impact: Failed Circle member creation looked successful to users and support; launch flow could silently strand members.
   - Status: Fixed. Confirmation email copy now distinguishes provisioned vs pending/manual state.

5. **Launch docs omitted `CIRCLE_HEADLESS_TOKEN`**
   - Impact: Preview/prod setup could pass docs while Circle Headless Auth SSO still fails.
   - Status: Fixed in deployment docs, Circle docs, and phase UAT/checklist artifacts.

### P1

1. **Tools `/api/chat` accepted client-selected `mode: member`**
   - Impact: Anonymous users could access member-mode behavior by changing request payload.
   - Status: Fixed. Member mode now requires an authenticated Supabase user.

2. **Chat sessions/messages were written through service role without authenticated ownership**
   - Impact: New chats could be orphaned/publicly scoped and missed by account deletion flows.
   - Status: Fixed for new writes. Existing historical rows with null ownership still need DB audit/cleanup.

3. **URL extraction and Defuddle endpoints lacked SSRF/public URL hardening**
   - Impact: Public endpoint abuse against local/private network targets or costly external calls.
   - Status: Partially fixed. Added public HTTP(S) URL validation, private IP blocking, rate limiting, size caps, and output cap. Further production-grade egress restrictions remain recommended.

4. **Voice transcription endpoint was public and unbounded**
   - Impact: Cost/DoS exposure.
   - Status: Fixed. Requires authenticated user, rate limit, and 10 MB input cap.

5. **Event detail pages exposed external registration links to logged-out users**
   - Impact: Users could bypass member/join flow from standalone event pages.
   - Status: Fixed. Logged-out users now get `/join?redirect_after=/events/<slug>`.

6. **`redirect_after` is captured but not consumed after the current two-mail Circle flow**
   - Impact: Event signup intent may be lost after joining.
   - Status: Open. Added to BACKLOG as non-blocking follow-up.

7. **Terminal splash blocks first-visit landing experience**
   - Impact: Launch UX risk, especially for first-time users and public campaign traffic.
   - Status: Open. Needs product/design decision.

8. **UI audit found launch-risk polish/accessibility issues**
   - Impact: Community section visual contract drift, nested interactive event cards, missing accessible names in Tools chat controls.
   - Status: Open. Documented for follow-up.

### P2

- `/test` result secondary CTA can bypass onboarding by linking directly toward community.
- Partner/Verein actions still need stricter rate limits and payload caps.
- Deployment/API docs are improved but still need a final post-flow modernization pass.
- Upstash rate-limit env vars were missing in local production build output; Vercel env must be manually checked.
- Join form responsive/touch-target issues and Kiwi overlap risk remain from UI audit.
- Phase/ROADMAP/STATE completion markers remain partially inconsistent.

### P3

- JSON-LD inline scripts lacked nonce. Status: Fixed.
- Undefined `--accent-rgb` and mobile menu Escape/focus-management polish remain.
- E2E selectors for changed join/event/tools contracts were updated. Status: Fixed.

## Validation Run

Passed:

- `pnpm --filter @genai/website exec tsc --noEmit`
- `pnpm --filter @genai/tools-app exec tsc --noEmit`
- `pnpm --filter @genai/e2e-tools exec tsc --noEmit`
- `pnpm --filter @genai/website test` — 110 tests passed
- `pnpm --filter @genai/tools-app test` — 20 tests passed
- `pnpm --filter @genai/auth test` — 7 tests passed
- `pnpm --filter @genai/circle test` — 21 tests passed
- `pnpm build` — passed

Build notes:

- Website build reported `SENTRY_DSN_WEBSITE` missing locally.
- Website build reported missing Upstash env vars locally; `/join` rate limiting would not be active in that local production process.
- Existing Turbopack/NFT trace warning appeared from `next.config.ts`/MDX reader path.

Focused Playwright runs:

Website command:

```bash
E2E_BASE_URL=http://localhost:3002 pnpm --filter @genai/e2e-tools exec playwright test tests/join.spec.ts tests/test-assessment.spec.ts tests/events.spec.ts --project=chromium --reporter=line
```

Result: 30 passed, 1 skipped.

Tools-App command:

```bash
TOOLS_URL=http://localhost:3001 pnpm --filter @genai/e2e-tools exec playwright test tests/tools-app.spec.ts --project=chromium --reporter=line
```

Result: 6 passed.

Additional DOM smoke:

- SSR `/join` markup has one `join-hero-heading`.
- Hydrated `/join` DOM has one `h1`, one `form[aria-label="Beitrittsformular"]`, and two `aria-label="Beitrittsformular"` nodes because wrapper plus form are both labelled.

Not yet run:

- Live signup/Circle/email provisioning UAT.

Visual baseline:

- `TARGET_WEBSITE=http://localhost:3002 TARGET_TOOLS=http://localhost:3001 pnpm --filter @genai/e2e-tools exec playwright test tests/visual-baseline.spec.ts --project=chromium --reporter=line`
- Result: 4 passed, 10 failed.
- Assessment: The stored snapshots are stale for current page lengths/layouts, especially Website home/legal and Tools home/login. Treat this as an open visual-UAT gate, not as evidence that the audit fixes introduced a specific visual regression.

## Manual Checks For Luca/Janna

- Confirm Vercel env values without exposing secrets: `CIRCLE_API_TOKEN`, `CIRCLE_HEADLESS_TOKEN`, Supabase URL/anon/service-role, Resend, Upstash.
- Rerun Phase 25 UAT with a real preview/prod-like signup and verify Circle invitation email plus Tools magic-link email.
- Verify failed Circle provisioning support path and admin reprovision flow.
- Review first-visit terminal splash decision before public launch.
- Visual QA on mobile and desktop for `/`, `/join`, `/test`, `/events`, `/community`, Tools home, Tools chat. Existing visual-baseline snapshots need either deliberate refresh or replacement with manual Visual UAT.
- Decide whether event `redirect_after` must be restored automatically after the two-mail flow before launch.

## Recommended Next Session Prompt

Continue from `/Users/lucaschweigmann/projects/generation-ai` on branch `audit/pre-launch-system-review`. Read `.planning/PRE-LAUNCH-SYSTEM-REVIEW.md` and `.planning/PRE-LAUNCH-SYSTEM-REVIEW-FIXES.md`. Do not deploy, push, read `.env*`, or touch live services. Local typechecks, unit tests, build, website Playwright, Tools-App Playwright, and `git diff --check` passed. Next: run visual QA/baseline or manual screenshots, decide whether to fix remaining open P1 UI issues in this branch, and prepare the human preview/prod-like Circle/Supabase/Resend UAT checklist.
