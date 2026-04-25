---
phase: 24
plan: 03
title: Content — questions.json + level profiles MDX + community index
status: complete
completed: 2026-04-24
---

# Plan 24-03 — Summary

## Outcome

All content for the assessment is in place: 10 questions covering 8 widget types, 5 level-profile MDX files, 15 curated community recommendations, plus helper loaders and integrity tests.

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-03-01 | Draft questions.json — 10 questions | ✓ |
| 24-03-02 | 5 level-profile MDX files | ✓ |
| 24-03-03 | community-index.json — 15 curated recs | ✓ |
| 24-03-04 | profiles.ts + load-questions.ts + load-community.ts | ✓ |
| 24-03-05 | Content integrity test (7 cases) | ✓ |

## Key-files

### created
- `apps/website/content/assessment/questions.json`
- `apps/website/content/assessment/community-index.json`
- `apps/website/content/assessment/profiles/neugieriger.mdx`
- `apps/website/content/assessment/profiles/einsteiger.mdx`
- `apps/website/content/assessment/profiles/fortgeschritten.mdx`
- `apps/website/content/assessment/profiles/pro.mdx`
- `apps/website/content/assessment/profiles/expert.mdx`
- `apps/website/lib/assessment/profiles.ts`
- `apps/website/lib/assessment/load-questions.ts`
- `apps/website/lib/assessment/load-community.ts`
- `apps/website/lib/assessment/__tests__/content.test.ts`

## Deviations

None. Content drafted per spec — Luca reviews post-execute for tone/accuracy (D-09).

## Verification

- 10 questions, 8 widget types, 2 per dimension, totalPoints = 30 ✓
- 15 community entries, every level has ≥5 recs (min required 3) ✓
- 5 MDX profiles, 80-94 words each, build passes ✓
- 19 tests green across scoring + content suites
