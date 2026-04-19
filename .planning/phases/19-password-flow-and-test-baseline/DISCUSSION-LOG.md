# Phase 19: Password-Flow + Test-Baseline — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 19-password-flow-and-test-baseline
**Areas discussed:** has_password-Storage, Skip-Verhalten, Settings-Flow, Recovery-Mail-Copy, E2E-Test-Strategie, E2E-baseURL

---

## has_password-Storage

| Option | Beschreibung | Selected |
|--------|--------------|----------|
| A: DB-Flag in `profiles`-Tabelle | Neue Spalte + Migration + RLS-Regeln + extra DB-Query pro Login | |
| B: `user_metadata` (Supabase native) | `updateUser({ data: { has_password } })`, direkt in Session, keine Migration | ✓ |

**User's choice:** B
**Notes:** Kein Schema-Change, direkt im Session-Objekt verfügbar. A wäre overkill für ein einzelnes Boolean.

---

## Skip-Verhalten

| Option | Beschreibung | Selected |
|--------|--------------|----------|
| A: Skip = nie wieder fragen | `has_password=false` explizit, Re-Entry über Settings | ✓ |
| B: Skip nur diese Session | Prompt erscheint bei jedem Magic-Link wieder | |
| C: Skip + „Nicht mehr fragen"-Checkbox | Extra Klick, mehr UX-Noise | |

**User's choice:** A (mit expliziter Bestätigung dass Settings-Eintrag als Re-Entry existiert)
**Notes:** User-Entscheidung wird respektiert. Meinungsänderung geht über Settings. Klarer als Cookie-Banner-artige Wiederholungen.

---

## Settings-Flow (Inline vs. Mail-Loop)

| Option | Beschreibung | Selected |
|--------|--------------|----------|
| A: Recovery-Mail-Loop | Click → Mail → Link → Set-Password-Screen | |
| B: Inline-Form direkt in Settings | User ist eingeloggt, direkte Form | ✓ |
| C: Hybrid (Inline beim Setzen, Mail beim Ändern) | Doppelte UX-Logik | |

**User's choice:** B (nach Rückfrage zu Sicherheit)
**Notes:** Initial Sorge wg. Sicherheit ohne Mail-Verifikation. Analyse zeigte: Mail-Loop schützt **nicht** vor Session-Theft (Angreifer mit Cookie hat i.d.R. auch Mail-Zugang im gleichen Browser). Entschieden für GitHub/Google-Pattern: Inline-Form + Re-Auth via aktuelles Passwort bei Change. Für noch-kein-Passwort-Case reicht Session als Auth-Evidence.

### Threat-Model-Analyse
| Szenario | Mail-Loop schützt? | Inline+Re-Auth schützt? |
|---|---|---|
| Session-Cookie gestohlen (XSS/Laptop offen) | Nein (Mail-Inbox meist im gleichen Browser) | Nein (aber bei Change: Re-Auth schützt) |
| Nur Mail-Zugriff (kein Session) | Nein (Reset übernehmbar) | Ja (keine Session = keine Änderung) |

---

## Recovery-Mail-Copy

| Option | Beschreibung | Selected |
|--------|--------------|----------|
| A: Text neutralisieren (beide Cases: erstmalig + vergessen) | Erforderlich bei Mail-Loop-Settings-Flow | |
| B: Text bleibt („Passwort zurücksetzen") | Nur noch für Vergessen-Case verwendet | ✓ |

**User's choice:** B (implizit durch Wahl von Inline-Form in Settings)
**Notes:** Mail wird nur noch vom Login-Screen aus verwendet („Passwort vergessen"). Der aktuelle Text ist dort semantisch korrekt. Kein Re-Export, kein Supabase-Dashboard-Update nötig.

---

## E2E-Test-Strategie (Password-Login-Test)

| Option | Beschreibung | Selected |
|--------|--------------|----------|
| A: `test.skip()` mit Backlog-Ref | Einfachster Baseline-Fix, keine Coverage | |
| B: Form-only-Check | Kein echter Login, wenig Mehrwert | |
| C: Echter Test-Account in Supabase + GitHub-Secret | Echte E2E-Coverage, Manual-Setup nötig | ✓ |

**User's choice:** C
**Notes:** User übernimmt Test-Account-Setup selbst (Supabase-User anlegen + GitHub-Secrets setzen). Test-User braucht für Phase 19 nur Login-Fähigkeit — keine Chat-History, kein `has_password=true` Preset.

---

## E2E-baseURL

| Option | Beschreibung | Selected |
|--------|--------------|----------|
| A: Prod-Default mit Env-Override | `process.env.E2E_BASE_URL ?? 'https://tools.generation-ai.org'` | ✓ |
| B: Env-Var required, sonst Error | Mehr Boilerplate, kein Mehrwert | |
| C: localhost-Default | Braucht Dev-Server-Setup, nicht im Scope | |

**User's choice:** A (implizit via Option C bei Test-Strategie)
**Notes:** Matcht `smoke.spec.ts`-Pattern. CI läuft ohne Extra-Config gegen Prod, lokale Dev kann überschreiben.

---

## Claude's Discretion

- UI-Details der Inline-Form (Spacing, Labels, Error-States) — Brand-Tokens aus Phase 16
- Position des Passwort-Blocks in `/settings`
- Art des Success-Feedbacks (Toast vs. Banner vs. Inline-Message)
- Password-Policy-Details innerhalb Supabase-Defaults (min 8 Zeichen ist gesetzt)

---

## Deferred Ideas

- Echter End-to-End-Password-Reset-Test (Mail-Inbox-Scraping nötig)
- Password-Strength-Meter
- OAuth Google/Apple (bleibt in BACKLOG)
- 2FA (eigene Phase)
- Session-Invalidation bei Passwort-Change auf anderen Geräten (Supabase-Default-Verhalten reicht)
