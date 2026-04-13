# Plan Verification — Phase 2: Shared Packages

**Erstellt:** 2026-04-13
**Verifikation durch:** Plan Checker (goal-backward)
**Geprüfte Dateien:** 02-01-PLAN.md, 02-02-PLAN.md, CONTEXT.md, RESEARCH.md, ROADMAP.md, REQUIREMENTS.md

---

## Verdict: FLAG

---

## Summary

Die Plans sind grundsätzlich ausführbar und decken die Kernrequirements ab. Zwei relevante Lücken verhindern ein PASS: N-03 (Dependency Consistency via pnpm catalog) ist in keinem Plan mit konkreten Tasks adressiert, und der aus dem Research bekannte `lib/supabase.ts`-Cleanup in tools-app ist nur als "Offene Frage" in CONTEXT.md vermerkt — fehlt aber als Task in Plan 02-01, obwohl er explizit dort erwartet wird. Risikobewusstsein und Kodierqualität der Plans sind gut.

---

## Requirement Coverage

| Req | Covered | Plan | Notes |
|-----|---------|------|-------|
| R-04 | ✅ | 02-01 | createClient (browser/server), createAdminClient, getUser/getSession vorhanden |
| R-05 | ✅ | 02-02 | ContentItem, ContentItemMeta, UserProfile vorhanden — "Profile Types" als Placeholder akzeptabel |
| R-06 | ✅ | 02-02 | TSConfig, ESLint, Tailwind base.css alle enthalten |
| N-02 | ✅ | — | Kein Task nötig — RESEARCH belegt dass turbo.json bereits korrekt konfiguriert ist |
| N-03 | ⚠️ | — | Kein Plan adressiert pnpm catalog — RESEARCH empfiehlt es explizit, Plans ignorieren es komplett |

### N-03 Detail

RESEARCH.md dokumentiert ausführlich die pnpm `catalog:`-Lösung (Sektion "Dependency Consistency") und bestätigt, dass pnpm 10.8.1 sie unterstützt. Weder 02-01 noch 02-02 enthalten einen Task für `pnpm-workspace.yaml` catalog-Einträge. Das Requirement N-03 "alle Apps nutzen identische Versionen" ist damit nicht operativ umgesetzt — es gibt keinen Mechanismus der Versions-Drift verhindert.

---

## Quality Assessment

| Criterion | Score | Notes |
|-----------|-------|-------|
| Completeness | 3/5 | N-03 ohne Task, lib/supabase.ts Cleanup fehlt, middleware.ts aus Research nicht in Plan |
| Executability | 4/5 | Code-Snippets sind vollständig und konkret, Pfade klar. Kleines Problem: eslint import-Pfad Inkonsistenz |
| Consistency | 4/5 | Plans folgen den CONTEXT.md-Entscheidungen korrekt. Tailwind @import Pattern korrekt dokumentiert |
| Verifiability | 4/5 | Verification-Schritte sind vorhanden und sinnvoll. Manual-Step für Browser-Test explizit |
| Risk Awareness | 4/5 | Risks-Tabellen vorhanden, OQ-1/A3 Annahmen dokumentiert. Fehlend: kein Rollback-Plan |

---

## Issues Found

### [HIGH] N-03 ohne implementierenden Task

**Requirement:** N-03 — Dependency Consistency
**Problem:** RESEARCH empfiehlt pnpm `catalog:` als Lösung. Kein Plan enthält einen Task für `pnpm-workspace.yaml` Anpassung oder einen alternativen Mechanismus. Das Requirement gilt nach Phase 2 als erfüllt (laut ROADMAP), aber die Packages werden ohne Versionsverankerung erstellt.
**Fix:** In 02-02 Task 3 oder als eigenen Task: `pnpm-workspace.yaml` um `catalog:` Sektion ergänzen, Apps-package.json auf `"catalog:"` umstellen.

---

### [HIGH] tools-app lib/supabase.ts Cleanup fehlt als Task

**Problem:** RESEARCH.md Sektion "tools-app Konsolidierung" dokumentiert detailliert, dass `lib/supabase.ts` nach Migration gelöscht und 9 Import-Stellen in content.ts, kb-tools.ts, api/chat/route.ts umgestellt werden müssen. CONTEXT.md OQ-1 sagt explizit "Kann in Plan 02-01 Task 3 oder als separater Cleanup-Task" — aber Plan 02-01 Task 3 listet nur die lib/supabase/-Wrapper, nicht die lib/supabase.ts-Nutzer.
**Konsequenz:** Nach Execution haben beide Apps @genai/auth, aber tools-app hat weiterhin den alten, redundanten `createServerClient` aus lib/supabase.ts. TypeScript-Check wird bestehen (keine Fehler), aber die Duplizierung bleibt. Das verletzt den Geist von R-04 ("beide Apps importieren von @genai/auth").
**Fix:** Plan 02-01 Task 3 um explizite Datei-Liste erweitern: content.ts (4x), kb-tools.ts (4x), api/chat/route.ts (1x) auf `@genai/auth/admin` umstellen, danach `lib/supabase.ts` löschen.

---

### [MEDIUM] packages/auth/src/middleware.ts fehlt im Plan

**Problem:** RESEARCH.md dokumentiert `tools-app/lib/supabase/proxy.ts` als Candidate für `@genai/auth/middleware`. Die Research-Struktur listet `middleware.ts` explizit in `packages/auth/src/`. Plan 02-01 enthält weder Datei noch Export-Eintrag für `/middleware`. 
**Konsequenz:** Die proxy.ts in tools-app bleibt auf den lokalen `lib/supabase/proxy`-Import angewiesen, statt auf das shared Package. Das ist kein Fehler, aber eine verpasste Extraktion die RESEARCH als sinnvoll bewertet hat.
**Fix:** Entweder explizit als "bewusst ausgelassen" in Plan dokumentieren (mit Begründung), oder `packages/auth/src/middleware.ts` + Export hinzufügen.

