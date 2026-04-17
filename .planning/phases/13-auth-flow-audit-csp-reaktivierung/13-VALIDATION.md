---
phase: 13
slug: auth-flow-audit-csp-reaktivierung
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-17
updated: 2026-04-17
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

> Each PLAN.md task maps to a row here. Task IDs = `{plan}-T{n}`.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 13-01-T1 | 13-01 | 0 | AUTH-AUDIT-01 | wave-0 setup | `test -f packages/e2e-tools/fixtures/test-user.ts && test -f packages/e2e-tools/helpers/supabase-admin.ts && test -f packages/e2e-tools/helpers/csp-assertions.ts` | ⬜ pending |
| 13-01-T2 | 13-01 | 0 | AUTH-AUDIT-01 | wave-0 setup | `test -f .env.test.local.example && grep -q "\.env\.test\.local" .gitignore` | ⬜ pending |
| 13-01-T3 | 13-01 | 0 | AUTH-AUDIT-01 | wave-0 scaffold | `pnpm -F @genai/e2e-tools test --list \| grep -E "(Login.*Password\|Magic Link\|Signout\|Password Reset\|Cross-Domain\|CSP Baseline)"` | ⬜ pending |
| 13-02-T1 | 13-02 | 1 | AUTH-AUDIT-02..06 | checkpoint:human-action | `test -f .env.test.local && grep -q "TEST_USER_EMAIL=" .env.test.local` (local only) | ⬜ pending |
| 13-02-T2 | 13-02 | 1 | AUTH-AUDIT-02,03,05,06 | E2E automated | `pnpm -F @genai/e2e-tools test tests/auth.spec.ts` | ⬜ pending |
| 13-02-T3 | 13-02 | 1 | AUTH-AUDIT-04 | manual + docs | `grep -q "Path 3.*Session-Refresh" docs/AUTH-FLOW.md && grep -q "GET /auth/signout.*405" docs/AUTH-FLOW.md` | ⬜ pending |
| 13-02-T4 | 13-02 | 1 | AUTH-AUDIT-07 | checkpoint:decision | `grep -q "## Findings" docs/AUTH-FLOW.md` | ⬜ pending |
| 13-02-T5 | 13-02 | 1 | AUTH-AUDIT-07 | fix application | `pnpm -F @genai/e2e-tools test tests/auth.spec.ts` (post-fix) | ⬜ pending |
| 13-03-T1 | 13-03 | 1 | CONSOL-01 | grep audit | `grep -q "## Consolidation Audit" docs/AUTH-FLOW.md && ! grep -rn "from ['\"]@supabase/ssr['\"]" apps/ --include="*.ts" --include="*.tsx"` | ⬜ pending |
| 13-04-T1 | 13-04 | 2 | CSP-01 | unit | `test -f apps/website/lib/csp.ts && pnpm -F website typecheck` | ⬜ pending |
| 13-04-T2 | 13-04 | 2 | CSP-01 | integration | `grep -q "buildCspDirectives" apps/website/proxy.ts && ! grep -q "cspDirectives\|Content-Security-Policy-Report-Only" apps/website/next.config.ts` | ⬜ pending |
| 13-04-T3 | 13-04 | 2 | CSP-01 | checkpoint:decision | preview deploy URL captured in AUTH-FLOW.md | ⬜ pending |
| 13-04-T4 | 13-04 | 2 | CSP-01 | prod verification | `curl -sI https://generation-ai.org \| grep -i "content-security-policy:" \| grep -v "report-only"` | ⬜ pending |
| 13-05-T1 | 13-05 | 2 | CSP-02 | unit | `test -f apps/tools-app/lib/csp.ts && pnpm -F tools-app typecheck` | ⬜ pending |
| 13-05-T2 | 13-05 | 2 | CSP-02 | integration | `grep -q "buildCspDirectives" apps/tools-app/proxy.ts` | ⬜ pending |
| 13-05-T3 | 13-05 | 2 | CSP-02 | checkpoint:decision | preview deploy URL + Voice+Sentry smoke in AUTH-FLOW.md | ⬜ pending |
| 13-05-T4 | 13-05 | 2 | CSP-02,03 | prod verification | `curl -sI https://tools.generation-ai.org \| grep -i "content-security-policy:"` | ⬜ pending |
| 13-06-T1 | 13-06 | 3 | DOC-01 | docs | `grep -c "sequenceDiagram" docs/AUTH-FLOW.md` returns ≥ 7, `! grep -q "DRAFT" docs/AUTH-FLOW.md` | ⬜ pending |
| 13-06-T2 | 13-06 | 3 | DOC-01 | docs linkage | `grep -q "AUTH-FLOW.md" docs/ARCHITECTURE.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/e2e-tools/tests/auth.spec.ts` — stubs für 6 Auth-Pfade (Login/Passwort, Magic-Link, Session-Refresh, Signout, Password-Reset, Cross-Domain)
- [ ] `packages/e2e-tools/fixtures/test-user.ts` — Test-User-Credential-Loader (aus `.env.test.local`)
- [ ] `packages/e2e-tools/helpers/supabase-admin.ts` — Admin-API-Helper für `generateLink()` (Magic-Link ohne Inbox)
- [ ] `packages/e2e-tools/helpers/csp-assertions.ts` — `collectCspViolations`, `assertCspHeader`
- [ ] `.env.test.local.example` — Template mit TEST_USER_EMAIL, TEST_USER_PASSWORD, SUPABASE_SERVICE_ROLE_KEY
- [ ] `.gitignore` enthält `.env.test.local`

*Manual action required from Luca vor Wave 1 (Plan 13-02 Task 1):* Test-User in Supabase anlegen, Credentials in `.env.test.local` eintragen.

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Test-User in Supabase angelegt | Dashboard-Config, kein Code | Supabase Dashboard → Auth → Users → Create user mit bekannter Email/Passwort |
| securityheaders.com A/A+ Rating | Third-Party-Check | nach Deploy: besuche securityheaders.com/?q=generation-ai.org + tools.generation-ai.org, screenshot in AUTH-FLOW.md |
| Magic-Link-Email Layout (heller Hintergrund) | Dashboard-Config, out of scope | Note in AUTH-FLOW.md als Backlog-Item |
| Session-Refresh Path 3 | Timing-basiert, schwer zu automatisieren | Playwright-MCP manueller Run mit 1h-Wartezeit oder Mock-Clock |
| CSP-Rollout website → enforced | Rollout-Risiko | Preview-Deploy 24h, Sentry-Reports prüfen, dann Prod-Merge |
| CSP-Rollout tools-app mit Voice+Sentry+ToolLogo | Feature-Coverage muss manuell verifiziert werden | Preview-Checkliste: Login, Chat, Voice start/stop, Sentry-Testerror, ToolLogo-Render |

---

## Validation Sign-Off

- [x] All tasks have automated verify oder Wave-0-dependency
- [x] Sampling continuity: keine 3 Tasks in Folge ohne automated verify
- [x] Wave 0 covers alle MISSING references (Test-User, Admin-Helper, CSP-Hooks)
- [x] No watch-mode flags in verify-commands
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for execution
