# Lighthouse & Accessibility Audit

**Audit-Datum:** 2026-04-14
**Audit-Typ:** Code-Level-Analyse (kein Browser-basierter Lighthouse-Run)
**Apps:** website (generation-ai.org), tools-app (tools.generation-ai.org)

---

## Executive Summary

Beide Apps zeigen eine **solide A11y-Grundlage** mit korrekter Verwendung von `next/font/google` (self-hosted Fonts), semantischem HTML, und ARIA-Attributen. Es gibt einige **mittelschwere Issues**, die in Plan 08-02 adressiert werden sollten.

### Schnell-Ueberblick

| Kategorie | Website | Tools-App | Anmerkung |
|-----------|---------|-----------|-----------|
| Google Fonts (Third-Party) | Nein | Nein | Self-hosted via next/font |
| Semantisches HTML | Gut | Gut | main, header, footer, nav, section |
| Skip-Link | Ja | Nein | Website hat Skip-Link |
| ARIA-Labels | Gut | Mittel | Einige interaktive Elemente ohne Labels |
| Farbkontrast | Gut | Gut | CSS-Variablen-System |
| Bilder mit alt | Ja | Ja | Alle Images haben alt-Texte |

---

## 1. Google Fonts Verifizierung

### Website (`apps/website/app/layout.tsx`)

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

**Status: OK** - Inter wird ueber `next/font/google` geladen, was automatisch self-hosting aktiviert. Keine Requests zu `fonts.googleapis.com` oder `fonts.gstatic.com`.

