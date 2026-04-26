# Agent Safety And Integrations

Load this file only for git push/merge, deploy, live-service access, auth, identity, Circle, Supabase, CSP, proxy, middleware, OpenAI API, or other integration-sensitive work.

## Git

- Do not push without Luca's OK.
- Before any push, run `git branch --show-current`.
- Push with `git push origin HEAD:<branch>`, not plain `git push`.
- Never merge to `main` unless Luca explicitly asks.
- Never run destructive git commands (`git reset --hard`, force push, broad checkout/revert) without explicit approval.
- The worktree may be dirty. Read diffs and work with existing changes; do not revert user or Claude changes.

## Live Services

Prefer CLI/local files by default. Use MCP only when it gives materially better live context or structured access.

- GitHub: default to `gh` CLI and local git.
- Vercel: default to `vercel` CLI for project, deploy, and log checks.
- Supabase: write SQL migrations into the repo before applying live schema changes.
- Circle: treat MCP/API access as admin-level. Avoid write/delete actions without explicit approval.
- Resend: default to repo code, direct API usage, or existing app flows unless managing Resend platform data directly.
- GSD: use local files and `pnpm gsd`; no MCP needed.

## OpenAI Docs

Always use the official OpenAI developer documentation MCP server for OpenAI API, ChatGPT Apps SDK, Codex, or other OpenAI developer-product work. Do not rely on stale memory for version-sensitive OpenAI behavior.

## High-Risk Areas

Read `LEARNINGS.md` before CSP, proxy, middleware, auth, Circle, identity, nonce, or routing work.

- Circle/API identity work: never ship guessed endpoints or response shapes. Probe real APIs or official docs first.
- CSP/proxy/middleware/layout nonce work: verify with build plus local production smoke.
- Database migrations: create migration files in repo, review SQL, then apply only when approved or already in scope.
- Production deploys: never deploy without Luca's OK.

## Secrets

Do not read `.env*`, SSH keys, shell profiles, tokens, or credentials unless Luca explicitly asks.
