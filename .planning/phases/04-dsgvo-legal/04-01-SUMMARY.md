---
phase: 04-dsgvo-legal
plan: 01
subsystem: legal
tags: [dsgvo, impressum, datenschutz, compliance]
dependency_graph:
  requires: []
  provides: [legal-pages, ddg-compliance, tdddg-compliance, claude-api-disclosure]
  affects: [website, tools-app]
tech_stack:
  added: []
  patterns: [legal-footer-links, responsive-legal-nav]
key_files:
  created:
    - apps/tools-app/app/impressum/page.tsx
    - apps/tools-app/app/datenschutz/page.tsx
  modified:
    - apps/website/app/impressum/page.tsx
    - apps/website/app/datenschutz/page.tsx
    - apps/tools-app/components/AppShell.tsx
decisions:
  - "TDDDG statt TTDSG (aktuelle Gesetzesbezeichnung seit 2021)"
  - "DDG statt TMG (Digitale-Dienste-Gesetz seit 2023)"
  - "MStV statt RStV (Medienstaatsvertrag)"
  - "Telefonnummer als Placeholder bis echte Nummer verfuegbar"
  - "Legal-Links in tools-app Header (Desktop) und Footer (Mobile) fuer 1-Click-Zugang"
metrics:
  duration_seconds: 293
  completed: 2026-04-14
  tasks_completed: 3
  files_changed: 5
---

# Phase 04 Plan 01: Legal Pages Update Summary

DDG-konforme Impressum- und Datenschutzseiten mit aktuellen Gesetzesreferenzen und Claude API Disclosure.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Website Legal Pages Update | 5bbf69b | impressum/page.tsx, datenschutz/page.tsx |
| 2 | tools-app Legal Pages Create | e6c431a | impressum/page.tsx, datenschutz/page.tsx |
| 3 | Footer-Links hinzufuegen | 65e22ee | AppShell.tsx |

## Key Changes

### Task 1: Website Legal Pages
- **Impressum:** TMG -> DDG (Paragraph 5 DDG)
- **Impressum:** RStV -> MStV (Paragraph 18 Abs. 2 MStV)
- **Impressum:** Telefonnummer-Placeholder hinzugefuegt
- **Datenschutz:** TDDDG Rechtsgrundlage fuer Cookies dokumentiert
- **Datenschutz:** Anthropic Claude API als Drittanbieter dokumentiert

### Task 2: tools-app Legal Pages
- Neue Impressum-Seite mit DDG-Referenz erstellt
- Neue Datenschutz-Seite mit TDDDG-Referenz erstellt
- Chat-Verlauf-spezifischer Datenschutz-Abschnitt hinzugefuegt
- Circle.so Abschnitt entfernt (nicht relevant fuer tools-app)

### Task 3: Footer-Links
- Website: Legal-Links bereits vorhanden (keine Aenderung noetig)
- tools-app: Legal-Links im Header (Desktop) und Footer (Mobile) hinzugefuegt
- 1-Click-Zugang von jeder Seite aus gewaehrleistet

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| Telefon: +49 XXX XXXXXXXX | apps/website/app/impressum/page.tsx | Echte Telefonnummer muss manuell eingetragen werden |
| Telefon: +49 XXX XXXXXXXX | apps/website/app/datenschutz/page.tsx | Echte Telefonnummer muss manuell eingetragen werden |
| Telefon: +49 XXX XXXXXXXX | apps/tools-app/app/impressum/page.tsx | Echte Telefonnummer muss manuell eingetragen werden |
| Telefon: +49 XXX XXXXXXXX | apps/tools-app/app/datenschutz/page.tsx | Echte Telefonnummer muss manuell eingetragen werden |

**Note:** Die Telefonnummer-Stubs verhindern nicht die Erreichung des Plan-Ziels. Sie sind als TODO-Kommentare markiert und erfordern die Eingabe der echten Kontaktnummer durch den Projektverantwortlichen.

## Verification Results

```
DDG References: website=1, tools-app=1
TDDDG References: website=1, tools-app=1
Claude/Anthropic References: website=4, tools-app=4
pnpm build: SUCCESS (both apps)
```

## Self-Check: PASSED

- [x] apps/website/app/impressum/page.tsx exists
- [x] apps/website/app/datenschutz/page.tsx exists
- [x] apps/tools-app/app/impressum/page.tsx exists
- [x] apps/tools-app/app/datenschutz/page.tsx exists
- [x] Commit 5bbf69b exists
- [x] Commit e6c431a exists
- [x] Commit 65e22ee exists
