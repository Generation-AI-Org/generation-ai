---
date: 2026-04-22
branch: feature/phase-20-landing-skeleton
phase: 20.5
status: 4/5 plans complete, 1 awaiting decision
---

# Morning Briefing — Phase 20.5 Landing Wow-Pass

Über Nacht-Status für dich. TL;DR: **Alles gebaut, kein Push, Dev-Server läuft nicht. Branch offen.**

---

## Was über Nacht passiert ist

### Phase 20 — formal abgeschlossen
- Skeleton-Level approved (Nav, Footer, 8 Section-Mounts, MotionConfig, Build-Pipeline)
- Hero + Discrepancy-Wow wurde bewusst deferred → Phase 20.5
- VALIDATION.md signed-off, SUMMARY.md, Changeset → alles committed
- Kein Push, kein Merge zu main

### Phase 20.5 — neu aufgesetzt
- Zwischen Phase 20 und 21 in Roadmap eingefügt
- **Design-System als Nordstern** in ROADMAP-Note verankert: `brand/Generation AI Design System/` ist Source of Truth ab hier
- 5 Plans angelegt:

| Plan | Name | Status | Commits |
|------|------|--------|---------|
| 20.5-01 | Design-System Alignment (Tokens + Motion-Easings) | ✅ | `2ab3b96`, `401c76b` |
| 20.5-02 | Signal-Grid Canvas Component | ✅ | `b16e444`, `2ea1c2f` |
| 20.5-03 | Hero Rewrite mit Signal-Grid | ✅ | `996f3fb`, `e2c337b`, `b1f96fd` |
| 20.5-04 | Discrepancy Polish Pass | ✅ | `26a5b76`, `9ba3ab0` |
| 20.5-05 | Hero→Discrepancy Transition | ⏸ awaiting decision | `9aa8258` (nur Doc) |

### Was konkret neu auf der Seite ist

**Hero:**
- **Signal-Grid Canvas** (nicht mehr Aurora oder generisches Grid). Nodes + Linien.
- Maus bewegen → Nodes in der Nähe illuminieren + Linien zwischen nächsten Nachbarn
- 3 Propagation-Ringe (Ripple-Effekt rund um den Cursor)
- Idle: Nodes atmen leicht (sin-wave, staggered phase → organisch)
- Reduced-Motion: statisches Grid, kein Tracking
- Theme-aware (liest `--neon-9` zur Runtime, reagiert auf `.light`-Toggle)
- Retina-crisp, IntersectionObserver-pause wenn offscreen

**Discrepancy:**
- Scroll-Spring smoother (`stiffness: 140, damping: 32, mass: 0.4`)
- Phasen-Overlaps weiter (keine Step-Grenzen mehr)
- **Honest Axes:** X-Tick-Labels `01 / 02 / 03` statt der semantisch schiefen "Nachfrage/Vergütung/Ausbildung"
- Paar-Semantik wandert in eine HTML-Caption unter dem Chart
- Legend rausgezogen aus SVG in HTML — stackt auf Mobile automatisch
- Y-Achse als symbolisch ("LEVEL", niedrig/mittel/hoch) weiter, aber in Caption disambiguiert (weil die Werte × und % mischen)

**Design-System-Alignment:**
- Motion-Tokens verfügbar: `var(--dur-fast/normal/slow)`, `var(--ease-out)`, `var(--ease-in-out)`
- Type-Scale, Spacing, Radius, Shadows ergänzt → DS-Parität
- Buttons: Primary-CTA hat `active:scale-[0.98]` + ease-out Easing (DS-konform)

**Deprecated (nicht gelöscht):**
- `apps/website/components/ui/grid-background.tsx` — @deprecated Header, Code bleibt
- `apps/website/components/ui/aurora-background.tsx` — unchanged, noch da falls später woanders nutzbar

### Transition (Plan 20.5-05) — braucht deine Entscheidung

Ich hab nicht gebaut weil das ein Design-Moment ist der mit dir zusammen entstehen soll. Exploration-Doc liegt bei:

**→ `.planning/phases/20.5-landing-wow-pass-signal-grid/20.5-05-EXPLORATION.md`**

4 Kandidaten für den Übergang Hero → Discrepancy drin. Meine Empfehlung: **B (Signal-Line shoots into Chart-Line)** oder **D (Radial-Fade leakt in Discrepancy)**.

