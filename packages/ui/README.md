# @genai/ui

> Placeholder fuer Shared UI Components

## Status: Leer (by design)

Dieses Package ist aktuell leer weil:

1. **Website ist sehr simpel** — nur Landing + Legal Pages
2. **Wenig Component-Overlap** — tools-app und website teilen kaum UI
3. **Premature Abstraction vermeiden** — erst teilen wenn wirklich noetig

## Wann befuellen?

Wenn mindestens 2 Apps dieselbe Komponente brauchen:
- Buttons mit gleichem Styling
- Form-Components
- Layout-Components
- etc.

## Beispiel-Setup (wenn noetig)

```bash
# Package initialisieren
cd packages/ui
pnpm init
pnpm add react react-dom

# In package.json:
{
  "name": "@genai/ui",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx"
  }
}
```

## Importieren (wenn befuellt)

```tsx
import { Button } from '@genai/ui'
import { Input } from '@genai/ui/input'
```

---

*Entscheidung: Leer lassen bis konkreter Bedarf besteht.*
