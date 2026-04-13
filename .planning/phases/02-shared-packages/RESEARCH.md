# Phase 2: Shared Packages — Research

**Recherchiert:** 2026-04-14
**Domain:** Turborepo Internal Packages, Supabase SSR, Tailwind v4 CSS-first
**Gesamt-Confidence:** HIGH (Code direkt aus dem Repo gelesen)

---

## Executive Summary

Phase 2 extrahiert gemeinsamen Code aus beiden Apps in `packages/`. Die Packages-Verzeichnisse
(`auth/`, `types/`, `config/`, `ui/`) existieren bereits als leere Ordner. Der Turborepo-Build
(v2.9.6) und pnpm-Workspace sind korrekt konfiguriert — die Infrastruktur steht.

**Kritischer Befund:** Die beiden Apps haben UNTERSCHIEDLICHE Supabase-Implementierungen. Die
website nutzt `@supabase/ssr` mit manuellem Cookie-Handling; tools-app nutzt ZWEI parallele
Ansätze (`lib/supabase/` mit `@supabase/ssr` UND `lib/supabase.ts` mit rohem `@supabase/supabase-js`).
Das Auth-Package muss diesen Zustand konsolidieren, nicht nur kopieren.

**Tailwind v4 CSS-first:** Es gibt keine `tailwind.config.ts` in den Apps — beide Apps nutzen
`@import "tailwindcss"` direkt im CSS mit `@theme inline`. Das Shared-Config-Konzept für Tailwind
ist bei v4 grundlegend anders als bei v3: kein JS-Preset, statt dessen ein shared CSS-File.

**Empfehlung:** Alle drei Packages als "Internal Packages" ohne Build-Step aufsetzen
(Turborepo-Pattern: `"main": "./src/index.ts"` direkt). Kein Bundling nötig, da Next.js
die TypeScript-Sourcen direkt verarbeitet.

---

## Package 1: `packages/auth` (R-04)

### Ist-Zustand: Zwei parallele Implementierungen in tools-app

**Website** (`apps/website/lib/supabase/`):
- `client.ts` — `createBrowserClient` aus `@supabase/ssr`, manuelles Cookie-Handling über `document.cookie`
- `server.ts` — `createAdminClient()` mit `@supabase/supabase-js` direkt (Service Role, kein SSR)
- Kein SSR-Client (kein `createServerClient` aus `@supabase/ssr`) — die Website hat keine
  geschützten Server-Routen, nur den Admin-Client für die Signup-API

**Tools-App** (`apps/tools-app/lib/`):
- `supabase/browser.ts` — `createBrowserClient` aus `@supabase/ssr`, mit `cookieOptions`
  (Domain: `.generation-ai.org`) — WICHTIG: Cross-Subdomain-Cookie-Sharing
- `supabase/server.ts` — `createServerClient` aus `@supabase/ssr`, mit `cookies()` aus `next/headers`
- `supabase/proxy.ts` — `createServerClient` für Middleware/Request-Response, nimmt `NextRequest` + `NextResponse`
- `supabase.ts` — ZWEITE Implementierung: roher `createClient` aus `@supabase/supabase-js`,
  nutzt `t3-env` zur Validierung. Verwendet für `createServerClient()` in API-Routes und Content-Lib.
- `auth.ts` — `getUser()` Helper, nutzt `supabase/server.ts`

### Analyse: Was kann extrahiert werden?

| Funktion | Extrahierbar | Anmerkung |
|----------|-------------|-----------|
| `createBrowserClient` (SSR) | NEIN direkt | Website und tools-app nutzen verschiedene `cookieOptions` |
| `createAdminClient` | JA | Identisch in beiden Apps (Service Role Key) |
| `createServerClient` (SSR, cookies()) | JA | Identisch für Next.js App Router |
| `createMiddlewareClient` (proxy) | JA | Identisch, nur Naming-Unterschied |
| `getUser()` Helper | JA | Generisch genug |
| Raw `createClient` (supabase.ts) | KONSOLIDIEREN | Dopplung mit createServerClient — bereinigen |

