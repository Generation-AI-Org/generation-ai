---
phase: 22-partner-page
plan: 22-02
subsystem: api
tags: [server-action, resend, honeypot, email, form-validation]

requires:
  - phase: 22-01
    provides: PartnerInquiryEmail + PartnerInquiryConfirmationEmail from @genai/emails
provides:
  - submitPartnerInquiry Server Action at apps/website/app/actions/partner-inquiry.ts
  - Honeypot check, server-side validation, Resend email dispatch
affects: [22-05, partner-page]

tech-stack:
  added: [resend@^6.10.0, @react-email/render@^1.0.1, @genai/emails workspace:*]
  patterns: [Next.js Server Action with 'use server', FormData validation pattern]

key-files:
  created:
    - apps/website/app/actions/partner-inquiry.ts
  modified:
    - apps/website/package.json

key-decisions:
  - "Confirmation email failure is silent — admin@ notification must never be blocked by it"
  - "noreply@ domain verification is a TODO — if fails, logs warning but does not reject form"
  - "Honeypot silent reject — no hint to bots (returns false, no 'bot detected' message)"
  - "resend + @react-email/render added as production deps to @genai/website"

patterns-established:
  - "Server Action pattern: 'use server' + FormData + typed return union"
  - "Graceful degradation: outer try/catch for admin mail, inner try/catch for confirmation"

requirements-completed: [R3.6]

duration: 8min
completed: 2026-04-24
---

# Plan 22-02: Server Action partner-inquiry.ts Summary

**Next.js Server Action for partner form: honeypot guard, server-side validation, admin notification + submitter confirmation via Resend — confirmation silently degradable if noreply@ unverified**

## Performance

- **Duration:** 8 min
- **Completed:** 2026-04-24
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created `apps/website/app/actions/partner-inquiry.ts` with `'use server'` directive
- Honeypot check: `formData.get('website')` non-empty → silent reject
- Server-side email regex validation + VALID_TYPES enum guard
- Admin notification sent to `admin@generation-ai.org` from `noreply@generation-ai.org`
- Confirmation email nested in inner try/catch — failure logs but doesn't block admin mail
- TODO comment added for noreply@ domain verification prerequisite (D-10)
- Added `resend`, `@react-email/render`, `@genai/emails` as production dependencies to website

## Task Commits

1. **Tasks 1: Server Action + dependency additions** - `b35575d` (feat)

## Files Created/Modified
- `apps/website/app/actions/partner-inquiry.ts` - Server Action
- `apps/website/package.json` - Added resend, @react-email/render, @genai/emails deps

## Decisions Made
- resend added as production dep to website (not just emails package) since Server Action runs there
- Confirmation email failure is non-blocking per planner soft flag
- Silent honeypot reject — returns `{ success: false }` with generic error, no bot-detection hint

## Deviations from Plan
None — plan executed exactly as written including the noreply@ soft-flag guidance.

## User Setup Required
**noreply@generation-ai.org must be verified as a Resend sender domain for D-10 confirmation mails to work.** If not verified:
- Admin notification (`admin@generation-ai.org`) still works — no action needed for MVP
- Confirmation mail silently fails with console.error log
- Check Resend dashboard → Domains → verify generation-ai.org domain

## Issues Encountered
- `resend` and `@react-email/render` were not installed in the website app — added as production deps + ran `pnpm install`

## Next Phase Readiness
- Server Action ready for import in `PartnerContactForm` (Plan 22-05)

---
*Phase: 22-partner-page*
*Completed: 2026-04-24*
