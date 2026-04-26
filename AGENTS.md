# Generation AI — Agent Instructions

This file is for Codex and other non-Claude agents. Keep `CLAUDE.md` intact; it remains the Claude Code source of truth. When both files apply, use this file as a Codex-compatible summary of the same project rules.

## Session Start

For every new substantial task, read these first:

1. `.planning/STATE.md` — current project status and active phase
2. `LEARNINGS.md` — required before CSP, proxy, middleware, auth, Circle, or identity work
3. `docs/ARCHITECTURE.md` — system overview

Then read task-specific docs:

- API work: `docs/API.md`
- Deploy work: `docs/DEPLOYMENT.md`
- Phase work: `.planning/phases/<phase>/CONTEXT.md`, relevant `*-PLAN.md`, and existing `*-SUMMARY.md`
- Website page work: `apps/website/AGENTS.md`
- Tools app work: `apps/tools-app/AGENTS.md`
- Brand/design work: `brand/Generation AI Design System/README.md`, `DESIGN.md`, `VOICE.md`, and `packages/config/tailwind/base.css`

## Project Shape

- Monorepo: pnpm + Turborepo
- Website: `apps/website` (`generation-ai.org`)
- Tools app: `apps/tools-app` (`tools.generation-ai.org`)
- Shared packages: `packages/auth`, `packages/circle`, `packages/emails`, `packages/types`, `packages/ui`, `packages/config`
- Circle is the community center; website and tools-app are satellites.
- Supabase is the shared identity/session source.

## Branch And Git Rules

- Active pre-launch pattern: `feature/phase-XX-slug` -> `develop` -> launch merge to `main`.
- `main` is production source of truth and auto-deployed. Do not merge to `main` unless Luca explicitly asks.
- Do not push without Luca's OK.
- Before any push, run `git branch --show-current`; push with `git push origin HEAD:<branch>`, not plain `git push`.
- Phase 26 lives in `/Users/lucaschweigmann/projects/generation-ai-phase-26`. Do not touch that worktree unless explicitly asked.
- The worktree may be dirty. Never revert user or Claude changes unless explicitly asked. Read diffs and work with existing changes.

## GSD Workflow

Claude slash commands such as `/gsd-autonomous`, `/gsd-plan-phase`, and `/gsd-execute-phase` are not available in Codex. Use the planning files manually.

Codex workflow:

1. Read `STATE.md` and the phase `CONTEXT.md`.
2. Check existing plans and summaries.
3. If implementing a plan, preserve the GSD artifact style: executable plan, scoped commits/changes, summary, validation notes.
4. For read-only GSD status, use `pnpm gsd ...` if available. It wraps the local `~/.claude/get-shit-done/bin/gsd-tools.cjs` CLI.

For major phase work, keep the flow: short discussion, solid plan, focused execution, validation, concise summary.

## CLI Vs MCP

Prefer CLI/local files by default. Use MCP only when it gives materially better live context or structured access.

- GitHub: default to `gh` CLI and local git. Use GitHub MCP only if explicitly re-enabled for structured PR/issue operations.
- Vercel: default to `vercel` CLI for account/project/deploy/log checks. Use Vercel MCP for exploratory deployment diagnostics or when structured project context is worth the OAuth/tool overhead.
- Supabase: MCP is project-scoped and can have full access depending on `SUPABASE_ACCESS_TOKEN`. For schema changes, write SQL migrations into the repo first and review before applying live changes.
- Circle: use MCP only when live community/admin context is needed. Treat it as admin-level access; avoid write/delete actions without explicit approval.
- Resend: default to repo code, direct API usage, or existing app flows. Keep Resend MCP disabled unless managing Resend platform data directly.
- Context7/OpenAI Docs: use only for current API/library docs, setup instructions, or version-sensitive framework behavior.
- GSD: use local files and `pnpm gsd`; no MCP needed.

## Safety Rules

- No production deploy without Luca's OK.
- No destructive git commands (`git reset --hard`, force push, broad checkout/revert) without explicit approval.
- Do not read sensitive files such as `.env*`, SSH keys, shell profiles, or credentials unless Luca explicitly asks.
- Circle/API identity work is high risk. Never ship guessed endpoints or response shapes. Probe real APIs or use official docs before coding.
- CSP/proxy/middleware/layout nonce work is high risk. Read `LEARNINGS.md` first and verify with build plus local production smoke.
- Always use the OpenAI developer documentation MCP server if you need to work with the OpenAI API, ChatGPT Apps SDK, Codex, or other OpenAI developer products, without Luca having to explicitly ask.

## Design System

Use tokens and shared components instead of ad hoc styling.

- Canonical tokens: `packages/config/tailwind/base.css`
- Brand source: `brand/Generation AI Design System/`
- Default theme: dark
- Dark accent: neon `#CEFF32`; light accent: red `#F5133B`
- Header band: blue in dark, pink in light
- Hero H1 token: `--fs-display`; do not invent inline hero clamps
- Buttons: `rounded-full`
- Cards: `rounded-2xl`
- Canonical card hover: `hover:scale-[1.015]`, accent glow, accent border, `duration-300`, `ease-[var(--ease-out)]`
- Avoid inline `onMouseEnter` / `onMouseLeave` for visual hover states.

Website subpages must follow `apps/website/AGENTS.md`: `LabeledNodes` background, `max-w-4xl`, `--fs-display`, client wrapper with `MotionConfig nonce={nonce}`, and `SectionTransition` between content sections.

## Voice

User-facing product copy is German with real umlauts: ö, ä, ü, ß. Never use oe/ae/ue/ss substitutions.

- Use `Du`
- Keep code identifiers English
- Confident-casual tone
- Short, direct copy
- No corporate filler such as "Leider", "bitte haben Sie Verständnis", or "erfolgreich gespeichert"
- No emoji in UI/buttons/labels unless the brand docs explicitly allow it for the context

## Commands

```bash
pnpm dev:website
pnpm dev:tools
pnpm build
pnpm lint
pnpm test
pnpm --filter @genai/website exec tsc --noEmit
pnpm --filter @genai/tools-app exec tsc --noEmit
pnpm --filter @genai/e2e-tools exec playwright test tests/<spec>.spec.ts
pnpm gsd init milestone-op
```

Non-trivial feature/fix changes usually need a changeset.
