---
"@genai/website": patch
"@genai/e2e-tools": patch
---

Mobile-Polish + CI-Fix:

- **Smoke-Test:** `networkidle` → `domcontentloaded` (+ expliziter `waitForFunction` auf Body-Content). Analytics/Motion-Loops halten das Netzwerk aktiv → Timeouts in CI, obwohl Seite längst gerendert ist. Core-Assertions (CSP-Violations, Body-Text > 20 chars) greifen weiterhin.
- **Lamp-Effekt mobile:** Feste `rem`-Werte (26rem / 40rem / 24rem) durch `min(…, vw)` ersetzt, Heights/Translates unterhalb `sm:` reduziert. Kegel + Linie passen jetzt sauber in 375 px Viewport.
- **Hero Signal-Grid:** Content-Protect-Layer in `LabeledNodes` dämpft Nodes/Lines hinter dem Text. Theme-aware: Dark = bg-Wash, Light = bg-Wash + minimaler Dark-Tint (damit die roten/pinken Nodes nicht mit der H1 konkurrieren).
