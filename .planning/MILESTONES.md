# Milestones — Generation AI Monorepo

## Completed Milestones

### v1.0: Monorepo Migration ✅
*Completed: 2026-04-14*

**Goal:** Zwei separate Repos in ein Monorepo zusammenführen.

**Delivered:**
- Phase 1: App Migration — Website + tools-app ins Monorepo kopiert
- Phase 2: Shared Packages — @genai/auth, @genai/types, @genai/config
- Phase 3: Deploy & Archive — Vercel umgestellt, alte Repos archiviert

**Outcomes:**
- Beide Apps laufen vom Monorepo
- Shared code eliminiert Duplikation
- pnpm catalog für Dependency Consistency
- https://generation-ai.org ✅
- https://tools.generation-ai.org ✅

---

### v2.0: Production Hardening ✅
*Completed: 2026-04-17 (Release v4.1.0)*

**Goal:** Apps production-ready und professional-grade machen.

**Delivered:**
- Phase 4: DSGVO & Legal (Impressum, Datenschutz, Account-Delete)
- Phase 5: Security Headers (CSP A+ via proxy.ts nonce, beide Apps)
- Phase 7: Testing (Vitest + Playwright E2E, 24/24 tests grün, GitHub Actions CI)
- Phase 8: Performance & A11y (Lighthouse > 90, WCAG 2.1 AA)
- Phase 9-11: Floating Chat Bubble + Voice-Prep + Performance Polish
- Phase 12: Auth Rewrite (@genai/auth, Session-Drop-Fix)
- Phase 13: Auth-Flow-Audit + CSP Enforced (Mermaid docs, E2E-Audit)

**Carried-over to backlog (brauchen externe Accounts):**
- Sentry Error Tracking (Account + DSN)
- Better Stack Uptime (Account)
- Resend/Vercel DPA-Docs

---

## Current Milestone

### v3.0: UX Polish & Feature Expansion (In Progress)
*Started: 2026-04-17*

**Goal:** Auf gehärteter v2.0-Basis die UX schärfen — Mobile-Polish, globaler Chat mit Kontext, OAuth, Passwort-Flow, Simplify-Pass.

**Target Features:**
- Mobile-UX Parity (Bugs + Micro-Animations)
- Global FloatingChat (auf allen Routen + Context-aware auf Detail-Seiten)
- Passwort-Flow vollständig (UI + Email-Templates + Reset-Test)
- Code-Simplify-Pass (tote Files + Naming-Konsistenz)
- OAuth Google + Apple (Circle-Member-Auto-Detection)

**Phases:** 14-19 (siehe ROADMAP.md)

---

## Future Milestones (Ideas)

- **v3.1:** Content System (Tool-Card-Previews, volle Detail-Artikel)
- **v3.5:** 2FA + Security-Hardening (httpOnly cookies, Account-Delete-Verification)
- **v4.0:** Circle Integration (Smart-Links, Cross-Session-Features)
