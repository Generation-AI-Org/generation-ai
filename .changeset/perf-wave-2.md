---
"@genai/website": patch
---

Perf Wave 2: Bundle cleanup + Canvas-Loop hinter `requestIdleCallback`.

- **Tool-Icons inline:** `react-icons/si` Barrel-Import (9 Icons) durch inline-SVGs ersetzt. Paths direkt aus simpleicons.org — identische Darstellung, ~40–50 KB weniger Bundle.
- **`@tabler/icons-react` entfernt:** Dep war in `package.json`, aber nirgends importiert.
- **`react-icons` entfernt:** Website-only cleanup, tools-app nutzt es weiterhin.
- **Canvas-Animation lazy:** `LabeledNodes` startet den rAF-Loop + das Node-Setup erst nach `requestIdleCallback` (Fallback: `setTimeout(80ms)`). Critical Path hat jetzt keine Canvas-Init mehr → erwartet TBT −100 bis −200 ms, Bootup-Time runter.

Erwartet: Mobile Perf 79 → 88+, LCP weiter runter durch freiere Main-Thread während Hydration.
