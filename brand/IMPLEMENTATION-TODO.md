# Brand-System — Umsetzung (separate Session)

Nach Abschluss der Definitions-Phase (Blöcke A–F) in einer separaten Session durcharbeiten:

## Schritte

1. **Package installieren**
   ```bash
   pnpm add -w @radix-ui/colors
   pnpm add -D -w @react-email/components react-email  # für Mail-Templates
   ```

2. **Geist-Fonts via `next/font/google` laden**
   - `apps/website/app/layout.tsx` + `apps/tools-app/app/layout.tsx`
   - Geist Sans (Weights 400/500/600/700/800/900) + Geist Mono (400/500/700)
   - CSS-Variables `--font-sans`, `--font-mono` setzen

3. **`packages/config/tailwind/base.css` erweitern**
   - Radix-Imports: `slate.css`, `slate-dark.css`, ggf. Alpha-Varianten
   - Token-Mapping: semantische CSS-Variablen auf Radix-Steps mappen
   - Fix bereits drin: `--color-primary: var(--accent)`, `--color-ring: var(--text)`

4. **`brand/DESIGN.md` + `brand/tokens.json` schreiben**
   - Vollständige Design-Entscheidungen aus den Blöcken A–F
   - tokens.json im W3C-Design-Tokens-Format
   - DESIGN.md als Referenz für Mensch + LLM

5. **Bestehenden Code migrieren**
   - Website + tools-app: alte Tailwind-Klassen auf neue Tokens
   - Inter durch Geist Sans ersetzen
   - Cascadia-Referenzen entfernen (Mono → Geist Mono)
   - Primary-Button-Farbe checken (jetzt Rot/Neon statt Rosa/Blau)

6. **Mail-Templates auf React Email umstellen**
   - 6 Supabase-Templates vereinheitlichen
   - `apps/website/lib/email.ts` als Basis, neue Tokens ziehen
   - `@media (prefers-color-scheme: dark)` für Welt-Switch

7. **Circle Custom-CSS-Snippet** (falls Plan es erlaubt)
   - Geist via Google-Fonts-Import
   - Web-Version only, Mobile-App + Circle-Mails bleiben Fallback

8. **Favicon erstellen** (offen, braucht Briefing)
   - Simpler Symbol-Style (noch zu designen, nicht wide-Logo crop)
   - Multi-Res: `favicon.ico` (16/32), `icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`, `safari-pinned-tab.svg`
   - `prefers-color-scheme`-Switch via `<link media="...">` oder Mono-Symbol
   - Tool: realfavicongenerator.net nach Designer-Input

## Aufwand-Schätzung

- Schritt 1–4: ~2 h
- Schritt 5: ~2–3 h (je nach Code-Umfang)
- Schritt 6: ~2 h (6 Templates)
- Schritt 7: 15 min
- Schritt 8: hängt von Design-Briefing ab

**Gesamt: ~6–8 h.** Am besten in einer fokussierten Session ohne andere parallele Arbeit.

## Referenzen

- `brand/DESIGN.md` — alle Design-Entscheidungen
- `brand/VOICE.md` — Ton + Microcopy-Library
- `brand/tokens.json` — W3C Design Tokens (maschinenlesbar)
- `brand/logos/` — 11 Logo-Varianten (wide, 9 CI-Farben + sand + on-BG-Variants)
- `brand/BRAND-BACKLOG.html` — Ursprüngliches Backlog mit allen offenen Punkten
- `brand/typography-mockup.html`, `typography-mockup-geist.html`, `typography-scale.html` — Entscheidungs-Mockups aus Session
