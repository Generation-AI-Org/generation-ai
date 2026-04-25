# Community Articles — Authoring Guide

MDX-Files in this directory render at `/community/artikel/[slug]`.

## Frontmatter (all fields required)

| Field       | Type                     | Notes                                                                 |
| ----------- | ------------------------ | --------------------------------------------------------------------- |
| title       | string                   | Display title — German allowed (ä/ö/ü/ß).                             |
| slug        | string                   | MUST match filename (without `.mdx`).                                 |
| date        | YYYY-MM-DD               | ISO date, used for sort + sitemap lastModified.                       |
| readingTime | number                   | Minutes — author estimate.                                            |
| kind        | "artikel" \| "ki-news"   | KI-News articles render with badge.                                   |
| circleUrl   | string                   | Link to the original Circle post — TRUSTED, not validated at build (D-14). |
| excerpt     | string                   | Used for teaser cards + OG description.                               |

## Naming Convention

- Articles: `kebab-case-title.mdx` (e.g. `bachelorarbeit-mit-claude.mdx`)
- KI-News: `ki-news-kw{NN}-{YYYY}.mdx` (D-23, e.g. `ki-news-kw17-2026.mdx`)

## Body

2-3 short paragraphs. **Do NOT add a „Weiterlesen in der Community"-Link
yourself** — the `/community/artikel/[slug]` page renders that CTA
automatically using `circleUrl` from the frontmatter. Adding one in the body
results in a duplicate link.

## After Adding a File

`git add` + `git commit` + `git push main` triggers Vercel auto-deploy. The new
article appears in the carousel + sitemap within ~1 build cycle (D-16). No
webhook setup needed.

## Validation

Frontmatter is hard-validated at first read. A missing field throws a build
error like:

> [mdx/community] Missing frontmatter field "readingTime" in content/community/foo.mdx

Fail-loud is intentional — a half-broken article should not silently render.
