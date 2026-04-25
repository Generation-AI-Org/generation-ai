---
created: 2026-04-25
status: active
---

# Branch Workflow — Multi-Phase Pre-Launch

> **Status seit 2026-04-25:** Wir sind in der Endphase vor dem Website-Launch (Milestone v4.0). Mehrere Phasen laufen parallel auf eigenen Feature-Branches. Statt einzeln zu mergen, sammeln wir alle Phasen auf einem **`develop`-Branch** und pushen erst zur Production wenn ALLES bereit ist.

## Pattern

```
                       ┌──────────────┐
   feature/phase-22.5──┤              │
   feature/phase-22.7──┤   develop    ├─── (bei Launch) ──► main ──► Vercel Prod
   feature/phase-25 ───┤  (Staging)   │
   feature/phase-26 ───┤              │
   feature/phase-27 ───┘              │
                       └──────────────┘
```

## Regeln

1. **Jede Phase = eigener Feature-Branch** vom aktuellsten `main` (oder bei Bedarf von `develop` wenn die Phase auf einer anderen baut).
2. **Phase fertig → merge in `develop`**, NICHT in `main`. PR optional, lokaler `git merge --no-ff` ist OK weil solo-dev.
3. **`main` ist Production.** Wird nur angerührt wenn der GANZE Stack auf `develop` ready ist und alle Phasen E2E getestet sind.
4. **`develop` ist Staging.** Vercel kann optional als zweite "preview"-URL tracken (`develop` Branch in Vercel-Project-Settings als Production-Branch-Alternative). Aktuell: branch-deploy für `develop` ist genug.

## Was wann passieren MUSS

### Beim Phasen-Start
- Neuen Branch von **`main`** erstellen: `git checkout main && git pull && git checkout -b feature/phase-XX-slug`
- (Falls Phase auf einer anderen Phase aufbaut: von dieser branchen, nicht von main)
- Vercel deployt automatisch Preview-URL für den Branch

### Beim Phasen-Abschluss
- Tests + Typecheck + E2E auf Preview grün
- Lokaler merge in `develop`:
  ```bash
  git checkout develop
  git pull origin develop
  git merge feature/phase-XX-slug --no-ff -m "chore: merge feature/phase-XX-slug into develop"
  git push origin develop
  ```
- Phase-FOLLOW-UP.md updaten mit `merged_to: develop (commit <hash>)` im Frontmatter
- Feature-Branch bleibt erhalten (nicht löschen) bis nach Prod-Merge

### Beim Launch (großer Push)
- Letzte Phase auf develop gemerged
- Alle Phasen E2E auf develop-preview verifiziert
- Plus Lighthouse + Smoke + Visual-Check
- Dann: PR `develop → main` ODER lokaler merge `git checkout main && git merge develop`
- Push main → Vercel auto-deploy zu Production
- Nach erfolgreichem Prod-Deploy: alte feature/phase-* Branches können gelöscht werden

## Was NICHT passieren darf

- ❌ **Direktes Push zu `main`** — main ist Production-Source-of-Truth. Nur über develop merge.
- ❌ **Force-Push zu develop oder main** — beide sind shared, würde anderer Sessions/Prod kaputt machen.
- ❌ **Cross-Phase-Files ohne Absprache anfassen** — Phase A sollte nur ihre eigenen Files berühren. Wenn Bug-Fix mehrere Phasen braucht, separater hotfix-branch.
- ❌ **Phase 26 worktree (`/Users/lucaschweigmann/projects/generation-ai-phase-26`) anrühren** — separate working dir, läuft eigenständig.

## Cross-Session Awareness

Diese Datei + `CLAUDE.md` (root) sind die Kommunikation zwischen parallelen Claude-Sessions:
- Wenn deine Session Phase X bearbeitet: bleib in deinem Feature-Branch.
- `develop` ist write-shared mit anderen Sessions — vor merge IMMER `git pull origin develop` machen.
- Conflicts beim Merge sind OK + lösbar. Niemals `git push --force` zu develop.

## Aktueller Stand auf develop

- Phase 25 (Circle API Sync) — gemerged 2026-04-25 (commit 473edf9)
- Andere Phasen folgen wenn fertig
