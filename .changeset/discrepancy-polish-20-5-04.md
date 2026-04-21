---
"@genai/website": patch
---

Phase 20.5-04 — Discrepancy Polish Pass

- Smoother scroll-spring (stiffness 120→140, damping 30→32, mass 0.5→0.4)
  für responsives Feeling ohne Wobble
- Phasen-Ranges breiter überlappend (min. 0.05) — keine Step-Grenzen mehr
- X-Achse: "Nachfrage/Vergütung/Ausbildung" → honest "01/02/03" Paar-IDs.
  Pair-Semantik trägt eine Caption unter dem Chart
- Legend raus aus dem SVG → HTML-Legend unter Chart (flex-wrap,
  mobile-stacking)
- Pair-Caption + Y-Scale-Disambiguation (symbolisch, mischt × und %)
- Mobile (<640px): dichte X-Tick-Labels + X-Title ausgeblendet
  (max-sm:hidden) — Caption reicht als Orientierung