---

### [MEDIUM] ESLint Import-Pfad Inkonsistenz

**Problem:** CONTEXT.md D-06 und Plan 02-02 Task 2 definieren den Export als `"./eslint/next.mjs": "./eslint/next.mjs"`. Plan 02-02 Task 3 zeigt den App-Import als:
```javascript
import { nextConfig } from "@genai/config/eslint/next";
```
aber der package.json Export-Key ist `"./eslint/next.mjs"`. Das bedeutet der tatsächliche Import-Pfad müsste `@genai/config/eslint/next.mjs` sein (mit Dateiendung), nicht `@genai/config/eslint/next`.

RESEARCH.md (Sektion "ESLint Shared Config") zeigt den korrekten App-Import als:
```javascript
import { nextConfig } from "@genai/config/eslint/next.mjs";
```
Plan 02-02 Task 3 hat aber `@genai/config/eslint/next` ohne `.mjs`. Das wird beim Import fehlschlagen.
**Fix:** Entweder Export-Key auf `"./eslint/next"` ändern, oder App-Import-Pfad auf `@genai/config/eslint/next.mjs` korrigieren.

---

### [LOW] Keine Rollback-Dokumentation

**Problem:** Beide Plans haben Risk-Tabellen, aber keine expliziten Rollback-Schritte. Falls der CSS-@import (A2) oder der Next.js-Transpile (A1) fehlschlägt, ist unklar wie man die Migration rückgängig macht.
**Fix:** Kurzer Rollback-Hinweis pro Plan: "Falls X fehlschlägt: git checkout apps/*/lib/supabase/ und package aus dependencies entfernen."

---

### [LOW] Fehlender `pnpm-workspace.yaml` Eintrag für packages

**Problem:** Weder Plan bestätigt, dass `pnpm-workspace.yaml` bereits `"packages/*"` enthält, oder ergänzt es falls nicht. RESEARCH bestätigt es ist bereits korrekt, aber kein Verification-Step prüft das explizit.
**Empfehlung:** Als erster Verify-Step in 02-01: `cat pnpm-workspace.yaml` um sicherzustellen dass packages/* gelistet ist.

---

## Context Compliance Check

| Entscheidung | In Plan umgesetzt | Notes |
|---|---|---|
| D-01: Internal Packages ohne Build-Step | ✅ | package.json in beiden Plans korrekt: `"main": "./src/index.ts"` |
| D-02: Auth Package mit Subpath-Exports | ✅ | Plan 02-01 hat alle 4 Subpaths: browser, server, admin, helpers |
| D-03: Cookie-Options als Parameter | ✅ | browser.ts akzeptiert `cookieOptions?`, tools-app übergibt Domain |
| D-04: Content-Types shared, Chat-Types lokal | ✅ | content.ts im Package, ChatMessage/KB-Types in lib/types.ts |
| D-05: Tailwind via @import | ✅ | base.css korrekt, App globals.css zeigt korrekten Import |
| D-06: ESLint Re-Export Pattern | ⚠️ | Implementiert, aber Import-Pfad-Inkonsistenz (Medium-Issue oben) |

Keine Deferred Ideas aus REQUIREMENTS.md (UI Component Library, neue Features) in Plans enthalten. Context Compliance ist gut.

---

## Recommendations

1. **Vor Execution:** Plan 02-01 Task 3 um lib/supabase.ts-Cleanup erweitern — das sind 9 bekannte Import-Stellen mit konkreten Dateipfaden aus RESEARCH. Kein Mehraufwand, da RESEARCH sie bereits vollständig auflistet.

2. **Vor Execution:** ESLint Import-Pfad-Inkonsistenz korrigieren (Medium-Issue). Ein ESLint-Fehler beim ersten `pnpm lint` wäre vermeidbar.

3. **Vor Execution oder als expliziter Task:** N-03 adressieren. Minimaler Aufwand: pnpm-workspace.yaml catalog-Sektion hinzufügen und shared deps (`react`, `next`, `@supabase/*`, `typescript`) eintragen. 15 Minuten Arbeit, verhindert Versions-Drift dauerhaft.

4. **Dokumentation:** Fehlende middleware.ts-Entscheidung explizit festhalten — entweder als "out of scope" in CONTEXT.md oder als Task in Plan 02-01. Jetzt ist es ein stilles Gap.

5. **Assumption A1 und A2 früh testen:** Beide Plans setzen voraus dass Next.js 16 Packages automatisch transpiliert (A1) und PostCSS node_modules-Imports auflöst (A2). Beide sind ASSUMED in RESEARCH. Empfehlung: Zuerst ein minimales Package (z.B. nur @genai/config mit leerem tsconfig/base.json) anlegen und `pnpm build` laufen lassen, bevor der volle Scope implementiert wird.

---

## Execution Order

Beide Plans können parallel entwickelt werden (keine Abhängigkeit), aber die empfohlene Sequence ist:

```
1. packages/config (kein Dependency, nur JSON/CSS/JS)
2. packages/types  (hängt von nichts ab)
3. packages/auth   (hängt von @genai/config für tsconfig ab)
4. pnpm install    (verlinkt alles)
5. Apps umstellen  (02-01 Task 3 + 02-02 Tasks 3+4)
6. TypeScript-Check + lint + dev
```

CONTEXT.md Dependency Graph sagt "beide parallel" — das stimmt für Entwicklung, aber Implementierungsreihenfolge sollte config → types → auth sein.