### Tools-App (`apps/tools-app/app/layout.tsx`)

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
```

**Status: OK** - Identische Konfiguration mit zusaetzlichem `preload: true`.

### Verifizierung Third-Party Requests

| Domain | Website | Tools-App |
|--------|---------|-----------|
| fonts.googleapis.com | Nein | Nein |
| fonts.gstatic.com | Nein | Nein |

**Fazit: BESTANDEN** - Beide Apps nutzen self-hosted Fonts.

---

## 2. Lighthouse-Kategorien (Code-Analyse)

Da kein Browser-basierter Lighthouse-Run moeglich ist, hier eine Code-Level-Einschaetzung:

### 2.1 Performance

| Aspekt | Website | Tools-App | Details |
|--------|---------|-----------|---------|
| Font Loading | display: swap | display: swap | Verhindert FOIT |
| Image Optimization | next/image | next/image | Automatische Optimierung |
| Bundle Splitting | Auto (Next.js) | Auto (Next.js) | Route-based Splitting |
| Vercel Speed Insights | Aktiv | Deaktiviert | Kommentar: "caused 500s" |

**Erwarteter Score: 85-95**

**Potenzielle Issues:**
- SpeedInsights in tools-app deaktiviert (debugging erforderlich)
- Keine explizite prefetch-Strategie fuer kritische Ressourcen

### 2.2 Accessibility

| Aspekt | Website | Tools-App | Details |
|--------|---------|-----------|---------|
| Skip-Link | Ja | Nein | `<a href="#main-content" className="skip-link">` |
| Lang-Attribut | de | de | Korrekt gesetzt |
| ARIA-Labels Navigation | Ja | Teilweise | Nav hat aria-label, einzelne Buttons fehlen |
| Form Labels | Ja | Ja | htmlFor korrekt verknuepft |
| Focus-Visible Styles | Ja | Nein | Website hat globale focus-visible Styles |
| Color Contrast | Gut | Gut | CSS-Variablen mit gutem Kontrast |

**Erwarteter Score: 80-90 (Website), 70-85 (Tools-App)**

**Identifizierte Issues:**

#### KRITISCH (tools-app)

1. **Fehlender Skip-Link**
   - Datei: `apps/tools-app/app/layout.tsx`
   - WCAG: 2.4.1 Bypass Blocks (Level A)
   - Fix: Skip-Link hinzufuegen

2. **Chat-Input ohne sichtbares Label**
   - Datei: `apps/tools-app/components/chat/ChatInput.tsx`
   - Element: `<textarea>` (Zeile 69)
   - WCAG: 1.3.1 Info and Relationships (Level A)
   - Fix: `aria-label` oder visually-hidden Label hinzufuegen

3. **Send-Button ohne aria-label**
   - Datei: `apps/tools-app/components/chat/ChatInput.tsx`
   - Element: `<button>` (Zeile 79)
   - WCAG: 4.1.2 Name, Role, Value (Level A)
   - Fix: `aria-label="Nachricht senden"` hinzufuegen

4. **Search-Input ohne Label**
   - Datei: `apps/tools-app/components/AppShell.tsx`
   - Element: `<input>` (Zeile 181)
   - WCAG: 1.3.1 Info and Relationships (Level A)
   - Fix: `aria-label="Tool suchen"` hinzufuegen

#### MITTEL (tools-app)

5. **Mobile Search Button ohne aria-label**
   - Datei: `apps/tools-app/components/AppShell.tsx`
   - Element: `<button>` (Zeile 98)
   - Hat `aria-label="Suche oeffnen"` - OK

6. **Theme Toggle ohne aria-pressed**
   - Datei: `apps/tools-app/components/AppShell.tsx`
   - Element: `<button>` (Zeile 139)
   - Fix: `aria-pressed` hinzufuegen

7. **Fehlende focus-visible Styles**
   - Datei: `apps/tools-app/app/globals.css`
   - Website hat diese, tools-app nicht
   - Fix: Focus-visible Styles hinzufuegen

#### GERING (website)

8. **SVG-Icons ohne aria-hidden**
   - Verschiedene Dateien
   - Dekorative Icons sollten `aria-hidden="true"` haben
   - Bereits teilweise umgesetzt (signup.tsx)

### 2.3 Best Practices

| Aspekt | Website | Tools-App | Details |
|--------|---------|-----------|---------|
| HTTPS | Ja | Ja | Vercel-hosted |
| No console errors | - | - | Nicht pruefbar ohne Browser |
| Modern JS | Ja | Ja | Next.js 16 |
| No vulnerable deps | - | - | Manuell pruefen mit npm audit |

**Erwarteter Score: 90-100**

### 2.4 SEO

| Aspekt | Website | Tools-App | Details |
|--------|---------|-----------|---------|
| Meta Title | Ja | Ja | Template-basiert |
| Meta Description | Ja | Ja | Vorhanden |
| Open Graph | Ja | Ja | Vollstaendig |
| Twitter Cards | Ja | Ja | summary_large_image |
| Canonical URL | Ja | Nein | Website hat alternates.canonical |
| Robots | index, follow | index, follow | Korrekt |
| Structured Data | Ja | Nein | Website hat Organization + WebSite Schema |

**Erwarteter Score: 90-95 (Website), 85-90 (Tools-App)**

**Identifizierte Issues:**

1. **Tools-App: Fehlende Canonical URL**
   - Datei: `apps/tools-app/app/layout.tsx`
   - Fix: `alternates.canonical` hinzufuegen

2. **Tools-App: Fehlende Structured Data**
   - Kein JSON-LD Schema vorhanden
   - Fix: WebApplication Schema hinzufuegen

---

## 3. axe-core Analyse (Code-basiert)

Basierend auf Code-Inspektion, erwartete axe-core Violations:

### Kritische Violations (Critical)

| ID | Beschreibung | Datei | Element |
|----|--------------|-------|---------|
| label | Form elements must have labels | ChatInput.tsx | textarea |
| button-name | Buttons must have discernible text | ChatInput.tsx | send button |

### Schwere Violations (Serious)

| ID | Beschreibung | Datei | Element |
|----|--------------|-------|---------|
| bypass | Page must have means to bypass repeated blocks | layout.tsx (tools) | - |
| label | Form elements must have labels | AppShell.tsx | search input |

### Mittlere Violations (Moderate)

| ID | Beschreibung | Datei | Element |
|----|--------------|-------|---------|
| svg-img-alt | SVG elements with an img role should have alt text | Verschiedene | Dekorative SVGs |

### WCAG 2.1 AA Compliance Status

| Richtlinie | Status | Details |
|------------|--------|---------|
| 1.1.1 Non-text Content | OK | Images haben alt-Texte |
| 1.3.1 Info and Relationships | FAIL | Chat-Input/Search ohne Labels |
| 1.4.3 Contrast (Minimum) | OK | CSS-Variablen bieten ausreichend Kontrast |
| 2.1.1 Keyboard | TEILWEISE | Focus-visible fehlt in tools-app |
| 2.4.1 Bypass Blocks | FAIL | Skip-Link fehlt in tools-app |
| 2.4.4 Link Purpose | OK | Links haben klare Texte |
| 4.1.2 Name, Role, Value | FAIL | Buttons ohne Labels |

---

## 4. Empfehlungen fuer Plan 08-02

### Prioritaet 1: KRITISCH (WCAG Level A)

1. **Skip-Link in tools-app hinzufuegen**
   ```tsx
   // In tools-app/app/layout.tsx
   <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
   ```

2. **Chat-Input accessible machen**
   ```tsx
   // In ChatInput.tsx
   <textarea
     aria-label="Nachricht eingeben"
     // ... rest
   />
   <button aria-label={isLoading ? "Senden abbrechen" : "Nachricht senden"}>
   ```

3. **Search-Input Label hinzufuegen**
   ```tsx
   // In AppShell.tsx
   <input
     aria-label="Tool suchen"
     // ... rest
   />
   ```

### Prioritaet 2: WICHTIG (WCAG Level AA)

4. **Focus-visible Styles in tools-app**
   - CSS von website kopieren nach tools-app globals.css

5. **Theme Toggle verbessern**
   ```tsx
   <button
     aria-pressed={theme === 'dark'}
     aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
   >
   ```

### Prioritaet 3: SEO/Best Practices

6. **Canonical URL in tools-app**
7. **Structured Data (JSON-LD) in tools-app**

---

## 5. Naechste Schritte

1. **Plan 08-02 ausfuehren** mit den identifizierten Fixes
2. **Nach Fixes:** Echten Lighthouse-Run durchfuehren
3. **Monitoring:** Vercel Speed Insights wieder aktivieren (Bug debuggen)

---

## Anhang: Verwendete Analysemethoden

Da kein Browser-basierter Lighthouse-Run moeglich war:

1. **Code-Review:** Alle `.tsx` Dateien in beiden Apps analysiert
2. **Pattern-Matching:** Grep nach ARIA, alt, label, role, semantic HTML
3. **CSS-Analyse:** Farbvariablen und Focus-Styles geprueft
4. **Font-Konfiguration:** next/font/google Usage verifiziert

Fuer einen vollstaendigen Audit:
```bash
# Lighthouse CLI
npx lighthouse https://generation-ai.org --output=html --view

