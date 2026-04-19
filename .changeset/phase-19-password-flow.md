---
"@genai/tools-app": minor
---

Password-Flow für eingeloggte User: First-Login-Prompt beim Magic-Link-Login mit Skip-Option, und nachträgliches Setzen/Ändern des Passworts inline in /settings (Re-Auth via aktuelles Passwort bei Change). Recovery-Mail-Flow bleibt unverändert.

E2E-Baseline repariert: Tests laufen jetzt default gegen Prod (https://tools.generation-ai.org) mit realem Test-User aus GitHub-Secrets. chat.spec.ts angepasst für unauthenticated Prod-Reality (redirect to /login).
