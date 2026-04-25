---
phase: 25
plan: I
slug: docs-changeset-and-vercel-env
status: complete
completed: 2026-04-24
executed_by_script: false
---

# Plan 25-I SUMMARY — Docs + Changeset + HUMAN-UAT

## What was built

- `docs/CIRCLE-INTEGRATION.md` — full reorganization: Architektur-Überblick, Key-Files, Setup, Email-Dashboard-Import (from C), Waitlist-Re-Invite (from G), Troubleshooting, Monitoring.
- `docs/ARCHITECTURE.md` — Phase 25 additions to Sign-up-Flow section + `user_circle_links` block in Schema section.
- `docs/API.md` — 2 new endpoint blocks (`POST /api/auth/signup`, `POST /api/admin/circle-reprovision`) replacing the old "DEAKTIVIERT" stub.
- `.changeset/phase-25-circle-api-sync.md` — minor bump `@genai/website` + patch `@genai/auth` + patch `@genai/emails` (linked config matches `pnpm-workspace.yaml`).
- `.planning/phases/25-circle-api-sync/25-HUMAN-UAT.md` — 4-section checklist (Pre-Launch / Launch-Day / Post-Launch / Rollback) collecting all manual steps from Plans A-H.

## Key files

- `docs/CIRCLE-INTEGRATION.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `.changeset/phase-25-circle-api-sync.md`
- `.planning/phases/25-circle-api-sync/25-HUMAN-UAT.md`

## Verification

- All typecheck green except pre-existing phase-24 test error.
- Discovered Circle IDs documented: community `511295`, welcome space `2574363`.
- No secrets committed — all tokens are placeholders or `<real token>` markers.

## Deviations

- **Plan I frontmatter**: phase-plan-index reported `wave: 1` but PLAN frontmatter says `wave: 4 depends_on: A-H`. Executed per plan's declared dependencies (last after all others). Index-side inconsistency noted — not my fix to make here.
- **Task I4 marked `autonomous: false`**: per plan, file was written but not executed. Luca drives the checklist.

## Hand-off

- Phase 25 code/docs complete. Verifier agent runs next.
- Luca's responsibilities captured in `25-HUMAN-UAT.md`:
  - Circle token + Community/Space IDs into Vercel env (Sentry DSN too)
  - Supabase email-template paste (confirm-signup.html)
  - Preview E2E + negative test
  - Phase-27 flip + post-launch re-invite script run
