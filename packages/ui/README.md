# @genai/ui — Shared UI Components

App-übergreifende UI-Primitives, die Website und tools-app gemeinsam nutzen. Stand heute: minimal — wir teilen nur, was wirklich an mehr als einer Stelle gebraucht wird.

## Exports

Aus `src/index.ts`:

- `Logo` — Brand-Logo-Komponente, eingeführt in Phase 16. 11 Varianten (Colorway × Context × Size × Theme).
- Typen: `LogoProps`, `LogoColorway`, `LogoContext`, `LogoSize`, `LogoTheme`

## Usage

```tsx
import { Logo } from '@genai/ui'

<Logo colorway="neon-blue" context="header" size="md" />
```

## Konventionen

Neue Komponenten kommen hierher, sobald **mindestens zwei Apps** dieselbe Primitive brauchen. Bis dahin bleibt sie lokal in der App. Detaillierte Regel: siehe `.planning/codebase/CONVENTIONS.md` § "Where to Add New Code → New shared UI component".

Brand-Tokens (Farben, Typo) liegen in `brand/tokens.json` und werden über Tailwind/CSS-Variablen konsumiert — nicht in dieses Package duplizieren.

## Historie

Versionierung läuft via Changesets im Monorepo-Root. Siehe `CHANGELOG.md` für Releases.
