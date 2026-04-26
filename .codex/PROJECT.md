# Codex Runbook — Generation AI

This is the Codex-side operating note for the Generation AI monorepo. It does not replace `CLAUDE.md`; it makes the shared workflow explicit for Codex sessions.

## First Moves

For a new task:

1. Check `git status --short --branch`.
2. Read `AGENTS.md`.
3. Read `.planning/STATE.md`.
4. Read task-specific context before editing.

If the task is tiny and local, keep the read set small. If it touches auth, CSP, Circle, deploys, database schema, or public page UX, widen the read set before touching code.

## Current Collaboration Model

Claude Code may still work in this repo. Treat uncommitted changes as owned by Luca or Claude unless you made them in this session.

Before continuing someone else's work:

```bash
git status --short --branch
git diff -- <relevant-files>
```

Then either continue the exact direction or ask Luca if the intent is ambiguous.

## GSD In Codex

Codex cannot call Claude's slash-command skills. It can still use the planning artifacts and the local GSD CLI wrapper:

```bash
pnpm gsd
pnpm gsd init milestone-op
pnpm gsd find-phase 22.8
pnpm gsd state --raw
```

Use GSD manually:

- `CONTEXT.md` explains scope and decisions.
- `*-PLAN.md` is the implementation contract.
- `*-SUMMARY.md` records what changed and how it was verified.
- `STATE.md` is the cross-session handoff.

If a phase plan does not exist yet, do not pretend it does. Either create a small plan artifact first or clearly state that you are doing a focused implementation outside the Claude slash-command workflow.

## Verification Defaults

Use the narrowest meaningful check first:

- Type-only website check: `pnpm --filter @genai/website exec tsc --noEmit`
- Type-only tools check: `pnpm --filter @genai/tools-app exec tsc --noEmit`
- App build: `pnpm --filter @genai/website build` or `pnpm --filter @genai/tools-app build`
- Full build: `pnpm build`
- E2E spec: `pnpm --filter @genai/e2e-tools exec playwright test tests/<spec>.spec.ts`

For CSP/proxy/middleware/layout nonce changes, local production verification is required:

```bash
pnpm --filter @genai/website build
cd apps/website
NODE_ENV=production pnpm start
```

Then inspect the page for CSP console errors.

## Useful Context Files

- Root rules: `CLAUDE.md`, `AGENTS.md`
- App rules: `apps/website/AGENTS.md`, `apps/tools-app/AGENTS.md`
- System risks: `LEARNINGS.md`
- Architecture: `docs/ARCHITECTURE.md`
- API: `docs/API.md`
- Deploy: `docs/DEPLOYMENT.md`
- Branch workflow: `.planning/BRANCH-WORKFLOW.md`
- Brand: `brand/Generation AI Design System/README.md`
- Design: `brand/Generation AI Design System/DESIGN.md`
- Voice: `brand/Generation AI Design System/VOICE.md`
- Tokens: `packages/config/tailwind/base.css`

## CLI Vs MCP

Default rule: use local files and CLIs first. Use MCP only when it improves live context, OAuth-scoped access, or structured diagnostics enough to justify the extra tool surface.

CLI defaults:

- GitHub: `gh` CLI + local git.
- Vercel: `vercel` CLI for account/project/deployment checks.
- Resend: repo code, app flows, or direct API usage.
- GSD: `pnpm gsd` and `.planning` artifacts.

MCP defaults:

- `openaiDeveloperDocs` — official OpenAI docs MCP, remote, no auth.
- `context7` — stdio via `npx -y @upstash/context7-mcp`.
- `supabase` — hosted Supabase MCP, scoped to project `wbohulnuwqrhystaamjc`, using `SUPABASE_ACCESS_TOKEN` as bearer-token env var. This is full-access when the token has write scopes.
- `vercel` — official remote Vercel MCP at `https://mcp.vercel.com`; OAuth login required before use.
- `circle` — official Circle MCP at `https://app.circle.so/api/mcp`; OAuth login required before use.
- `resend` — local stdio wrapper at `scripts/resend-mcp.cjs`, which loads `RESEND_API_KEY` from the local secret file.

Optional MCPs kept disabled by default:

- GitHub MCP: `github-mcp-server` is installed via Homebrew and `scripts/github-mcp.cjs` exists as a no-token-in-config wrapper. Re-enable only if `gh` becomes too clumsy for PR/issue work.
- Resend MCP: enabled via local wrapper. Use it only when directly managing Resend platform data; repo/API paths are still preferred for normal email template work.

Still useful if needed later:

1. Vercel project-specific URL — use `https://mcp.vercel.com/<teamSlug>/<projectSlug>` if the generic endpoint asks for project/team too often.
2. Context7 API key — optional, for higher rate limits.
3. GitHub MCP re-enable:

```bash
codex mcp add github -- node /Users/lucaschweigmann/projects/generation-ai/scripts/github-mcp.cjs
```
Check current config:

```bash
codex mcp list
```

Authenticate OAuth MCPs:

```bash
codex mcp login vercel
codex mcp login circle
```

These commands open browser OAuth flows. If a server is marked `Not logged in`, run the matching login command and complete the browser flow.

## Local Secrets

For Codex Desktop sessions, do not rely on shell startup files. Put local-only secrets here:

```bash
~/.config/generation-ai/codex.env
```

Example contents:

```bash
SUPABASE_ACCESS_TOKEN="..."
RESEND_API_KEY="..."
```

Never commit this file and never paste these values into project docs. To run a command with these variables loaded:

```bash
node scripts/load-codex-env.cjs codex mcp list
node scripts/load-codex-env.cjs pnpm test
```

For Codex Desktop, also load secrets into the macOS GUI launch environment after editing `codex.env`:

```bash
node scripts/load-codex-env.cjs sh -lc 'launchctl setenv SUPABASE_ACCESS_TOKEN "$SUPABASE_ACCESS_TOKEN"; launchctl setenv RESEND_API_KEY "$RESEND_API_KEY"'
```

Restart Codex Desktop after running this so GUI-launched MCP processes inherit the values.
