---
phase: 13
slug: auth-flow-audit-csp-reaktivierung
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.x (E2E) + Vitest (unit) |
| **Config file** | `packages/e2e-tools/playwright.config.ts`, `apps/*/vitest.config.ts` |
| **Quick run command** | `pnpm -F @genai/e2e-tools test --grep "@quick"` |
| **Full suite command** | `pnpm test && pnpm -F @genai/e2e-tools test` |
| **Estimated runtime** | ~120s (Playwright against Prod) |

---

## Sampling Rate

- **After every task commit:** `pnpm test` in affected package (unit-level sanity)
- **After every plan wave:** Full Playwright auth.spec.ts + unit suite
- **Before `/gsd-verify-work`:** Full suite green + manual securityheaders.com check
- **Max feedback latency:** 180s

---

## Per-Task Verification Map

> Filled in by planner. Each PLAN.md task MUST map to a row here.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| TBD     | TBD  | 0    | Test-Infrastructure | wave-0 | `pnpm -F @genai/e2e-tools test --list` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/e2e-tools/tests/auth.spec.ts` — stubs für 6 Auth-Pfade (Login/Passwort, Magic-Link, Session-Refresh, Signout, Password-Reset, Cross-Domain)
- [ ] `packages/e2e-tools/fixtures/test-user.ts` — Test-User-Credential-Loader (aus `.env.test.local`)
- [ ] `packages/e2e-tools/helpers/supabase-admin.ts` — Admin-API-Helper für `generateLink()` (Magic-Link ohne Inbox)
- [ ] `.env.test.local.example` — Template mit TEST_USER_EMAIL, TEST_USER_PASSWORD, SUPABASE_SERVICE_ROLE_KEY
- [ ] CSP-Violation-Assertion-Helper: Playwright hooks `page.on('console')` + Response-Header-Inspektion

*Manual action required from Luca vor Wave 1:* Test-User in Supabase anlegen, Credentials in `.env.test.local` eintragen.

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Test-User in Supabase angelegt | Dashboard-Config, kein Code | Supabase Dashboard → Auth → Users → Create user mit bekannter Email/Passwort |
| securityheaders.com A/A+ Rating | Third-Party-Check | nach Deploy: besuche securityheaders.com/?q=generation-ai.org + tools.generation-ai.org, screenshot in AUTH-FLOW.md |
| Magic-Link-Email Layout (heller Hintergrund) | Dashboard-Config, out of scope | Note in AUTH-FLOW.md als Backlog-Item |
| Session-Refresh-Proxy-Route | existiert nicht als separate Datei laut Research | Wenn Pfad nicht existiert: als N/A markieren; wenn doch, Playwright-Check hinzufügen |
| CSP-Rollout website Report-Only → Enforced | Rollout-Risiko, braucht Staging-Check | Report-Only für 24h live lassen, Sentry-Reports prüfen, dann enforced merge |

---

## Validation Sign-Off

- [ ] All tasks have automated verify oder Wave-0-dependency
- [ ] Sampling continuity: keine 3 Tasks in Folge ohne automated verify
- [ ] Wave 0 covers alle MISSING references (Test-User, Admin-Helper, CSP-Hooks)
- [ ] No watch-mode flags in verify-commands
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
