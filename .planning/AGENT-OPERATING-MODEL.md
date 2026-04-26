# Agent Operating Model

This playbook is for substantial Generation AI work: autonomous phase execution, multi-plan waves, parallel sessions, or repeated GSD coordination. Root `AGENTS.md` stays compact and always loaded; this file is loaded on demand when the work needs topology, context control, or handoff discipline.

Sources used for this model:

- OpenAI Codex `AGENTS.md` guidance discovery: `https://developers.openai.com/codex/guides/agents-md`
- OpenAI Codex best practices: `https://developers.openai.com/codex/learn/best-practices`
- OpenAI Codex skills guidance: `https://developers.openai.com/codex/skills`

## Core Principle

Use repo artifacts as durable memory, not the chat thread. A session should finish a bounded slice, update the planning files, validate the work, and leave the next session able to continue from files alone.

## Context Loading Policy

Load context progressively:

1. Start from root `AGENTS.md`.
2. Read `.planning/STATE.md` and the active phase `CONTEXT.md`.
3. Read `LEARNINGS.md` only when the work touches CSP, proxy, middleware, auth, Circle, identity, or another area the root instructions mark as high risk.
4. Read `docs/ARCHITECTURE.md` for substantial implementation work.
5. Inspect available phase artifacts with `rg --files .planning/phases/<phase>` before opening files.
6. Read only the relevant `*-PLAN.md`, adjacent `*-SUMMARY.md`, and task-specific docs for the current slice.

Avoid bulk-loading whole planning directories, all summaries, all codebase maps, all skill bodies, or large generated reports. Prefer `rg`, `rg --files`, `sed -n`, `git diff --stat`, and targeted file reads. Summarize large files into the working state instead of pasting them into the chat.

If instructions become too large, split guidance into nested `AGENTS.md` files or on-demand docs like this one. Codex has a project instruction byte cap controlled by `project_doc_max_bytes`; raising it is a fallback, not the first fix.

## Skills And Tools Policy

Skills are loaded on demand:

- Use the skill list for discovery, but open a skill's `SKILL.md` only when the user names it or the task clearly matches its trigger.
- Do not preload every GSD, UI, browser, document, or integration skill at session start.
- Turn a repeated workflow into a skill only after the manual workflow is reliable. Keep each skill scoped to one job with clear inputs, outputs, and trigger phrases.
- Shared team skills can live in repo `.agents/skills` once they are stable enough to reuse across sessions.

Tools are also loaded on demand:

- Prefer CLI and local files for repo state.
- Use `tool_search` only when a deferred MCP/app tool is actually needed.
- Use MCP when it gives live structured context that local files cannot provide or when official docs are required.
- Use official OpenAI docs MCP for OpenAI API, ChatGPT Apps SDK, Codex, or other OpenAI developer-product questions.
- Do not use live-service write/delete tools without explicit approval unless the current task already grants that permission.

## Wave Sizing

Each plan or wave should fit into one focused session when possible. Before execution, record or infer:

- **Session slice:** what this session should complete.
- **Owned files/domains:** files, packages, routes, or systems this slice may change.
- **Dependencies:** prior plans, decisions, migrations, live-service state, or risky integrations.
- **Parallelism:** whether it can run beside other sessions and what must stay disjoint.
- **Stop condition:** the artifact and validation state required before pausing.

If a plan is too broad, split it before implementing. A good split is by route, package, flow, or validation layer, not by arbitrary task count.

## Execution Topology

Before multi-plan work, the agent should give Luca an operational topology without making him design it:

- Which work runs sequentially in the current session.
- Which work can run in parallel sessions.
- Which files/domains each session owns.
- Which work must not run in parallel because of shared files, migrations, auth/CSP risk, product-decision coupling, or likely merge conflicts.
- Whether the current branch is enough or separate worktrees/branches are safer.
- Copy-paste prompts for parallel sessions when useful.

Use separate worktrees or branches for true parallel implementation if sessions could touch overlapping files or long-lived shared state. Sequential work on the same branch is fine when the scope is narrow and the previous slice has been summarized.

## Handoff Contract

Before stopping a substantial session, update durable artifacts:

- `*-SUMMARY.md` for completed plans.
- `STATE.md` when active phase, next action, validation status, or blockers change.
- `ROADMAP.md` when phase status changes.
- Test and validation notes with exact commands and pass/fail outcomes.
- Known blockers, assumptions, and the next recommended session prompt.

The next session must be able to start from `AGENTS.md`, `STATE.md`, phase context, relevant plan/summary files, and this playbook without relying on chat history.

### Next-Session Prompt

Every completed plan or wave must end with a concise copy-paste prompt for the next recommended session. This is required even when there are no blockers. The prompt is not a full recap; it should be a short start command for the likely next phase/wave with only the facts the next Codex session needs.

Size the next prompt deliberately. It should assign work that fits one focused clean session: usually one plan/wave, or at most two tightly coupled small plans that share context and validation. Do not hand off a vague backlog, a whole milestone, or work so tiny that a fresh session would waste setup overhead. If the next work is too large, split it and hand off only the first coherent slice.

Include:

- what just finished, in one short clause;
- what to read first;
- the next plan/wave to execute or verify;
- why the selected scope fits one session when that is not obvious;
- owned files/domains and explicit exclusions only if overlap risk exists;
- required validation and handoff artifacts.

Keep it around 5-8 lines. Do not include long explanations, duplicate the summary, paste diffs, or restate generic project rules already covered by `AGENTS.md`.

Use this format in the final answer and, when relevant, in the `*-SUMMARY.md`:

```text
Next session prompt:
Read AGENTS.md, .planning/STATE.md, .planning/AGENT-OPERATING-MODEL.md, and <active phase context>.
Previous session completed <plan/wave>; validation: <short commands/results>.
Continue with <next plan/wave sized for one focused session>.
Owned files/domains: <scope if needed>.
Avoid: <excluded scope if needed>.
Before stopping, update <summary/state/roadmap/validation artifacts>.
```

## Risk Gates

Use a narrower session and stronger validation for:

- Auth, Supabase identity/session, Circle API, SSO, and email flows.
- CSP, nonce, proxy, middleware, headers, and deployment routing.
- Database migrations or live-service changes.
- Cross-app navigation between website and tools app.
- Product decisions that affect public copy, pricing, onboarding, or lead capture.

For those areas, do not ship guessed API shapes or unverified integration behavior. Prefer probing real APIs, official docs, local production smoke tests, and explicit validation notes.

## Default Parallelization Heuristic

Parallelize when all of these are true:

- Write scopes are disjoint.
- Tests can be run independently.
- One session's output is not required to design the other.
- Merge order is obvious.

Keep work sequential when any of these are true:

- Shared layout, theme, middleware, schema, or auth files are involved.
- One plan defines product semantics used by another.
- Both sessions would edit the same test fixtures or route components.
- A migration or live-service state change sits in the middle.

## Session Prompt Template

Use this shape for clean follow-up sessions:

```text
Read AGENTS.md, .planning/STATE.md, .planning/AGENT-OPERATING-MODEL.md, and the active phase context.
Work only on <plan/wave>.
Owned files/domains: <scope>.
Do not touch <excluded scope>.
Before stopping, update the plan summary, STATE.md, and validation notes.
End with a copy-paste next-session prompt.
```
