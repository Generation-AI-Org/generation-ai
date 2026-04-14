# Generation AI — Monorepo

> KI-Community für Studierende im DACH-Raum

## Was ist das?

Monorepo für alle Generation AI Web-Projekte:
- **Website** (generation-ai.org) — Landing, Sign-up, Auth
- **tools-app** (tools.generation-ai.org) — KI-Tool-Bibliothek + Chat
- **Shared Packages** — Auth, UI, Types, Config

## Struktur

```
generation-ai/
├── apps/
│   ├── website/          ← Next.js 16, Landing + Sign-up
│   └── tools-app/        ← Next.js 16, Bibliothek + Chat
├── packages/
│   ├── auth/             ← Supabase Client, Session Helpers
│   ├── ui/               ← Shared Components
│   ├── types/            ← Shared TypeScript Types
│   └── config/           ← Tailwind, ESLint, TSConfig
├── docs/
│   ├── decisions/        ← Architektur-Entscheidungen
│   └── MIGRATION.md      ← Migration Notes
├── .planning/            ← GSD Artefakte
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Commands

```bash
pnpm install              # Dependencies installieren
pnpm dev                  # Alle Apps starten
pnpm dev:website          # Nur Website
pnpm dev:tools            # Nur tools-app
pnpm build                # Alle Apps bauen
pnpm lint                 # Linting
```

## Tech Stack

- **Framework:** Next.js 16, React 19
- **Styling:** Tailwind v4
- **Auth:** Supabase (shared instance)
- **Email:** Resend
- **LLM:** Claude API
- **Hosting:** Vercel
- **Monorepo:** Turborepo + pnpm

## GSD Workflow

Siehe `.planning/STATE.md` für aktuellen Stand.

```
/gsd-progress             # Status checken
/gsd-plan-phase N         # Phase planen
/gsd-execute-phase N      # Phase ausführen
```

## Changelog & Versioning

Wir nutzen [Changesets](https://github.com/changesets/changesets) für Versionierung und Changelog-Generierung.

### Bei jeder Änderung (Feature, Fix, etc.)

```bash
pnpm changeset            # Interaktiv: Welche Packages? Major/Minor/Patch? Beschreibung?
git add .changeset/       # Changeset-Datei committen
git commit                # Normaler Commit
```

### Bei Release (Ende eines Milestones)

```bash
pnpm version              # Generiert CHANGELOGs, bumpt Versionen
git add -A && git commit -m "chore: release"
git tag vX.Y.Z
git push --follow-tags
gh release create vX.Y.Z  # GitHub Release erstellen
```

### Config

- `linked: [website, tools-app]` — Apps werden zusammen versioniert
- `@changesets/changelog-github` — Verlinkt PRs/Commits in Changelogs
- `ignore: [@genai/config]` — Config-Package wird nicht versioniert

### Wichtig

- **Jede nicht-triviale Änderung braucht ein Changeset**
- Changeset-Dateien werden mit dem Feature-Commit committed
- CHANGELOG.md wird automatisch generiert — nicht manuell editieren

## Links

- **Live Website:** https://generation-ai.org
- **Live tools-app:** https://tools.generation-ai.org
- **Community:** https://community.generation-ai.org
- **Supabase:** wbohulnuwqrhystaamjc.supabase.co

## Team

- **Luca Schweigmann** — Tech Lead / CTO
