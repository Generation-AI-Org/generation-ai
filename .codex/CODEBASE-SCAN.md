# Codebase Scan — Generation AI

Last updated: 2026-04-26

## Current Git Picture

- Main workspace: `/Users/lucaschweigmann/projects/generation-ai`
- Current integration branch: `develop`
- Production branch: `main` — do not push or merge there before Luca explicitly starts launch.
- Phase 26 worktree: `/Users/lucaschweigmann/projects/generation-ai-phase-26` on `feature/phase-26-community`; do not touch unless asked.
- Current local `develop` includes Phase 22.8 Foundation + Partner page layer 04/05 plus Codex onboarding/tooling.
- Remote push status must be checked before every push. Default rule: no push without Luca's explicit OK.

## Active Product Shape

Circle is the center of the product. Website and tools-app are satellites around the same Supabase identity layer.

- Website (`apps/website`): marketing, join/signup, partner, about, community, events, assessment/test.
- Tools app (`apps/tools-app`): AI tool library, detail pages, floating chat, account settings.
- Shared packages:
  - `@genai/auth`: Supabase clients, admin helpers, middleware, waitlist helpers.
  - `@genai/circle`: Circle Admin API + Headless SSO client.
  - `@genai/emails`: React Email templates and email primitives.
  - `@genai/ui`: shared logo/assets.
  - `@genai/types`: shared types.
  - `@genai/config`: Tailwind base tokens, ESLint, TSConfig.

## Project Rules To Keep In Head

- Read `AGENTS.md`, `.planning/STATE.md`, `LEARNINGS.md`, and `docs/ARCHITECTURE.md` for substantial work.
- For website subpages, obey `apps/website/AGENTS.md`: `LabeledNodes` hero, `--fs-display`, `max-w-4xl`, `MotionConfig nonce`, and `SectionTransition`.
- CSP/proxy/middleware/layout nonce changes require `LEARNINGS.md` plus local production smoke. Routes with nonce CSP must remain dynamic (`ƒ`).
- Circle identity work is high-risk. Do not guess endpoints or response shapes; verify against real API/docs.
- User-facing copy: German, real umlauts, Du, no corporate filler.

## Tooling Setup For Codex

Repo-local Codex files:

- `AGENTS.md`: Codex-compatible project instructions.
- `.codex/PROJECT.md`: Codex runbook, MCP/CLI policy, local secret workflow.
- `scripts/gsd.cjs`: wrapper for local `~/.claude/get-shit-done/bin/gsd-tools.cjs`.
- `scripts/load-codex-env.cjs`: loads `~/.config/generation-ai/codex.env` for commands.
- `scripts/resend-mcp.cjs`: Resend MCP wrapper that loads local secrets.
- `scripts/github-mcp.cjs`: optional GitHub MCP wrapper that pulls token from `gh auth token`; GitHub MCP disabled by default.

Active Codex MCP/CLI policy:

- GitHub: use `gh` + local git by default.
- Vercel: use `vercel` CLI by default; Vercel MCP available for structured diagnostics.
- Supabase: hosted MCP project-scoped to `wbohulnuwqrhystaamjc`, with `SUPABASE_ACCESS_TOKEN`.
- Circle: OAuth MCP available for community/admin context.
- Resend: API key available; MCP wrapper enabled for direct platform operations.
- Context7/OpenAI docs: docs only, use for version-sensitive questions.

Local secrets live outside the repo:

```bash
~/.config/generation-ai/codex.env
```

## Current Milestone/Phase

Milestone: v4.0 Website Conversion-Layer & Onboarding-Funnel.

Current Phase 22.8:

- 01 DS Compliance Audit: done.
- 02 Token/component compliance: done.
- 03 Favicon consolidation: done.
- 04 Partner hero icon boxes: done.
- 05 Partner nav split-button: done.
- 06–13 open.

Next meaningful phase item: `22.8-06` Join status switch + waitlist schema migration. This is a Stop-Gate because it touches Supabase data/schema. Write SQL migrations into `supabase/migrations/` first and review before applying.

Open UAT/cleanup highlights:

- Phase 22.6 logged-in tools-app regression smoke still open.
- Phase 26 community worktree UAT pending.
- Phase 24 human UAT items remain open.

## High-Risk Systems

- `apps/*/proxy.ts`, `apps/*/lib/csp.ts`, `apps/*/app/layout.tsx`: CSP nonce/dynamic rendering.
- `packages/circle/src/client.ts`, `apps/website/app/actions/signup.ts`, `apps/website/app/auth/confirm/route.ts`: identity and Circle SSO.
- `supabase/migrations/*`: database schema and RLS.
- `packages/auth/src/admin.ts`, `packages/auth/src/middleware.ts`: service role/session behavior.
- `apps/website/app/actions/*`: server actions using Supabase, Resend, Circle, rate limits.

## Verification Commands

Common:

```bash
pnpm --filter @genai/website exec tsc --noEmit
pnpm --filter @genai/tools-app exec tsc --noEmit
pnpm --filter @genai/e2e-tools exec playwright test tests/partner.spec.ts
pnpm gsd init milestone-op
```

For local browser/E2E tests needing website:

```bash
pnpm dev:website
```

For CSP/proxy/layout changes, use production smoke:

```bash
pnpm --filter @genai/website build
cd apps/website
NODE_ENV=production pnpm start
```

## Current Scan Notes

- Website root layout has `export const dynamic = "force-dynamic"` for nonce CSP.
- Tools-app important dynamic routes/pages: app page, settings, auth confirm.
- Supabase migrations present:
  - `20260424000001_waitlist.sql`
  - `20260425000001_circle_profile_fields.sql`
- Changesets exist for prior phases; Codex onboarding/tooling did not add a changeset because it is repo-internal tooling/test stabilization, not an app/package release feature.
- Partner E2E after Codex fixes: `14 passed`, `1 skipped` locally.
- Website TypeScript after Codex fixes: green.