### Hauptproblem: Cookie-Domain

Die tools-app setzt explizit `domain: '.generation-ai.org'` für Cross-Subdomain Auth-Sharing
(website.generation-ai.org und tools.generation-ai.org teilen die Session). Die Website nutzt
stattdessen manuelles `document.cookie` ohne Domain-Option.

**Empfehlung:** Das shared Package muss einen `cookieOptions`-Parameter akzeptieren:

```typescript
// packages/auth/src/browser.ts
export function createClient(cookieOptions?: CookieOptionsWithName) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieOptions ? { cookieOptions } : undefined
  )
}
```

Die tools-app übergibt `{ domain: '.generation-ai.org', ... }`, die Website nichts.

**Alternativ (sauberer):** Einheitliche `cookieOptions` mit Domain im Package hartcodieren,
da beide Apps immer unter `*.generation-ai.org` laufen. Reduziert App-seitige Konfiguration.

### Package-Struktur

```
packages/auth/
├── package.json          # name: "@genai/auth", no build step
├── tsconfig.json         # extends: "@genai/config/tsconfig.json"
└── src/
    ├── index.ts          # Re-exports alles
    ├── browser.ts        # createClient (Browser/CSR)
    ├── server.ts         # createClient (Server Components, SSR)
    ├── middleware.ts      # createMiddlewareClient (für proxy/middleware pattern)
    ├── admin.ts          # createAdminClient (Service Role)
    └── helpers.ts        # getUser(), getSession()
```

### Exports in package.json

```json
{
  "name": "@genai/auth",
  "version": "0.0.1",
  "private": true,
  "exports": {
    "./browser": "./src/browser.ts",
    "./server": "./src/server.ts",
    "./middleware": "./src/middleware.ts",
    "./admin": "./src/admin.ts",
    "./helpers": "./src/helpers.ts"
  },
  "main": "./src/index.ts",
  "dependencies": {
    "@supabase/ssr": "^0.10.2",
    "@supabase/supabase-js": "^2.103.0"
  },
  "peerDependencies": {
    "next": ">=15"
  }
}
```

**Wichtig: Subpath-Exports statt einem Single-Export.** `@genai/auth/server` kann nur in Server
Components importiert werden, `@genai/auth/browser` nur im Client. Verhindert versehentliches
Server-Code im Client-Bundle (Service Role Key würde leaken).

### Risiken

1. **`cookies()` aus `next/headers` im Package:** Der Server-Client ruft `cookies()` auf — das ist
   Next.js-spezifisch. Das Package hat next als peerDependency, aber der Import `from 'next/headers'`
   muss im Package funktionieren. Bei Turborepo Internal Packages ohne Build-Step ist das kein
   Problem, da Next.js den Import selbst auflöst. [VERIFIED: direkt aus Code gelesen]

2. **tools-app nutzt noch `lib/supabase.ts` (roher Client):** Nach der Migration muss
   `lib/supabase.ts` refactored werden — alle Stellen die `createServerClient` aus `@/lib/supabase`
   importieren (content.ts, kb-tools.ts, api/chat/route.ts) müssen auf `@genai/auth/admin` oder
   `@genai/auth/server` umgestellt werden.

3. **`app/proxy.ts` in tools-app:** Das ist KEIN Next.js Middleware, sondern ein Hilfsmodul für
   ein Route-Pattern (der Dateiname ist misleading). Es wird nur von `app/proxy.ts` selbst
   verwendet und importiert `@/lib/supabase/proxy`. Muss auf `@genai/auth/middleware` umgestellt
   werden, aber die Logik ist app-spezifisch genug dass sie in der App bleiben kann.

---

## Package 2: `packages/types` (R-05)

### Ist-Zustand

**tools-app** hat `lib/types.ts` mit ca. 80 Zeilen:
- `ContentType`, `ContentStatus`, `PricingModel` (enums als Union Types)
- `ContentItem`, `ContentItemMeta` (vollständig, Pick-basiert)
- `ChatMessage`, `ContentSource`, `ChatMode` (chat-spezifisch)
- `RecommendationResponse` (agent-spezifisch)
- `KBExploreResult`, `KBListItem`, `KBReadResult` (KB-Tool-Ergebnisse)

