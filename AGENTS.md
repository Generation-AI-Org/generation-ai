# Generation AI — Agent Instructions

Codex/non-Claude summary. Keep `CLAUDE.md` intact as the Claude Code source of truth. When both apply, follow this file for Codex-compatible workflow rules.

## Start Context

For substantial tasks, load only what is needed:

1. `.planning/STATE.md` for current status and active phase.
2. `docs/ARCHITECTURE.md` for implementation work.
3. Task-specific docs:
   - API: `docs/API.md`
   - Deploy: `docs/DEPLOYMENT.md`
   - Phase: `.planning/phases/<phase>/CONTEXT.md`, relevant `*-PLAN.md`, existing `*-SUMMARY.md`
   - Multi-plan/autonomous/parallel work: `.planning/AGENT-OPERATING-MODEL.md`
   - Git push, deploy, live services, auth, Circle, Supabase, CSP: `.planning/AGENT-SAFETY-INTEGRATIONS.md`
   - UI, brand, public copy: `.planning/AGENT-DESIGN-VOICE.md`
   - Website: `apps/website/AGENTS.md`
   - Tools app: `apps/tools-app/AGENTS.md`
   - Brand/design: `brand/Generation AI Design System/` plus `packages/config/tailwind/base.css`

Read `LEARNINGS.md` before CSP, proxy, middleware, auth, Circle, identity, or similarly high-risk platform work. Do not preload it for unrelated copy, UI, or planning-only tasks.

## Project Shape

- Monorepo: pnpm + Turborepo.
- Apps: `apps/website` (`generation-ai.org`) and `apps/tools-app` (`tools.generation-ai.org`).
- Shared packages: `packages/auth`, `packages/circle`, `packages/emails`, `packages/types`, `packages/ui`, `packages/config`.
- Circle is the community center; website and tools-app are satellites.
- Supabase is the shared identity/session source.

## Workflow

Use planning files manually; Claude slash commands are not available in Codex.

- Prefer small clean-slate sessions over one giant thread.
- Use repo artifacts as durable memory, not chat history.
- For major work: discuss briefly, plan, execute focused slice, validate, summarize.
- Preserve GSD artifact style: executable plan, scoped changes, summary, validation notes.
- For read-only GSD status, use `pnpm gsd ...` if available.
- For multi-plan or parallel work, proactively recommend session topology and read `.planning/AGENT-OPERATING-MODEL.md`.
- End every completed plan/wave with a copy-paste prompt for the next recommended session.

Do not preload every skill, MCP resource, planning artifact, or generated report. Use progressive disclosure: inspect with `rg --files`, then read only relevant docs, skill bodies, tool schemas, or live docs. Use `tool_search` only when a deferred tool is actually needed.

## Git And Branches

- Pattern: `feature/phase-XX-slug` -> `develop` -> launch merge to `main`.
- `main` is production source of truth and auto-deployed. Never merge to `main` unless Luca explicitly asks.
- Do not touch `/Users/lucaschweigmann/projects/generation-ai-phase-26` unless explicitly asked.
- The worktree may be dirty. Never revert user or Claude changes unless explicitly asked.
- No push, deploy, destructive git command, or live-service write/delete without explicit approval. Read `.planning/AGENT-SAFETY-INTEGRATIONS.md` first.

## Safety

- No production deploy without Luca's OK.
- Do not read `.env*`, SSH keys, shell profiles, or credentials unless explicitly asked.
- Circle/API identity work: never ship guessed endpoints or response shapes.
- CSP/proxy/middleware/nonce work: read `LEARNINGS.md`; verify with build plus local production smoke.

## Design And Voice

For UI, brand, or public copy, read `.planning/AGENT-DESIGN-VOICE.md` plus the relevant app or brand docs. Always use German umlauts correctly: ö, ä, ü, ß.

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
