# Migration Notes

> Dokumentation der Monorepo-Migration.

**Gestartet:** 2026-04-13
**Status:** In Progress

---

## Was migriert wird

| Quelle | Ziel | Status |
|--------|------|--------|
| `GenerationAI/website/` | `apps/website/` | Pending |
| `GenerationAI/tools-app/` | `apps/tools-app/` | Pending |

---

## Legacy Repos (werden archiviert)

- **Website:** github.com/Generation-AI-Org/generation-ai-website
- **tools-app:** github.com/Generation-AI-Org/generation-ai-tools-app

Die Git-History bleibt in den archivierten Repos erhalten.

---

## Übernommene Docs

| Doc | Quelle | Übernommen als |
|-----|--------|----------------|
| Auth-Architektur | `GenerationAI/Decisions/Auth-Architecture.md` | `docs/decisions/auth-architecture.md` |
| Tech Decisions | `GenerationAI/Decisions/Tech-Decisions-Log.md` | `docs/decisions/tech-stack.md` |

---

## Was NICHT übernommen wird

- Alte `.planning/` Verzeichnisse → bleiben in archivierten Repos
- `GenerationAI/` Ordner → bleibt als Legacy-Referenz

---

## Vercel-Umstellung

Nach Migration:
1. Neues GitHub Repo: `generation-ai`
2. Website Vercel Project → Root Directory: `apps/website`
3. tools-app Vercel Project → Root Directory: `apps/tools-app`
4. Environment Variables übertragen
5. Alte Repos archivieren

---

*Letzte Aktualisierung: 2026-04-13*
