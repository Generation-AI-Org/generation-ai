---
"@genai/circle": patch
"@genai/emails": patch
"website": patch
---

fix(25): pivot to Circle invitation-flow — Headless SSO doesn't activate members

Live-verified 2026-04-25: Circle's Headless `/session/cookies?access_token=` endpoint
sets cookies + 302s to community root, but the resulting session is rejected for
members with `active:false`. Member-activation has NO API path — neither the Admin
API (`PATCH active:true` is silently ignored, no `/activate` endpoint) nor the
Headless API (no password-set, no accept-invitation, no magic-link endpoints) can
flip the active flag. The ONLY way to activate a Circle member is via Circle's own
Set-Password page from their invitation email.

Pivot:
- `createMember` default `skipInvitation: false` → Circle sends its Set-Password mail
- `signup.ts`: `admin.createUser({ email_confirm: true })` (auto-confirm; Circle's
  Set-Password mail is the de-facto email validation) + drop `generateLink` /
  Resend confirmation chain
- `confirm-signup.tsx`: repurposed as branded Welcome mail with "Circle-Mail kommt
  als nächstes" copy + tools-link CTA. No own confirm-link.
- New PNG button asset: `btn-tools-link.png` ("Zu den KI-Tools")
- `circle-reprovision` admin route: drops explicit `skipInvitation:true` so admin
  reprovisions also re-trigger Circle's Set-Password mail

UX result: User receives 2 emails — branded welcome from us (Brand + tools link)
and Circle's Set-Password (functional, activates member). After Set-Password,
member is `active:true` and future logins via Headless SSO are possible.
