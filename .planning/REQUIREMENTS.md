# Requirements — Generation AI Monorepo

## Functional Requirements

### R-01: Monorepo-Struktur
Die Projektstruktur folgt dem Turborepo-Pattern mit `apps/` und `packages/` Verzeichnissen.

### R-02: Website Migration
Der gesamte Code aus `GenerationAI/website/` wird nach `apps/website/` migriert und läuft ohne Änderungen an der Funktionalität.

### R-03: tools-app Migration
Der gesamte Code aus `GenerationAI/tools-app/` wird nach `apps/tools-app/` migriert und läuft ohne Änderungen an der Funktionalität.

### R-04: Shared Auth Package
Supabase Client-Setup und Session-Helpers werden in `packages/auth/` extrahiert. Beide Apps importieren von `@genai/auth`.

### R-05: Shared Types Package
Gemeinsame TypeScript Types (User, Profile, etc.) werden in `packages/types/` definiert. Beide Apps importieren von `@genai/types`.

### R-06: Shared Config Package
Tailwind-Preset, ESLint-Config und TSConfig werden in `packages/config/` zentralisiert.

### R-07: Vercel Deployment
Beide Apps deployen erfolgreich von einem GitHub Repo mit separaten Vercel Projects (Root Directory Einstellung).

### R-08: Environment Variables
Alle Environment Variables werden korrekt in beiden Vercel Projects konfiguriert.

## Non-Functional Requirements

### N-01: Unified Dev Command
`pnpm dev` startet beide Apps gleichzeitig. `pnpm dev:website` und `pnpm dev:tools` starten einzelne Apps.

### N-02: Build Caching
Turborepo cached Builds — unveränderte Packages/Apps werden nicht neu gebaut.

### N-03: Dependency Consistency
Alle Apps nutzen identische Versionen von shared dependencies (React, Next.js, Supabase, etc.).

### N-04: Zero Downtime
Die Migration verursacht keine Ausfallzeit der Live-Apps.

## Out of Scope

- UI Component Library (packages/ui) — optional, nur wenn sinnvoll
- Neue Features (Assessment, Blog, etc.)
- Circle-Integration
- CI/CD Pipeline (kommt später)

## Dependencies

| Requirement | Depends On |
|-------------|------------|
| R-04, R-05, R-06 | R-02, R-03 |
| R-07, R-08 | R-02, R-03, R-04, R-05 |
