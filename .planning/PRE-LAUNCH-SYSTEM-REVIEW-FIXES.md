# Pre-Launch System Review Fixes

Date: 2026-04-27
Branch: `audit/pre-launch-system-review`

## Implemented Fixes

### Auth/Admin/Circle

- Removed admin authorization via `user_metadata.role`.
- Restricted website admin access to `ADMIN_EMAIL_ALLOWLIST`.
- Updated admin auth tests so metadata role is ignored.
- Removed `createAdminClient` from the root `@genai/auth` barrel export.
- Updated server/admin call sites to import from `@genai/auth/admin`.
- Changed `/auth/confirm` to resolve Circle member ID from `user_circle_links` with service role instead of user metadata.

### Tools-App API Security

- Disabled public Deepgram token issuance at `/api/voice/token`.
- Required authenticated Supabase user for `/api/voice/transcribe`.
- Hid the voice/mic button from public Lite chat; voice input is visible only in member mode.
- Added voice transcription rate limit and 10 MB audio cap.
- Added `apps/tools-app/lib/url-safety.ts` for public HTTP(S) URL validation.
- Added SSRF-style private/local host blocking to `/api/extract-url` and `/api/defuddle`.
- Added rate limiting, content-size guard, and output cap to extraction/Defuddle paths.
- Changed chat API to derive member/public mode server-side from authenticated user.
- Added chat input/history limits.
- Added chat session ownership checks and `user_id` writes for new sessions/messages.
- Added regression test for anonymous member-mode denial.

### Website Flow/CSP/Email

- Updated signup confirmation email to distinguish Circle-provisioned vs pending/manual state.
- Removed stale "Pro-Assistenten" wording in confirmation email path.
- Passed Circle provisioning state from signup action into email template.
- Gated event-detail external registration link behind login.
- Added logged-out event-detail CTA to `/join?redirect_after=/events/<slug>`.
- Added nonces to inline JSON-LD scripts in root layout and community article pages.
- Escaped `<` in JSON-LD serialization.
- Re-export/import adjustments for admin Supabase helpers.

### Docs/Planning

- Added `CIRCLE_HEADLESS_TOKEN` to deployment/Circle docs and launch setup notes.
- Updated architecture docs for the current two-mail Circle invitation plus Tools magic-link flow.
- Updated Phase 25 Human UAT for current Circle/Resend behavior.
- Updated Phase 27 launch checklist to reopen Circle env and two-mail UAT gates.
- Added pre-launch follow-ups to `.planning/BACKLOG.md`.

## Files Changed

- `.planning/BACKLOG.md`
- `.planning/phases/25-circle-api-sync/25-HUMAN-UAT.md`
- `.planning/phases/27-copy-pass-and-launch-cleanup/27-LAUNCH-CHECKLIST.md`
- `apps/tools-app/__tests__/api/chat.test.ts`
- `apps/tools-app/app/api/chat/route.ts`
- `apps/tools-app/app/api/defuddle/route.ts`
- `apps/tools-app/app/api/extract-url/route.ts`
- `apps/tools-app/app/api/voice/token/route.ts`
- `apps/tools-app/app/api/voice/transcribe/route.ts`
- `apps/tools-app/lib/url-safety.ts`
- `apps/website/app/actions/signup.ts`
- `apps/website/app/actions/waitlist.ts`
- `apps/website/app/api/admin/circle-reprovision/route.ts`
- `apps/website/app/auth/confirm/route.ts`
- `apps/website/app/community/artikel/[slug]/page.tsx`
- `apps/website/app/events/[slug]/page.tsx`
- `apps/website/app/layout.tsx`
- `apps/website/emails/dist/confirm-signup.html`
- `apps/website/lib/__tests__/admin-auth.test.ts`
- `apps/website/lib/admin-auth.ts`
- `apps/website/lib/supabase/server.ts`
- `docs/ARCHITECTURE.md`
- `docs/CIRCLE-INTEGRATION.md`
- `docs/DEPLOYMENT.md`
- `packages/auth/src/index.ts`
- `packages/emails/src/templates/confirm-signup.tsx`

## Validation

Passed:

```bash
pnpm --filter @genai/website exec tsc --noEmit
pnpm --filter @genai/tools-app exec tsc --noEmit
pnpm --filter @genai/e2e-tools exec tsc --noEmit
pnpm --filter @genai/website test
pnpm --filter @genai/tools-app test
pnpm --filter @genai/auth test
pnpm --filter @genai/circle test
pnpm build
```

Email templates were regenerated with:

```bash
pnpm --filter @genai/emails email:export
```

Focused Playwright status:

- Website local production server used `http://localhost:3002`.
- Tools local production server used `http://localhost:3001`.
- Website join/test/events run: 30 passed, 1 skipped.
- Tools-App smoke run: 6 passed.
- Public Lite chat smoke now asserts that the mic/voice button is not rendered.
- `/join` DOM smoke: one hydrated `h1`, one hydrated `form[aria-label="Beitrittsformular"]`; wrapper plus form both carry `aria-label="Beitrittsformular"`.
- Visual baseline run: 4 passed, 10 failed because stored snapshots are stale for current page heights/layouts; documented as open visual-UAT gate in `.planning/BACKLOG.md`.

## Open Handover Items

1. Run visual QA/baseline or manual screenshots for website and tools responsive views.
2. Decide whether to fix remaining open P1 UI issues in this branch or explicitly defer them in launch decision.
3. Perform manual preview/prod-like Circle/Supabase/Resend UAT only after explicit approval and with env values checked by humans.
4. Before final handoff, rerun `git diff --check` if more edits are made.
