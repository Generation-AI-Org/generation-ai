---
"@genai/website": patch
"@genai/tools-app": patch
---

Phase 17: Supabase auth email templates vereinheitlicht auf React Email — 6 Templates (Confirm Signup, Magic Link, Reset Password, Change Email, Reauthentication, Invite) teilen ein Layout + Design-Tokens aus brand/tokens.json, theme-adaptiv via prefers-color-scheme. Copy aus brand/VOICE.md. HTML-Export via `pnpm -F @genai/emails run email:export`.
