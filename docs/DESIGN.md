# Design System — Generation AI

> Corporate Identity Guidelines

---

## Farbwelten

**Wichtig: Nicht mischen!** Rosa/Rot und Blau/Gruen immer getrennt verwenden.

### Dark Mode (Blau/Gruen)

| Verwendung | Hex | Beschreibung |
|------------|-----|--------------|
| Primary | `#3A3AFF` | Blau — Header, Links |
| Accent | `#CEFF32` | Neon-Gruen — Buttons, Highlights |
| Background | `#141414` | Fast-Schwarz |
| Text | `#F6F6F6` | Off-White |

### Light Mode (Pink/Rot)

| Verwendung | Hex | Beschreibung |
|------------|-----|--------------|
| Primary | `#FC78FE` | Pink — Header, Links |
| Accent | `#F5133B` | Rot — Buttons, Highlights |
| Background | `#F6F6F6` | Off-White |
| Text | `#141414` | Fast-Schwarz |

### Alle Brand-Farben

```css
--blue-brand:   #3A3AFF
--neon:         #CEFF32
--pink-brand:   #FC78FE
--red-brand:    #F5133B
--black-brand:  #141414
--gray-light:   #F6F6F6
```

---

## Typografie

| Verwendung | Font | Fallback |
|------------|------|----------|
| Body | Inter | system-ui, sans-serif |
| Monospace/Code | Cascadia Code | monospace |

### Font-Einbindung

```tsx
// next/font/google fuer self-hosting
import { Inter } from "next/font/google";

// Cascadia Code lokal oder via next/font/local
import localFont from "next/font/local";
const cascadiaCode = localFont({ src: "./CascadiaCode.woff2" });
```

---

## Logo-Varianten

### Verfuegbare Dateien

| Datei | Verwendung |
|-------|------------|
| `generationai-blau-neon-transparent.png` | Dark Mode, transparenter Hintergrund |
| `generationai-pink-rot-transparent.png` | Light Mode, transparenter Hintergrund |
| `generationai-blau-neon.svg` | Dark Mode, quadratisch |
| `generationai-blau-neon-wide.svg` | Dark Mode, Querformat |
| `generationai-pink-rot-wide.svg` | Light Mode, Querformat |
| `generationai-weiss-transparent.svg` | Weiss auf transparent (universal) |

### Logo-Regeln

1. **Dark Mode:** Blau/Gruen Logo auf dunklem Hintergrund
2. **Light Mode:** Pink/Rot Logo auf hellem Hintergrund
3. **Mindestgroesse:** 32px Hoehe
4. **Freiraum:** Mindestens 1x Logo-Hoehe um das Logo herum

---

## UI-Elemente

### Buttons

```css
/* Primary Button */
background: var(--accent);
color: var(--text-on-accent);
border-radius: 9999px; /* pill shape */
box-shadow: 0 0 12px var(--accent-glow);

/* Secondary Button */
background: var(--border);
color: var(--text-muted);
```

### Cards

```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 12px;
```

### Glow-Effekte

```css
/* Neon Glow (Dark Mode) */
box-shadow: 0 0 12px rgba(206, 255, 50, 0.4);

/* Rot Glow (Light Mode) */
box-shadow: 0 0 12px rgba(245, 19, 59, 0.3);
```

---

## Anwendung

### Website (generation-ai.org)
- Dark Mode default
- Blau/Gruen Palette
- Hero mit Neon-Akzenten

### Tools-App (tools.generation-ai.org)
- Dark Mode default
- Blau/Gruen Palette
- Chat-UI mit Glow-Effekten

### Circle Community
- Platform-eigenes Design
- Generation AI Branding in Header/Logo

---

*Basierend auf CI NEU.pdf — Stand: 2026-04-15*
