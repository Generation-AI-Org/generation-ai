---
phase: 04-dsgvo-legal
plan: 02
subsystem: tools-app
tags: [dsgvo, account-delete, art-17, self-service]
dependency_graph:
  requires: []
  provides: [account-delete-api, settings-page]
  affects: [auth.users, chat_sessions, chat_messages]
tech_stack:
  added: []
  patterns: [cascade-delete, two-step-confirmation]
key_files:
  created:
    - apps/tools-app/app/api/account/delete/route.ts
    - apps/tools-app/app/settings/page.tsx
    - apps/tools-app/app/settings/DeleteAccountButton.tsx
  modified:
    - apps/tools-app/components/chat/ChatPanel.tsx
decisions:
  - Settings link in ChatPanel header (not AppShell) - follows existing auth UI pattern
metrics:
  duration: ~10min
  completed: 2026-04-14
---

# Phase 04 Plan 02: Account Delete Summary

Self-Service Account-Loeschung fuer tools-app implementiert (Art. 17 DSGVO).

## One-Liner

DELETE /api/account/delete mit Cascade-Loeschung (messages -> sessions -> auth.users) und Settings-Seite mit Zwei-Schritt-Bestaetigung.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | API Route fuer Account-Loeschung | 1729842 | app/api/account/delete/route.ts |
| 2 | Settings-Seite mit Delete-Button | 8c48ce2 | app/settings/page.tsx, DeleteAccountButton.tsx |
| 3 | Navigation zur Settings-Seite | cc09b8d | components/chat/ChatPanel.tsx |

## Implementation Details

### API Route (DELETE /api/account/delete)

- Session-basierte User-Authentifizierung via `createClient()` (SSR)
- Cascade-Loeschung in korrekter Reihenfolge:
  1. `chat_messages` (user_id)
  2. `chat_sessions` (user_id)
  3. `auth.users` via `admin.auth.admin.deleteUser()`
- Service Role Client fuer Admin-Operationen
- Vollstaendige Fehlerbehandlung pro Schritt

### Settings Page (/settings)

- Server Component mit Auth-Check (redirect zu /login)
- Zeigt User-Email und Gefahrenzone
- DeleteAccountButton Client Component mit:
  - Zwei-Schritt-Bestaetigung (isConfirming State)
  - Loading-State waehrend Loeschung
  - Error-Handling mit Fehlermeldung
  - Redirect nach erfolgreicher Loeschung

### Navigation

- Settings-Icon (Zahnrad) im ChatPanel Header
- Nur fuer eingeloggte User sichtbar (mode === 'member')
- Platziert neben Abmelden-Button

## Deviations from Plan

### [Rule 2 - Critical Functionality] Settings link placement

**Issue:** Plan schlug AppShell.tsx vor, aber Auth-UI (Login/Logout) ist im ChatPanel.
**Fix:** Settings-Link in ChatPanel.tsx eingefuegt, konsistent mit existierendem Auth-Pattern.
**Reason:** Bessere UX - alle Auth-bezogenen Aktionen an einem Ort.

## Verification

- `pnpm build --filter=@genai/tools-app`: SUCCESS
- Route `/api/account/delete` in Build-Output
- Route `/settings` in Build-Output
- `deleteUser` wird in API Route verwendet

## Self-Check: PASSED

- [x] apps/tools-app/app/api/account/delete/route.ts existiert
- [x] apps/tools-app/app/settings/page.tsx existiert
- [x] apps/tools-app/app/settings/DeleteAccountButton.tsx existiert
- [x] Commit 1729842 existiert
- [x] Commit 8c48ce2 existiert
- [x] Commit cc09b8d existiert
