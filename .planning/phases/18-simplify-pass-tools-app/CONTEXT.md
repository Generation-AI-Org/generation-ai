# Phase 18 — Simplify-Pass tools-app · CONTEXT

> Vorbereitungs-Kontext für `/gsd-plan-phase 18`.
> **⚠️ Pre-Req:** `/gsd-map-codebase` muss einmalig gelaufen sein, bevor diese Phase geplant wird.

---

## TL;DR

Tote Files löschen, inkonsistente Patterns vereinheitlichen, Naming-Drift fixen. Basiert auf systematischem Codebase-Audit (Output von `/gsd-map-codebase` in `.planning/codebase/`).

**Kein Feature-Change.** Nur Housekeeping. Alle bestehenden E2E-Tests müssen grün bleiben.

---

## Pre-Req: `/gsd-map-codebase`

Diese Phase braucht als **Input** den Output von `/gsd-map-codebase`. Das erzeugt folgende Dateien:

- `.planning/codebase/TECH.md` — Tech-Stack-Inventar
- `.planning/codebase/ARCH.md` — Architektur-Übersicht
- `.planning/codebase/QUALITY.md` — Code-Quality-Metriken
- `.planning/codebase/CONCERNS.md` — **hauptsächlich relevant** — Dead-Files, inkonsistente Patterns, Naming-Issues, TODO-Markers

**Vor Planning-Start ausführen:**

```
/gsd-map-codebase
```

Danach Phase 18 mit vollem Kontext planbar.

---

## Source of Truth (entsteht durch Map)

| Datei | Inhalt |
|---|---|
| `.planning/codebase/CONCERNS.md` | Konkrete Fix-Kandidaten — die Todo-Liste dieser Phase |
| `.planning/codebase/QUALITY.md` | Metriken als Baseline (lines of code, duplicate blocks, unused exports) |
| `.planning/codebase/ARCH.md` | Was ist strukturell OK vs. drift — hilft bei "fix vs. leave alone" |

**Nach Phase 16 + 17 update:** `/gsd-map-codebase` erneut laufen lassen, damit der Map den neuesten Stand (neue Brand-Tokens, neue Mail-Templates) reflektiert.

---

## Scope (Skeleton — wird nach Map konkret)

### In-Scope-Kategorien

1. **Orphan-Files**: Files ohne Imports, tote Exports, unbenutzte Utility-Funktionen löschen
2. **Naming-Harmonisierung**: z. B. `ContentCard` vs `ToolCard` vereinheitlichen, camelCase vs kebab-case in Files fixen
3. **Duplicate Helpers**: gleiche Logik an mehreren Orten → in `packages/ui/` oder `packages/utils/` konsolidieren
4. **Kommentierter Code**: auskommentierte Codeblöcke, `// TODO: later`-Notizen die nicht mehr relevant sind
5. **Dev-Artefakte**: `.playwright-mcp/` Screenshots, alte Debug-Ausgaben, fail-Backups aus dem Repo
6. **Inkonsistente Patterns**: z. B. manche Route-Handler nutzen `async function GET()`, andere `export const GET = async () =>` — auf ein Pattern bringen
7. **Import-Paths**: relative vs. `@genai/*` Aliase — konsistent machen

### Out-of-Scope (bewusst)

- **Feature-Änderungen** — wenn wir etwas „besser" machen wollen, separat
- **Big Refactors** — keine Architektur-Umbauten, keine Package-Splits
- **Breaking Changes** — alle Public-APIs bleiben
- **Dependency-Upgrades** — separate Phase bei Bedarf
- **Test-Rewrites** — nur toten Test-Code löschen, keine bestehenden Tests anfassen

### Success Criteria

- [ ] Alle Findings aus `.planning/codebase/CONCERNS.md` adressiert (fix oder als „bewusst belassen" markiert mit Begründung)
- [ ] `knip` / Unused-Exports-Check grün (oder zumindest besser als Baseline)
- [ ] `pnpm build` beider Apps grün
- [ ] Alle E2E-Tests grün (keine Feature-Regression)
- [ ] Zeilen-Delta negativ (Simplify-Pass soll Code abbauen, nicht erweitern)

---

## Vorschlag für PLAN.md-Struktur

Kann erst **nach `/gsd-map-codebase`** konkret werden. Grobes Skelett:

### Wave 1 — Low-Risk (automatisierbar)
- Plan 18-01: Orphan-Files + Dev-Artefakte löschen (git grep → unreferenced files)
- Plan 18-02: Auskommentierter Code + veraltete TODOs entfernen

### Wave 2 — Pattern-Consolidation
- Plan 18-03: Naming-Harmonisierung (Components + Files), mit Rename-Commits
- Plan 18-04: Duplicate-Helpers zusammenführen

### Wave 3 — Verify
- Plan 18-05: knip + Tests + Build grün, Delta-Report

Exakte Pläne hängen vom Map-Output ab.

---

## Pre-Approved für Autonomous-Run

- Rein Code (keine Manual-Steps)
- Push: OK · PR auf feat-Branch OK
- Changeset: patch (v4.3.x)
- **Risiko**: Naming-Harmonisierung kann in vielen Files landen — Auto-Run nutzt atomic commits pro Rename (git mv), damit Diff lesbar bleibt
- **Stop-Gate**: wenn ein Fix aus CONCERNS.md ambivalent ist ("Kann X zu Y umbenennen oder beibehalten?") — pausiert für Luca-Input
- **Hard Stop**: wenn ein Test bricht nach Rename — Phase pausiert, kein Blindfix

**Kommando:** `/gsd-autonomous --only 18`

Interaktiv wenn bei Ambivalenzen Input nötig: `/gsd-autonomous --only 18 --interactive`

---

## Technische Notizen

- **knip** als Tool für Unused-Exports-Detection: `pnpm dlx knip` gibt eine Liste. Kann in `package.json` als Script + CI-Check gehängt werden.
- **git mv** bei Renames — Git erkennt das als Rename statt Delete+Add, History bleibt nachvollziehbar.
- **Tests zuerst laufen lassen** als Baseline, dann nach jedem Simplify-Commit nochmal. Bei Test-Break → Root-Cause im Rename, nicht Feature.

---

## Referenzen

- `.planning/codebase/CONCERNS.md` (entsteht durch Map)
- `.planning/codebase/QUALITY.md` (entsteht durch Map)
- GSD Skill `/gsd-map-codebase` — bevor diese Phase geplant wird

---

**Erstellt:** 2026-04-18 · Vorbereitung vor Map-Lauf · Scope wird nach Map konkret
