---
'@genai/tools-app': patch
---

fix(chat): Textarea waechst jetzt auch bei Diktat-Input (Voice) und programmatischen Updates synchron mit — nicht nur beim manuellen Tippen. Resize-Logik als DRY-Funktion extrahiert.

fix(mobile): Legal-Footer (Impressum/Datenschutz) wird ausgeblendet waehrend der Chat mobile full-screen expanded ist, damit der Chat die volle Hoehe nutzen kann. Footer-Farbe auf theme-aware CSS-Variable umgestellt (`var(--text-muted)` / `var(--text)`) fuer konsistenten Kontrast im Dark- und Light-Mode.