Sag mir welchen nach Live-Review, dann bau ich's.

---

## Dev-Server starten

```bash
cd /Users/lucaschweigmann/projects/generation-ai
pnpm --filter @genai/website dev
# → http://localhost:3000 (oder :3001 wenn 3000 belegt)
```

Wenn du lieber prod-Build-Smoke willst (genauer wie Live):
```bash
cd /Users/lucaschweigmann/projects/generation-ai
pnpm --filter @genai/website build
cd apps/website && NODE_ENV=production pnpm start
# → http://localhost:3000
```

---

## Was du reviewen solltest

**Hero:**
1. Ist das Signal-Grid sichtbar? Atmen die Nodes im Idle?
2. Maus drüber: illuminieren Nodes? Spannen sich Linien zwischen nächsten Nodes?
3. Ripple-Gefühl — spürst du die Propagation in 3 Ringen?
4. Light-Toggle: passen die Farben in Pink-Red-Mode?
5. Reduced-Motion (DevTools → Rendering): statisches Grid, keine Animation?

**Discrepancy:**
1. Scroll smooth jetzt oder immer noch zu ruckelig?
2. Achsen-Labels `01 / 02 / 03` + Paar-Caption darunter — klar lesbar, ehrlich?
3. Mobile (DevTools 375px): Legend stackt sauber, keine Label-Kollision?
4. Reduced-Motion: Chart komplett sichtbar ohne Scroll?

**Ganze Landing:**
1. Keine Console-Errors (F12)? CSP-Violations? → Schwarze Seite wäre sehr schlecht (siehe LEARNINGS.md)
2. Sections-Flow von oben nach unten weiter stimmig?
3. Wo ist der nächste Pain-Point für dich?

---

## Auto-Verification (läuft, damit du's weißt)

- **Build:** grün, `/` bleibt `ƒ` (dynamic) → CSP-Nonce-Rule respektiert
- **Playwright:** 8/8 grün gegen local prod
- **Lint:** 0 errors, pre-existing warnings only
- **CSP:** nonce im Response-Header → scripts laden → keine schwarze Seite

---

## Git-Stand

```bash
git log --oneline feature/phase-20-landing-skeleton ^main | head -20
```

Gibt dir die Phase-20 + 20.5 Commits. Kein Push, kein Force. Branch bleibt lokal bis du ihn freigibst.

**Wenn du committten willst woanders hin (z.B. Polish weiter in neuem Branch):**
```bash
git checkout -b feature/phase-20.5-polish-followup
# deine Änderungen
```

**Wenn du zurück auf main willst (Skeleton verwerfen):**
```bash
git checkout main  # nichts ist gepusht, alles lokal
# branch bleibt existieren falls du's willst
```

---

## Offene Entscheidungen für dich

1. **Transition-Kandidat** (A/B/C/D oder skip) — siehe EXPLORATION-Doc
2. **Smoothness-Feel** Discrepancy — falls zu träge/zu schnell, 1-Line-Fix (`stiffness` anpassen)
3. **Caption-Wording** unter Discrepancy-Chart — aktuell mein Vorschlag, dein Feedback willkommen
4. **Signal-Grid Node-Dichte** — wenn zu busy: `nodeCountX/Y`-Prop runterdrehen. Zu sparse: hoch.
5. **Hero-Claim finales Wording** — bleibt deferred (Marketing-Pass), nicht Phase 20.5 Scope

---

## Offen für spätere Phasen (unverändert)

- Phase 21: `/about`-Seite
- Phase 22: `/partner`-Seite  
- Phase 23: `/join`-Fragebogen-Flow
- Phase 24: `/level-test`
- Phase 25: Circle-API-Sync
- Phase 26: Subdomain-Integration

Kein Impact durch 20.5 — alle Phasen sind unblocked sobald du 20.5 schließt.

---

## Wenn was kaputt aussieht

1. **Schwarze Seite** → CSP-Issue, sofort in LEARNINGS.md nachschauen
2. **Signal-Grid nicht sichtbar** → Canvas-Probleme, DevTools-Console checken, ggf. Build-Cache leeren (`rm -rf apps/website/.next`)
3. **Scroll-Animation ruckelt** → `stiffness`-Parameter in `discrepancy-section.tsx:140` anpassen

Bei Unsicherheit: nichts pushen, erst mit mir klären.
