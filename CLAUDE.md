# Generation AI — Monorepo

> KI-Community fuer Studierende im DACH-Raum

---

## Session-Start Checkliste

**Bei jeder neuen Session zuerst:**

1. `.planning/STATE.md` lesen — aktueller Projekt-Status
2. `LEARNINGS.md` lesen — harte Lektionen aus Prod-Incidents (PFLICHT vor CSP/Proxy/Middleware-Änderungen)
3. `docs/ARCHITECTURE.md` scannen — System-Uebersicht
4. Bei API-Arbeit: `docs/API.md`
5. Bei Deploy: `docs/DEPLOYMENT.md`

---

## Das grosse Bild

```
┌─────────────────────────────────────────────────────────────────┐
│                     CIRCLE.SO (Zentrum)                         │
│                 community.generation-ai.org                     │
│            Community, Kurse, Events, Diskussionen               │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Soft SSO (gleiche Email)
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     │                     ▼
┌───────────────┐             │             ┌───────────────┐
│    WEBSITE    │─────────────┴─────────────│   TOOLS-APP   │
│  Landing Page │     Shared Supabase       │ KI-Bibliothek │
│   Sign-up     │     Auth Cookie           │    Chat       │
└───────────────┘                           └───────────────┘
```

**Circle ist das Zentrum** — dort findet die Community statt.
Website und tools-app sind Satellites/Zusatz-Tools.

---

## Was ist das?

Monorepo fuer alle Generation AI Web-Projekte:
- **Website** (generation-ai.org) — Landing, Sign-up, Auth
- **tools-app** (tools.generation-ai.org) — KI-Tool-Bibliothek + Chat
- **Shared Packages** — Auth, Types, Config

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
- **LLM:** Gemini 3 Flash (Agent) / Gemini 2.5 Flash-Lite (Public Chat)
- **Web Search:** Exa API
- **Rate Limiting:** Upstash Redis
- **Monitoring:** Sentry + Better Stack
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

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| `docs/ARCHITECTURE.md` | System-Uebersicht, Datenfluss, Schema |
| `docs/API.md` | Alle API-Endpoints dokumentiert |
| `docs/DEPLOYMENT.md` | Deploy-Flow, Env-Vars, Setup |
| `docs/decisions/` | Architektur-Entscheidungen |
| `.planning/STATE.md` | Aktueller Projekt-Status |

---

## Aktueller Status

**Sign-up:** DEAKTIVIERT (503)
- Reaktivieren: `apps/website/app/api/auth/signup/route.ts` aus Git-History

**Chat-Modi:**
- `public` — V1 Full-Context (Gemini 2.5 Flash-Lite)
- `member` — V2 Agent mit Tools (Gemini 3 Flash)

---

## Links

- **Live Website:** https://generation-ai.org
- **Live tools-app:** https://tools.generation-ai.org
- **Community:** https://community.generation-ai.org
- **Supabase:** wbohulnuwqrhystaamjc.supabase.co
- **GitHub:** https://github.com/Generation-AI-Org/generation-ai

## Team

- **Luca Schweigmann** — Tech Lead / CTO

---

## Claude Code Regeln fuer dieses Projekt

1. **GSD-Workflow nutzen** — `.planning/STATE.md` ist Source of Truth
2. **Vor /clear:** STATE.md updaten
3. **Nach /clear:** STATE.md + diese Datei lesen
4. **Kein Push ohne OK** — Immer Luca fragen
5. **Kein Prod-Deploy ohne OK** — Preview ist okay
6. **Tests laufen lassen** — `pnpm test` vor groesseren Aenderungen