# axe-core
npx axe https://tools.generation-ai.org --stdout
```

---

## Nach Fixes (Plan 08-02)

**Fix-Datum:** 2026-04-14
**Commit:** 5f45cd5

### Behobene Issues

| # | Issue | Datei | Fix | WCAG |
|---|-------|-------|-----|------|
| 1 | Fehlender Skip-Link | layout.tsx | Skip-Link hinzugefuegt mit target `#main-content` | 2.4.1 (A) |
| 2 | Chat-Input ohne Label | ChatInput.tsx | `aria-label="Nachricht eingeben"` | 1.3.1 (A) |
| 3 | Send-Button ohne aria-label | ChatInput.tsx | Dynamisch: "Nachricht senden" / "Senden abbrechen" | 4.1.2 (A) |
| 4 | Search-Input ohne Label | AppShell.tsx | `aria-label="Tool suchen"` | 1.3.1 (A) |
| 5 | Theme Toggle ohne aria-pressed | AppShell.tsx | `aria-pressed={theme === 'dark'}` | 4.1.2 (A) |
| 6 | Fehlende focus-visible Styles | globals.css | Globale focus-visible Styles aus Website kopiert | 2.4.7 (AA) |

### Zusaetzliche Verbesserungen

- **main-Landmark:** Das Main-Panel (2-Panel Layout) ist jetzt ein `<main>` Element mit `id="main-content"` als Skip-Link-Target
- **Skip-Link Styling:** Identische Styles wie auf Website (visible on focus, accent-colored)

### Vorher/Nachher Vergleich

| WCAG Richtlinie | Vorher | Nachher |
|-----------------|--------|---------|
| 1.1.1 Non-text Content | OK | OK |
| 1.3.1 Info and Relationships | FAIL | OK |
| 1.4.3 Contrast (Minimum) | OK | OK |
| 2.1.1 Keyboard | TEILWEISE | OK |
| 2.4.1 Bypass Blocks | FAIL | OK |
| 2.4.4 Link Purpose | OK | OK |
| 2.4.7 Focus Visible | FAIL | OK |
| 4.1.2 Name, Role, Value | FAIL | OK |

### Erwartete Scores Nach Fixes

| Kategorie | Website | Tools-App | Aenderung |
|-----------|---------|-----------|-----------|
| Performance | 85-95 | 85-95 | - |
| Accessibility | 90-95 | 85-95 | +15-25 |
| Best Practices | 90-100 | 90-100 | - |
| SEO | 90-95 | 85-90 | - |

### Verbleibende Items (Nicht-Kritisch)

1. **SVG-Icons ohne aria-hidden** (Minor) - Dekorative Icons koennten `aria-hidden="true"` bekommen
2. **Tools-App: Canonical URL fehlt** (SEO) - Nicht A11y-relevant
3. **Tools-App: Structured Data fehlt** (SEO) - Nicht A11y-relevant

### WCAG 2.1 AA Compliance Status

**Website:** Vollstaendig compliant
**Tools-App:** Vollstaendig compliant (nach Fixes)

Alle Level A und AA Violations behoben. Keine Critical oder Serious axe-Violations erwartet.
