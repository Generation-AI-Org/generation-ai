---
phase: 27
slug: copy-pass-and-launch-cleanup
type: plan
status: planned
created: 2026-04-26
branch: feature/phase-27-copy-cleanup
depends_on:
  - 20.6 accepted
  - 21 passed
  - 22 passed
  - 22.6 accepted
  - 22.8 complete
  - 23 accepted
  - 24 accepted
  - 25 code-complete, external launch gate open
  - 26 accepted
---

# Phase 27 Plan — Copy-Pass & Launch-Cleanup

## Goal

Make `develop` launch-ready for the v4 website: final public copy, no obvious placeholders, complete SEO/metadata, clean navigation, production-safe error surfaces, and a documented signup/Circle launch decision.

This phase does not ship production by itself. Production merge/deploy still needs Luca approval.

## Inputs

- `.planning/phases/27-copy-pass-and-launch-cleanup/27-CONTEXT.md`
- `.planning/AGENT-DESIGN-VOICE.md`
- `brand/VOICE.md`
- Janna/Sparring script from Luca, once provided
- Existing phase artifacts and current code on `develop`

## Non-Negotiables

- Keep structure stable. No new major pages or redesigns.
- Use German umlauts correctly.
- Use `Du`, short direct copy, no corporate filler.
- No production deploy, push, live-service write, or signup activation without explicit Luca approval.
- Circle/API identity work must not use guessed response shapes.

## Workstreams

### 27-01 Launch Blockers Sweep

Fix small structural gaps that are already known:

- Add `/events` to website header nav so website and tools-app navigation do not disagree.
- Check footer/nav labels after the recent same-tab Tools change.
- Remove or explicitly label any remaining launch-visible `Beispiel` / placeholder surfaces.
- Replace partner LinkedIn `href="#"` placeholders if real URLs are available; otherwise hide/disable links so no dead click ships.
- Verify `noreply@generation-ai.org` sender-domain note for Resend remains documented if not verified yet.

Verification:

- `pnpm --filter @genai/website exec tsc --noEmit`
- `pnpm --filter @genai/website build`
- Targeted grep for placeholder markers: `Beispiel`, `placeholder`, `TODO`, `href="#"`.

### 27-02 Copy Pass From Sparring Script

Apply Luca/Janna copy decisions across launch-critical pages:

- `/` Landing: Hero, problem block, offering, tool/community previews, trust, final CTA, Kurz-FAQ.
- `/about`: Mission, story, team roles, Verein copy, FAQ, CTAs.
- `/partner`: Hero, tabs, value props, form labels, transparency note.
- `/events`: Hero, format descriptions, members-only note, final CTA.
- `/join`: form labels, validation copy, success copy.
- `/test`: keep current content accepted; only adjust if the sparring script gives concrete wording.
- `/community`: Hero, pillars, article teaser copy, final CTA.
- tools-app logged-out surfaces: hero, registration/login labels, Lite/Pro copy.

Verification:

- Review against `brand/VOICE.md`.
- No `oe/ae/ue/ss` substitutions for German umlauts.
- No emoji in UI/buttons/labels.
- No button exclamation marks.

### 27-03 Real Content / Dummy Data Cleanup

Replace launch-visible dummy data where Luca provides assets/content:

- Events: 2-3 real upcoming events, 3 past events if available.
- Trust: real partner names/logos if available; otherwise use text-only claims that are not fake logos.
- `/about`: real team photos if available; otherwise keep intentional branded placeholders.
- `/partner`: real contact photos + LinkedIn URLs if available; otherwise no dead outbound links.
- Community articles: current MDX placeholders are accepted for launch-candidate state; only edit if the sparring script changes them.

Verification:

- MDX frontmatter validates.
- Event/article sitemap entries still build.
- No broken internal links.

### 27-04 SEO / Metadata / Schema Final

Make public routes search-ready:

- Titles and descriptions for `/`, `/about`, `/partner`, `/events`, `/join`, `/test`, `/community`.
- Canonical URLs.
- Sitemap includes all public launch routes.
- Robots excludes private/API surfaces where needed.
- Schema.org: Organization, Article, Event, FAQ where already supported or low-risk to add.
- OG/Twitter image behavior is consistent after Phase 22.8 favicon/OG changes.

Verification:

- `pnpm --filter @genai/website build`
- Inspect generated `/sitemap.xml` and `/robots.txt`.
- Source-smoke key pages for title/description/canonical/OG tags.

### 27-05 Error / Edge Surfaces

Close launch-visible rough edges:

- 404 page designed and brand-consistent.
- 500/global error surface if missing or too generic.
- Form error copy uses Voice.md.
- Empty states and fallback messages are not corporate or misleading.

Verification:

- Visit known 404s locally.
- Trigger safe client-side validation errors, not live destructive flows.

### 27-06 Final Local Verification

Run the launch-candidate local gate:

- `pnpm --filter @genai/website exec tsc --noEmit`
- `pnpm --filter @genai/tools-app exec tsc --noEmit`
- `pnpm --filter @genai/website test --run`
- Targeted Playwright for changed public routes if dev/prod server is available.
- `pnpm build`
- `git diff --check`

Expected result:

- 0 build/type errors.
- Existing lint warnings documented if unchanged.
- All changed launch routes remain CSP-safe dynamic where required.

### 27-07 Circle / Signup Launch Gate

Clarify but do not auto-execute:

- Phase 25 Circle-Sync means: after signup, website creates/confirms the Supabase user, provisions the user in Circle via Circle Admin API, stores the Circle link, and sends a flow that should get the user into Circle without a second signup.
- This needs real external setup: Circle API token, Vercel env vars, Supabase template, Sentry DSN, preview E2E, fallback test with bad token, bundle secret grep.
- `SIGNUP_ENABLED=true` in production is the launch switch. Do not change it without Luca approval.

Deliverable:

- A short `27-LAUNCH-CHECKLIST.md` stating: ready / blocked / needs Luca, with Circle launch gate explicit.

## Definition Of Done

- Known local UAT blockers from previous phases are closed or owner-accepted.
- Header/nav/SEO/copy/dummy-data launch blockers are addressed.
- Phase 25 Circle gate is documented with exact remaining owner actions.
- Final build/type/test gates are recorded.
- `27-SUMMARY.md` and `27-LAUNCH-CHECKLIST.md` exist.

## Copy-Paste Prompt For Next Session

Continue Phase 27 in `/Users/lucaschweigmann/projects/generation-ai`. Read `.planning/STATE.md`, `.planning/phases/27-copy-pass-and-launch-cleanup/27-CONTEXT.md`, `.planning/phases/27-copy-pass-and-launch-cleanup/27-PLAN.md`, `.planning/AGENT-DESIGN-VOICE.md`, and `brand/VOICE.md`. Start with 27-01 Launch Blockers Sweep, then wait for Luca's Janna/Sparring script before doing broad copy rewrites. Do not push, deploy, or enable production signup without explicit approval.
