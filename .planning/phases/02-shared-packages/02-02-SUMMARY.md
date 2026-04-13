# Summary: Plan 02-02

## Status: COMPLETE

## Tasks Completed

- [x] Task 1: @genai/types Package erstellt (Content-Types aus tools-app extrahiert)
- [x] Task 2: @genai/config Package erstellt (TSConfig, ESLint, Tailwind CSS)
- [x] Task 3: Apps auf shared Configs umgestellt (TSConfig + ESLint)
- [x] Task 4: Tailwind CSS Import + Tools-App Types-Imports migriert
- [x] Task 5: pnpm catalog für Dependency Consistency (N-03)

## Files Created

- `packages/types/package.json`
- `packages/types/tsconfig.json`
- `packages/types/src/index.ts`
- `packages/types/src/content.ts`
- `packages/types/src/auth.ts`
- `packages/config/package.json`
- `packages/config/tsconfig/base.json`
- `packages/config/eslint/next.mjs`
- `packages/config/tailwind/base.css`

## Files Modified

- `apps/website/tsconfig.json` — extends `@genai/config/tsconfig/base.json`
- `apps/tools-app/tsconfig.json` — extends `@genai/config/tsconfig/base.json`
- `apps/website/eslint.config.mjs` — importiert nextConfig von `@genai/config/eslint/next`
- `apps/tools-app/eslint.config.mjs` — importiert nextConfig von `@genai/config/eslint/next`
- `apps/website/app/globals.css` — importiert `@genai/config/tailwind/base.css`, website-spezifische Styles bleiben lokal
- `apps/tools-app/app/globals.css` — importiert `@genai/config/tailwind/base.css`, app-spezifische Tokens bleiben lokal
- `apps/tools-app/lib/types.ts` — re-exportiert Content-Types von `@genai/types/content`, Chat/KB-Types bleiben lokal
- `apps/website/package.json` — @genai/config + @genai/types als workspace:* Deps; catalog: Referenzen
- `apps/tools-app/package.json` — @genai/config + @genai/types als workspace:* Deps; catalog: Referenzen
- `packages/config/package.json` — catalog: Referenzen für eslint
- `pnpm-workspace.yaml` — catalog Sektion mit 13 zentralisierten Versionen

## Commits

- `1ad5c97` — feat(types): create @genai/types package with content types
- `88c8d37` — feat(config): create @genai/config package with tsconfig, eslint, tailwind
- `7bdf1a2` — refactor(apps): extend shared tsconfig and eslint config from @genai/config
- `14fd6b1` — refactor(apps): import shared tailwind base and migrate types to @genai/types
- `595af6c` — chore(catalog): add pnpm catalog for dependency consistency (N-03)

## Verification Results

```
pnpm install           ✓ Alle 6 Workspace-Projekte, no errors
tsc --noEmit website   ✓ Keine TypeScript-Fehler
tsc --noEmit tools-app ✓ Keine TypeScript-Fehler
pnpm lint              ✗ 17 Pre-existing Fehler in ThemeProvider.tsx + terminal.tsx
                         (react-hooks/set-state-in-effect — existieren seit vor Plan 02-02)
```

## Issues Encountered

### Pre-existing ESLint Errors (nicht durch diesen Plan verursacht)

`pnpm lint` schlägt fehl mit 14 errors + 3 warnings in:
- `apps/website/components/ThemeProvider.tsx` — `react-hooks/set-state-in-effect`
- `apps/website/components/ui/terminal.tsx` — `react-hooks/set-state-in-effect`

Diese Fehler existierten bereits vor Plan 02-02 (verifiziert per `git stash` + Lint-Run). Sie sind out of scope für diesen Plan und werden in `deferred-items.md` dokumentiert.

### Unerwarteter Plan-02-01-Stash

Beim Ausführen von `git stash` (für Verifikation) wurde ein noch nicht committeter Plan-02-01-Stash aktiv (Auth Package Migration). Die Plan-02-01-Änderungen wurden erkannt und vor den Commits sorgfältig zurückgesetzt, um keine fremden Änderungen einzumischen.

### TypeScript: Re-export + lokale Nutzung

In `lib/types.ts` mussten `ContentSource` und `ContentType` sowohl per `export type` re-exportiert als auch per `import type` lokal importiert werden, damit die Interface-Definitionen in derselben Datei funktionieren. Standard TypeScript-Verhalten.

### CSS @import Reihenfolge

Die `@import "tailwindcss"` Direktive muss vor `@import "@genai/config/tailwind/base.css"` stehen, damit Tailwind v4 korrekt initialisiert wird bevor die Design-Tokens geladen werden.

## Design-Entscheidungen

- **Tailwind CSS geteilt, app-spezifische Tokens lokal:** Website behält shadcn-Kompatibilitätsvariablen, Radius-Tokens, Skip-Link-Styles und Keyframe-Animationen lokal. Tools-app behält `--shadow`, `--chat-bg` und `pulse-once`-Keyframe lokal.
- **ESLint Plugin-Resolution:** `eslint-config-next` bleibt als devDependency in jeder App (gemäß D-06 aus CONTEXT.md). Das Config-Package re-exportiert nur die Struktur.
- **pnpm catalog:** Exakte Version für `react`/`react-dom`/`next` (`19.2.4`, `16.2.3`), Range-Versionen (`^`) für alle anderen Packages.