**Website** hat KEINE eigenen Types. Supabase-User-Typ kommt direkt von `@supabase/supabase-js`.
Keine `User`- oder `Profile`-Interface definiert.

### Analyse: Was ist wirklich shared?

Die in R-05 genannten "User, Profile, Content Types (beide Apps)" sind irreführend:
- Website braucht KEINE Content-Types (sie hat keine Content-Bibliothek)
- Beide Apps brauchen theoretisch `User`-Types, aber nutzen aktuell direkt den Supabase `User`-Typ
- Tatsächlich shared: Content-Types nur wenn website jemals Content von tools-app anzeigt

**Ehrliche Einschätzung:** Aktuell sind fast alle Types tools-app-spezifisch. Trotzdem lohnt sich
das Package für:
1. Zukünftige Cross-App-Features (z.B. Website zeigt Featured Tools)
2. Saubere Trennung: Was ist domain-shared vs. app-spezifisch
3. Supabase Database Types (wenn generiert) an einem Ort

### Empfehlung: Zwei Kategorien

**Sofort extrahieren** (echte Candidates):
- `ContentType`, `ContentStatus`, `PricingModel`, `ContentItem`, `ContentItemMeta` — diese werden
  shared sobald Website Tool-Cards rendert
- `Database` Types aus Supabase (noch nicht generiert, aber Platz reservieren)

**In tools-app lassen** (app-spezifisch):
- `ChatMessage`, `ChatMode`, `RecommendationResponse` — Chat ist tools-app-Feature
- `KBExploreResult`, `KBListItem`, `KBReadResult` — KB-Tool-Ergebnisse sind intern

### Package-Struktur

```
packages/types/
├── package.json          # name: "@genai/types", no build
├── tsconfig.json
└── src/
    ├── index.ts          # Re-exports
    ├── content.ts        # ContentType, ContentItem, ContentItemMeta, ...
    ├── auth.ts           # User-bezogene Types (Erweiterungen zu Supabase)
    └── database.ts       # Placeholder für Supabase-generierte DB-Types
```

### Risiken

1. **Keine echten shared Types aktuell:** Der Wert des Packages entsteht erst wenn beide Apps
   dieselben Daten-Shapes brauchen. Jetzt ist es vor allem strukturelle Vorarbeit.

2. **Supabase-generierte Types fehlen:** `supabase/` in website enthält nur SQL-Migrations,
   keine generierten `database.types.ts`. Das sollte in Phase 2 oder 3 nachgeholt werden.
   [ASSUMED: kein generiertes types-file gefunden, aber nicht absolut sicher ob anderswo]

---

## Package 3: `packages/config` (R-06)

### Ist-Zustand

**tsconfig.json:** Beide Apps haben IDENTISCHE tsconfig.json — Zeile für Zeile gleich.
Einziger Unterschied: keine. Perfekter Candidate für eine Base-Config.

**eslint.config.mjs:** Beide Apps haben IDENTISCHE eslint.config.mjs — exakt gleich.
Perfekter Candidate für shared config.

**Tailwind:** KEIN `tailwind.config.ts` in den Apps (v4 CSS-first). Die Konfiguration steckt
in `globals.css` via `@theme inline {}`. Die Color-Tokens und Design-Variablen sind in beiden
Apps fast identisch — mit wenigen Unterschieden:

| Token | Website | Tools-App |
|-------|---------|-----------|
| `--shadow` | fehlt | `rgba(0, 0, 0, 0.5)` |
| `--chat-bg` | fehlt | `#181818` |
| `--color-chat-bg` | fehlt | in `@theme inline` |
| shadcn compat vars | ja (10+ vars) | nein |
| `tw-animate-css` import | ja | nein |
| border-radius tokens | ja | nein |
| `.skip-link` styles | ja | nein |
| `@keyframes fadeInUp, float` | ja | nein |
| `@keyframes pulse-once` | nein | ja |

