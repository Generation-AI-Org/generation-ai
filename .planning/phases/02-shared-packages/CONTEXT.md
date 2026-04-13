# Phase 2: Shared Packages — Context & Decisions

**Erstellt:** 2026-04-13
**Phase:** 02-shared-packages
**Status:** Geplant

---

## Entscheidungen

### D-01: Internal Packages ohne Build-Step

**Entscheidung:** Alle drei Packages (`auth`, `types`, `config`) sind Internal Packages ohne eigenen Build-Step. `main` zeigt direkt auf TypeScript-Sourcen (`./src/index.ts`).

**Begruendung:** 
- Turborepo-Empfehlung fuer monorepo-interne Packages
- Next.js transpiliert externe Packages automatisch
- Kein zusaetzlicher Bundling-Overhead
- Schnellere Iteration (keine Build-Watcher noetig)

### D-02: Auth Package mit Subpath-Exports

**Entscheidung:** `@genai/auth` exportiert via Subpaths: `/browser`, `/server`, `/admin`, `/helpers`.

**Begruendung:**
- Verhindert versehentlichen Import von Server-Code im Browser-Bundle
- Service Role Key wuerde sonst im Client landen
- Explizite Trennung der Environments

### D-03: Cookie-Options als Parameter

**Entscheidung:** `@genai/auth/browser` akzeptiert optionale `cookieOptions`. Die tools-app uebergibt `domain: '.generation-ai.org'`, die website verwendet Defaults.

**Begruendung:**
- Beide Apps haben unterschiedliche Cookie-Anforderungen
- tools-app braucht Cross-Subdomain-Sharing
- website braucht keine spezielle Domain
- Flexibler als hardcodierte Werte im Package

### D-04: Content-Types shared, Chat-Types lokal

**Entscheidung:** `ContentType`, `ContentItem`, `ContentItemMeta`, `ContentSource` werden in `@genai/types` extrahiert. `ChatMessage`, `ChatMode`, `RecommendationResponse`, KB-Tool-Types bleiben in `apps/tools-app/lib/types.ts`.

**Begruendung:**
- Content-Types werden shared wenn Website Tool-Cards anzeigt
- Chat ist tools-app-Feature, keine Cross-App-Nutzung geplant
- KB-Tool-Types sind interne Implementation Details

### D-05: Tailwind CSS shared via @import

**Entscheidung:** `@genai/config/tailwind/base.css` enthaelt gemeinsame Design Tokens. Apps importieren via `@import "@genai/config/tailwind/base.css"` und fuegen app-spezifische Styles hinzu.

**Begruendung:**
- Tailwind v4 ist CSS-first, kein JS-Preset
- PostCSS loest node_modules-Imports auf
- Design Tokens (:root Variablen) bleiben zentral
- App-spezifische Animations/Utilities bleiben lokal

### D-06: ESLint Config Re-Export Pattern

**Entscheidung:** `@genai/config/eslint/next.mjs` exportiert eine `nextConfig`. Apps importieren und re-exportieren. `eslint-config-next` bleibt als devDependency in jeder App.

**Begruendung:**
- eslint-config-next loest Plugins relativ auf
- Bei Installation nur im Package-Level entstehen Resolve-Fehler
- Re-Export-Pattern ist sicherer als komplette Zentralisierung

---

## Assumptions

| # | Assumption | Risiko wenn falsch | Validation |
|---|------------|-------------------|------------|
| A1 | Next.js 16 transpiliert Workspace-Packages automatisch | Build-Fehler, Fix: `transpilePackages` hinzufuegen | Beim ersten `pnpm build` testen |
| A2 | PostCSS loest `@import "@genai/..."` aus node_modules auf | CSS Import schlaegt fehl, Fix: relative Pfade | `pnpm dev` und Browser pruefen |
| A3 | `cookies()` Import aus Package funktioniert | Server-Client bricht, Fix: Funktion in App belassen | Server-Action testen |
| A4 | Beide Apps haben identische Supabase-Env-Vars | Auth bricht, Fix: Env-Namen angleichen | .env.local vergleichen |

---

## Offene Fragen (fuer spaetere Phasen)

### OQ-1: tools-app `lib/supabase.ts` bereinigen

Die tools-app hat ZWEI Supabase-Implementierungen:
1. `lib/supabase/` (korrekt, @supabase/ssr)
2. `lib/supabase.ts` (alt, roher @supabase/supabase-js mit t3-env)

**Betroffene Dateien:**
- `lib/content.ts` (4x createServerClient aus lib/supabase.ts)
- `lib/kb-tools.ts` (4x createServerClient)
- `app/api/chat/route.ts` (1x createServerClient)

**Empfehlung:** Nach Plan 02-01 diese Imports auf `@genai/auth/admin` umstellen und `lib/supabase.ts` loeschen. Kann in Plan 02-01 Task 3 oder als separater Cleanup-Task.

### OQ-2: Supabase Database Types generieren

Aktuell werden keine `database.types.ts` generiert. Das `packages/types/src/database.ts` ist ein Placeholder.

**Empfehlung:** In Phase 3 oder spaeter:
```bash
supabase gen types typescript --project-id wbohulnuwqrhystaamjc > packages/types/src/database.ts
```

### OQ-3: Website shadcn-spezifische Tokens

Die website hat zusaetzliche Tokens fuer shadcn-Kompatibilitaet (`--color-background`, `--color-foreground`, `--radius-*`). Diese bleiben in `apps/website/app/globals.css`, nicht im shared base.

---

## Dependency Graph

```
Phase 2 Plans:

Plan 02-01 (Auth)      Plan 02-02 (Types + Config)
     |                        |
     v                        v
   pnpm install (beide zusammen)
     |
     v
   pnpm dev (beide Apps testen)
```

Beide Plaene koennen parallel entwickelt werden, da keine direkten Abhaengigkeiten bestehen. `pnpm install` am Ende synchronisiert alles.

---

## Success Criteria (Phase 2)

- [ ] `@genai/auth` exportiert createClient, createAdminClient
- [ ] `@genai/types` exportiert Content-Types
- [ ] `@genai/config` exportiert tsconfig, eslint, tailwind
- [ ] Beide Apps importieren erfolgreich von packages
- [ ] `pnpm build` baut alles ohne Fehler
- [ ] Keine Breaking Changes an bestehenden Features
- [ ] Dark/Light Mode funktioniert in beiden Apps
