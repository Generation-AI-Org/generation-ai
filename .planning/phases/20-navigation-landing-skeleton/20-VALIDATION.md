---
phase: 20
slug: navigation-landing-skeleton
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Detail wird vom Planner in den einzelnen PLAN-Dateien aus RESEARCH.md § Validation Architecture abgeleitet.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E + CSP-Smoke) + Lighthouse-CI (Perf/A11y/SEO) + tsc/eslint (Type/Lint) |
| **Config file** | `apps/website/playwright.config.ts` (existiert) + `lighthouserc.json` (Wave 0 — fehlt noch) |
| **Quick run command** | `pnpm --filter @genai/website test:smoke` (Playwright Smoke gegen Prod-Build) |
| **Full suite command** | `pnpm build && NODE_ENV=production pnpm --filter @genai/website start` + Playwright Full + Lighthouse |
| **Estimated runtime** | ~90s (Quick) / ~6 min (Full inkl. Build + Lighthouse) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck && pnpm --filter @genai/website lint`
- **After every plan wave:** Run Playwright Smoke gegen Prod-Build (CSP-Errors, reduced-motion, basic Render)
- **Before `/gsd-verify-work`:** Full suite + Lighthouse > 90 in allen Kategorien
- **Max feedback latency:** ~30s (Quick) / ~90s (Smoke)

---

## Per-Task Verification Map

> Wird vom Planner pro Plan/Task gefüllt. Jede Task verlinkt auf REQ-ID (R1.1–R1.10) + Validation-Methode aus RESEARCH.md § Validation Architecture.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD     | TBD  | TBD  | R1.x        | —          | TBD             | TBD       | TBD               | ⬜ W0       | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lighthouserc.json` im Repo-Root (Lighthouse-CI Konfig — siehe RESEARCH § Testing Strategy)
- [ ] `apps/website/tests/smoke.spec.ts` — Playwright-Smoke (CSP-Console-Capture, reduced-motion-Fallback, Mobile-Nav, Dropdown-Keyboard)
- [ ] Motion + shadcn/ui + cn-helper installiert (Stack-Setup aus RESEARCH § Stack-Setup)
- [ ] Aceternity/MagicUI Keyframes in `apps/website/app/globals.css` (Aurora, Marquee/Scroll)
- [ ] `apps/website/playwright.config.ts` Prod-Build-Mode-Konfig (falls noch nicht vorhanden)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visuelle "Wow"-Wahrnehmung an 3 Peaks (Hero/Diskrepanz/Final-CTA) | R1 (UX-Quality) | Subjektive Brand-Wirkung nicht automatisierbar | Manuelle Sichtprüfung Dark + Light, Desktop + Mobile (Luca) |
| Microcopy-Tone (brand/VOICE.md) korrekt angewendet | R1 (Brand-Stimmigkeit) | Tonalität nicht testbar | Stichprobe Nav-Labels, Stub-Badges, Footer-Texte |
| Stub-Content "Beispiel"-Badge eindeutig erkennbar | R1.7/R1.8 | Wahrnehmungs-Frage | Sichtprüfung Tool-Showcase + Community-Preview Sections |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Lighthouse-Konfig, Smoke-Tests, Stack)
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