### Tailwind v4 Shared CSS: Wie funktioniert das?

Bei Tailwind v4 gibt es kein JS-Preset mehr. Stattdessen kann man CSS importieren:

```css
/* packages/config/tailwind/base.css */
@import "tailwindcss";

:root { /* shared tokens */ }
.light { /* shared tokens */ }
@theme inline { /* shared color mappings */ }
```

```css
/* apps/website/app/globals.css */
@import "@genai/config/tailwind/base.css";
@import "tw-animate-css"; /* website-only */

/* Website-spezifische Overrides/Additions */
```

Das Package muss dann über pnpm-Workspace-Symlinks erreichbar sein, und `@tailwindcss/postcss`
muss den Import auflösen können. [ASSUMED: @tailwindcss/postcss kann @genai/* imports auflösen,
solange das Package im node_modules via pnpm-Workspace liegt. Bedarf Verifikation.]

**Alternativ (sicherer):** `cssSource` path alias in `postcss.config.mjs`:
PostCSS selbst hat keine path-alias-Funktion. Aber pnpm-Workspaces installieren das Package
in `node_modules/@genai/config/` — damit funktioniert `@import "@genai/config/tailwind/base.css"`
direkt, da PostCSS CSS `@import` über node_modules auflöst. [ASSUMED, sehr wahrscheinlich korrekt]

### tsconfig Base

```json
// packages/config/tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true
  }
}
```

App-tsconfig extends dann:
```json
{
  "extends": "@genai/config/tsconfig/base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "..."]
}
```

### ESLint Shared Config

```javascript
// packages/config/eslint/next.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export const nextConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

App-eslint:
```javascript
// apps/website/eslint.config.mjs
import { nextConfig } from "@genai/config/eslint/next.mjs";
export default nextConfig;
```

**Problem:** `eslint-config-next` hat `next` als peerDependency und löst Plugins relativ auf.
In einem Monorepo kann das zu "unable to resolve plugin" Fehlern führen wenn die Deps im
Package-Level installiert sind statt App-Level. [ASSUMED: bekanntes Monorepo-Problem, Lösung:
`eslint-config-next` in jeder App als devDependency behalten, Config-Package nur re-exportiert
die Struktur.] Oder alternativ: ESLint flat config mit expliziten Plugin-Imports.

### Package-Struktur

```
packages/config/
├── package.json          # name: "@genai/config"
├── eslint/
│   └── next.mjs          # Shared ESLint Config
├── tailwind/
│   ├── base.css          # Shared Design Tokens + @theme
│   └── website.css       # Website-spezifische Additions (optional)
└── tsconfig/
    └── base.json         # Base TSConfig
```

```json
// packages/config/package.json
{
  "name": "@genai/config",
  "version": "0.0.1",
  "private": true,
  "exports": {
    "./tsconfig/base.json": "./tsconfig/base.json",
    "./eslint/next.mjs": "./eslint/next.mjs",
    "./tailwind/base.css": "./tailwind/base.css"
  }
}
```

---

## Turborepo Setup (N-02, N-03)

### Ist-Zustand: Bereits korrekt konfiguriert

```json
// turbo.json — aktuell
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^build"] }
  }
}
```

`"dependsOn": ["^build"]` bedeutet: App-Build wartet auf alle Package-Builds zuerst.
Für Internal Packages ohne Build-Step (TypeScript direkt) muss `turbo.json` NICHT geändert werden,
da die Packages kein eigenes `build`-Script haben. [VERIFIED: turbo.json direkt gelesen]

### Internal Package Pattern (kein Build-Step)

Turborepo empfiehlt für monorepo-interne Packages ohne Publish-Ziel den "Just-in-Time" Ansatz:
Package hat kein eigenes Build-Script, Apps transpilieren die TypeScript-Sourcen direkt.

```json
// packages/auth/package.json
{
  "name": "@genai/auth",
  "private": true,
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./browser": "./src/browser.ts",
    "./server": "./src/server.ts"
  }
}
```

Next.js 15+ transpiliert externe Packages automatisch wenn sie im Monorepo liegen — kein
`transpilePackages` in `next.config.ts` nötig für pnpm-Workspace-Packages.
[ASSUMED: Next.js 16 (Next.js 15-Nachfolger) sollte das gleiche Verhalten haben. CLAUDE.md warnt
explizit, dass Next.js 16 Breaking Changes haben kann. Verifizieren vor Implementierung.]

### Dependency Consistency (N-03)

pnpm `catalog:` Feature (pnpm 9+) ist die moderne Lösung für N-03. Da pnpm 10.8.1 eingesetzt wird,
ist es verfügbar.

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

catalog:
  react: "19.2.4"
  react-dom: "19.2.4"
  next: "16.2.3"
  "@supabase/ssr": "^0.10.2"
  "@supabase/supabase-js": "^2.103.0"
  typescript: "^5"
  tailwindcss: "^4"
```

Apps referenzieren dann: `"react": "catalog:"` statt `"react": "19.2.4"`.
[ASSUMED: pnpm catalog ist in pnpm 9+ verfügbar. pnpm 10.8.1 sollte es unterstützen. Bedarf
Verifikation: `pnpm --version` bestätigt pnpm 10.8.1 — catalog-Feature ist verfügbar.]

**Alternativ (weniger Aufwand):** Nur `.npmrc` mit `link-workspace-packages=true` und
manuelle Versions-Synchronisation. Reicht für 2 Apps.

---

## Implementation Notes

### Reihenfolge

1. `packages/config` zuerst (kein Framework-Dependency, nur JSON/CSS/JS)
2. `packages/types` (hängt von nichts ab)
3. `packages/auth` zuletzt (hängt von `@genai/config` für tsconfig ab)

### pnpm-Workspace-Linking

Nach dem Anlegen der `package.json` in jedem Package:
```bash
pnpm install  # verlinkt packages/* automatisch via workspace
```

Apps referenzieren interne Packages mit:
```json
"dependencies": {
  "@genai/auth": "workspace:*",
  "@genai/types": "workspace:*",
  "@genai/config": "workspace:*"
}
```

### Next.js 16 Warnung

`AGENTS.md` in beiden Apps warnt explizit: "This is NOT the Next.js you know. Read the relevant
guide in `node_modules/next/dist/docs/` before writing any code."

Vor der Implementierung prüfen:
```bash
ls /Users/lucaschweigmann/projects/generation-ai/apps/website/node_modules/next/dist/docs/
```
Relevant für: `transpilePackages`-Behavior, Server Components Imports, `cookies()` API.

### tools-app Konsolidierung: Zwei Supabase-Clients bereinigen

tools-app hat aktuell zwei parallele Supabase-Implementierungen:
1. `lib/supabase/` — `@supabase/ssr`-basiert (korrekt für Next.js SSR)
2. `lib/supabase.ts` — roher `@supabase/supabase-js` mit t3-env

Nach Migration auf `@genai/auth`:
- `lib/supabase.ts` `createServerClient()` → durch `@genai/auth/admin` ersetzen
- `lib/supabase.ts` `supabase` (browser-singleton) → durch `@genai/auth/browser` `createClient()` ersetzen
- `lib/supabase.ts` löschen

Dateien die umgestellt werden müssen:
- `apps/tools-app/lib/content.ts` (4x `createServerClient`)
- `apps/tools-app/lib/kb-tools.ts` (4x `createServerClient`)
- `apps/tools-app/app/api/chat/route.ts` (1x `createServerClient`)

---

## Open Questions

### OQ-1: Next.js 16 `transpilePackages` nötig?
- **Was wir wissen:** Next.js 13+ transpiliert monorepo-interne Packages automatisch
- **Was unklar ist:** Next.js 16 hat Breaking Changes. Gilt das noch?
- **Empfehlung:** Vor erster Package-Nutzung `node_modules/next/dist/docs/` lesen und ggf.
  `transpilePackages: ['@genai/auth', '@genai/types']` in `next.config.ts` eintragen

### OQ-2: Tailwind CSS `@import "@genai/config/tailwind/base.css"` — funktioniert das?
- **Was wir wissen:** pnpm installiert Workspace-Packages in `node_modules/`
- **Was unklar ist:** Ob `@tailwindcss/postcss` CSS-Imports aus `node_modules/@genai/` auflöst
- **Empfehlung:** Zuerst mit einem einfachen Import testen, bevor CSS komplett umstrukturiert wird.
  Fallback: CSS-Tokens in jeder App manuell pflegen (weniger DRY, aber sicher)

### OQ-3: ESLint Plugin-Resolution in Monorepo
- **Was wir wissen:** `eslint-config-next` setzt `next` und `eslint-plugin-*` voraus
- **Was unklar ist:** Werden Plugin-Resolve-Fehler auftreten wenn Config in `packages/config` liegt?
- **Empfehlung:** `eslint-config-next` als devDependency in jeder App behalten, shared config
  nur die `defineConfig`-Struktur exportieren. Oder: ESLint flat config mit expliziten Imports.

### OQ-4: Soll `lib/supabase.ts` in tools-app komplett entfernt werden?
- **Was wir wissen:** Es gibt Duplikation mit `lib/supabase/`
- **Was unklar ist:** Gibt es Stellen die bewusst den t3-env validierten Pfad bevorzugen?
- **Empfehlung:** Ja, entfernen. Das Auth-Package kann intern auch t3-env nutzen, oder
  Next.js-eigene Env-Validierung (Compile-Time-Checks) reicht.

---

## Assumptions Log

| # | Claim | Sektion | Risiko wenn falsch |
|---|-------|---------|-------------------|
| A1 | Next.js 16 transpiliert Workspace-Packages automatisch (kein `transpilePackages` nötig) | Turborepo Setup | Build schlägt fehl, fix: `transpilePackages` hinzufügen |
| A2 | `@tailwindcss/postcss` löst `@import "@genai/config/..."` aus node_modules auf | Config Package | CSS shared base funktioniert nicht, fix: CSS manuell in jeder App pflegen |
| A3 | pnpm catalog-Feature in pnpm 10.8.1 verfügbar | N-03 Dependency Consistency | Catalog-Syntax in pnpm-workspace.yaml wird ignoriert/fehlt |
| A4 | Supabase-generierte DB-Types existieren nirgendwo im Repo | Types Package | Types wurden woanders generiert und ich habe sie übersehen |
| A5 | `app/proxy.ts` in tools-app ist kein echtes Next.js Middleware (kein `middleware.ts` root-level) | Auth Package | Session-Refresh-Logik fehlt auf Middleware-Ebene |

---

## Quellen

- [VERIFIED: direkt aus Codebase gelesen] apps/website/lib/supabase/client.ts, server.ts
- [VERIFIED: direkt aus Codebase gelesen] apps/tools-app/lib/supabase/browser.ts, server.ts, proxy.ts
- [VERIFIED: direkt aus Codebase gelesen] apps/tools-app/lib/supabase.ts, lib/auth.ts
- [VERIFIED: direkt aus Codebase gelesen] apps/tools-app/lib/types.ts
- [VERIFIED: direkt aus Codebase gelesen] apps/website/app/globals.css, apps/tools-app/app/globals.css
- [VERIFIED: direkt aus Codebase gelesen] beide tsconfig.json, beide eslint.config.mjs
- [VERIFIED: direkt aus Codebase gelesen] turbo.json, package.json, pnpm-workspace.yaml
- [VERIFIED: npm registry] turbo@2.9.6, @supabase/ssr@0.10.2, @supabase/supabase-js@2.103.0
- [ASSUMED] Turborepo Internal Package Pattern (kein Build-Step) aus Training-Knowledge
- [ASSUMED] pnpm catalog-Syntax aus Training-Knowledge (pnpm 9+)
