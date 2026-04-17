# Phase 14: Mobile Quick-Win-Polish - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

3 konkrete Mobile-UI-Bugs fixen, patch-Release (v4.1.x). Kein Feature-Scope, kein Refactor über den Bug-Fix hinaus.

In Scope:
- Mobile Shift+Enter-Verhalten (Verifikation)
- Chat-Input Auto-Resize bei programmatischen Value-Changes (Diktat)
- Legal Footer Darkmode-Farbe + Overlap-Verhalten mit expanded Chat

Out of Scope:
- FloatingChat-Umbau / Chat überall (Phase 15)
- Micro-Animations-Parity (Phase 16)
- Alle nicht explizit genannten Mobile-Verhalten

</domain>

<decisions>
## Implementation Decisions

### D-01: Shift+Enter — Skip
User hat nachgeschaut, Fix hält. **Aus Scope nehmen.** Kein Playwright-Test, kein Re-Apply. Wenn später doch Regression: in neuen Todo kapseln, nicht in Phase 14 reinziehen.

### D-02: Auto-Resize für Diktat-Input
**Verhalten:** Textarea soll sich bei programmatischen Value-Changes (Diktat/Transkription) genauso verhalten wie beim manuellen Tippen — wächst mit Content bis Max-Height, schrumpft bei Leer-State zurück.

**Problem:** Aktuell wächst Textarea nur bei `onChange` (User-Input), nicht bei programmatisch gesetztem `value` (Diktat schreibt direkt in State).

**Strategie (Claude's Discretion):**
- Resize-Logic aus `onChange`-Handler in Funktion extrahieren
- Via `useEffect` auf `value`-Prop triggern → reagiert auf alle Value-Quellen (Typing, Diktat, Paste, programmatisch)
- Max-Height-Cap unverändert lassen (Verhalten wie bisher)

### D-03: Legal Footer — Hide on Expanded Chat
**Verhalten:** Wenn Chat expanded (mobile full-screen oder desktop), ist Legal Footer nicht sichtbar. Wenn Chat collapsed/closed, Footer sichtbar.

**Darkmode-Farbe:** Theme-aware Token verwenden (`text-muted-foreground` o.ä.) statt hartem `text-text-muted`, damit Darkmode automatisch korrekt.

**Mechanismus (Claude's Discretion):**
- Footer-Visibility an Chat-Expanded-State koppeln (State lebt in FloatingChat oder AppShell)
- Simpel: `hidden`-Class oder `opacity-0 pointer-events-none` wenn `chatExpanded`

### Claude's Discretion
- Genauer Token-Name für Footer-Darkmode-Farbe (abhängig vom Tailwind-Setup in tools-app)
- CSS-Mechanismus für Footer-Hide (class vs. conditional render)
- useEffect vs. anderer Resize-Trigger wenn React-Pattern es besser lösen kann

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase-Spec
- `.planning/ROADMAP.md` § "Phase 14: Mobile Quick-Win-Polish" — Scope + Success Criteria

### Code (Source of Truth)
- `apps/tools-app/components/chat/FloatingChat.tsx` — Textarea + Auto-Resize-Logik; Chat-Expanded-State lebt vermutlich hier
- `apps/tools-app/components/AppShell.tsx` — Legal Footer Markup (laut ROADMAP Zeile 340-349 in vorheriger Version; aktuelle Zeilen prüfen)

### Codebase Maps
- `.planning/codebase/CONVENTIONS.md` — Styling-Patterns, Tailwind-Tokens
- `.planning/codebase/STACK.md` — Tailwind v4 + Dark-Mode-Setup

### Prior Work (Kontext, nicht zum Re-Apply)
- Commit `eb8fe92` (fix(tools-app): default chat popup auch mobile full-screen) — letzte Mobile-Chat-Änderung
- Commit `d0521b1` (fix(tools-app): mobile chat geht jetzt full-screen) — Chat-Expand-Verhalten

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FloatingChat.tsx` hat bestehende `onChange`-basierte Resize-Logik → extrahieren, nicht neu bauen
- Tailwind-Theme-Tokens via `@theme` / CSS-Variables (Tailwind v4) → Darkmode-aware Farben vorhanden

### Established Patterns
- Chat-Expanded-State wird vermutlich via React-State gehalten (Collapse/Expand-Toggle existiert)
- AppShell rendert globalen Footer — Visibility muss dort oder via Context gesteuert werden

### Integration Points
- Footer-Visibility braucht Verbindung zu Chat-Expanded-State (Context / Prop-Drilling / Zustand je nach Setup)
- Diktat-Code schreibt in gleichen State den manuelles Typing verwendet → useEffect auf value reicht

</code_context>

<specifics>
## Specific Ideas

- Verhalten parallel zum manuellen Tippen: "wächst mit, bis Max-Size" — User-Formulierung, kein neuer UX-Entscheid nötig.
- Footer-Hide nur bei Chat-Expanded (nicht bei Chat-Open/Collapsed-Bubble).

</specifics>

<deferred>
## Deferred Ideas

- Playwright-Regression-Test für Shift+Enter: falls Fix doch brüchig wird, eigener kleiner Todo (nicht Phase 14).
- Chat global verfügbar (alle Routen) + Context-aware → **Phase 15**.
- Micro-Animations Mobile-Parity → **Phase 16**.

</deferred>

---

*Phase: 14-mobile-quick-win-polish*
*Context gathered: 2026-04-17*
