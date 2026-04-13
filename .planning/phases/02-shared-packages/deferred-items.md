# Deferred Items — Phase 02 Shared Packages

## ESLint: react-hooks/set-state-in-effect (Pre-existing)

**Entdeckt in:** Plan 02-02, Task 3 (Lint-Verifikation)
**Status:** Pre-existing, out of scope für Plan 02-02

### Betroffene Dateien

- `apps/website/components/ThemeProvider.tsx:19` — `setMounted(true)` direkt im useEffect-Body
- `apps/website/components/ui/terminal.tsx:355` — `setLines(...)` direkt im useEffect-Body

### Details

`eslint-config-next` (v16.2.3) enthält eine strengere `react-hooks/set-state-in-effect`-Regel die setState-Aufrufe direkt im useEffect-Body verbietet. Das Pattern ist funktional korrekt aber laut React-Docs nicht empfohlen (triggert cascading renders).

Gesamt: 14 errors, 3 warnings in `@genai/website`.

### Empfehlung

Entweder:
1. Die setState-Aufrufe in Callbacks/Event-Handler wrappen (React-konformer Ansatz)
2. Für `ThemeProvider.tsx`: State-Initialisierung aus dem Effect in `useState` Initializer verschieben
3. Für `terminal.tsx`: Komplexer — benötigt Refactoring der Animations-Logik

Fix in Phase 3 oder als separaten Cleanup-Task einplanen.
