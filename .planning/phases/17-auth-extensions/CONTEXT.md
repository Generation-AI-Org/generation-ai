# Phase 17 — Auth Extensions · CONTEXT

> Vorbereitungs-Kontext für `/gsd-plan-phase 17`. Gehört in den Planner-Input.

---

## TL;DR

6 Supabase-Auth-Email-Templates auf **React Email** vereinheitlichen. Nutzt die Brand-Tokens aus Phase 16 (muss abgeschlossen sein). Theme-adaptiv via `prefers-color-scheme`. Copy aus `brand/VOICE.md` Microcopy-Library. Plus: Rate-Limits auf Prod-Werte setzen.

**Abhängigkeit:** Phase 16 muss durch sein (Brand-Tokens + Logo-Component sind da, sonst keine Wiederverwendung).

---

## Source of Truth

| Datei | Inhalt |
|---|---|
| `brand/DESIGN.md` §A | Mail-Strategie: adaptiv via `prefers-color-scheme`, kein Segment-Theming |
| `brand/DESIGN.md` §F | Mail-Logo-Matrix: Light → `logo-wide-red.svg`, Dark → `logo-wide-neon.svg` |
| `brand/VOICE.md` | Mail-Microcopy — Subjects, Bodies, Preview-Texts, Signaturen |
| `brand/tokens.json` | Farben + Radius + Spacing (muss zum Mail-Stack inlined werden) |
| `apps/website/lib/email.ts` | Bestehende Welcome-Mail als Ausgangspunkt, wird durch React Email ersetzt |

---

## Die 6 Supabase-Templates

| Template | Supabase-Name | Subject (aus VOICE.md) | Preview-Text |
|---|---|---|---|
| Welcome / Signup Confirm | `confirm-signup` | "Willkommen bei Generation AI 👋" | "Bestätige deine Mail, dann geht's los." |
| Magic Link | `magic-link` | "Dein Anmelde-Link" | "Dein Login-Link, gültig 15 Minuten." |
| Reset Password | `recovery` | "Neues Passwort für Generation AI" | "Setz dein Passwort in 60 Minuten zurück." |
| Change Email | `email-change` | "Neue Mail-Adresse bestätigen" | "Klick, um die Änderung zu bestätigen." |
| Reauthentication | `reauth` | "Kurz bestätigen, dass du's bist" | "Aus Sicherheitsgründen — nur ein Klick." |
| Invite | `invite` | "[Name] hat dich zu Generation AI eingeladen" | "Leg deinen Account an und leg los." |

Body-Copy für jedes Template folgt dem Muster aus `brand/VOICE.md` — Planner liest das vor dem Schreiben.

---

## Scope

### In-Scope

1. **React Email Setup**: `@react-email/components` + `react-email` CLI installieren. Dev-Server für Template-Preview während Entwicklung (`pnpm email dev`).
2. **Shared Layout** (`packages/emails/components/Layout.tsx` oder ähnlich): Header mit `<Logo />`, Body-Wrapper, Footer mit Adresse/Unsubscribe. Theme-adaptiv.
3. **6 Templates** implementieren. Bulletproof Buttons (VML-Fallback für Outlook). Preview-Text. Plain-Text-Fallback automatisch.
4. **Token-Mapping**: Brand-Farben aus `brand/tokens.json` inline in die Templates übernehmen (Email-Client-Kompatibilität — kein CSS-Variables-Support).
5. **HTML-Export** für Supabase Dashboard: `pnpm email:export` → generiert 6 HTML-Files in `apps/website/emails/dist/`.
6. **Rate-Limits** auf Prod-Werte setzen (siehe Manual-Steps).

### Out-of-Scope (bewusst)

- OAuth-Flows (Google/Apple) — bleibt im BACKLOG
- Passwort-Setzen-UI in Settings — Reset-Flow reicht
- E2E-Test Password-Reset — manuell verifiziert 2026-04-18
- Marketing-Emails / Newsletter — diese Phase nur Auth/Utility
- Custom-Domain für Resend-From-Adresse — separater Admin-Task

### Success Criteria

- [ ] Alle 6 Templates als React-Email-Components in `packages/emails/`
- [ ] Gemeinsamer Layout-Wrapper (Header + Footer), DRY
- [ ] Theme-adaptiv: Gmail Light + Dark, Apple Mail Light + Dark manuell verifiziert
- [ ] Brand-Logo korrekt (red in Light-Client, neon in Dark-Client)
- [ ] Copy aus `brand/VOICE.md` übernommen, Umlaute korrekt
- [ ] Preview-Texts gesetzt (alle 6)
- [ ] Bulletproof Buttons (Outlook-VML-Fallback vorhanden)
- [ ] HTML-Export-Script `pnpm email:export` generiert `dist/*.html`
- [ ] Login-Rate-Limit auf Prod-Werten (siehe Manual-Step)

---

## Vorschlag für PLAN.md-Struktur

### Wave 1 — Foundation
- Plan 17-01: React Email installieren, Shared-Layout-Component, Token-Mapping-Helper
- Plan 17-02: `<Logo />` aus Phase 16 für Mail-Kontext ertüchtigen (falls nicht schon erledigt)

### Wave 2 — Templates (parallelisierbar)
- Plan 17-03: Welcome + Reset Password + Magic Link
- Plan 17-04: Change Email + Reauthentication + Invite

### Wave 3 — Delivery
- Plan 17-05: HTML-Export-Script, Manual-Step-Dokumentation für Luca, Smoke-Test in Gmail/Apple Mail

---

## Manual Steps (Luca — nach Auto-Run)

**Luca-Anweisung vom 2026-04-19:** Claude soll Rate-Limits **nicht interaktiv fragen**, sondern die empfohlenen Werte direkt vorschlagen + 6 Template-HTMLs ausliefern. Luca spielt dann beides ohne weitere Rückfrage ein.

### 1. Supabase Dashboard → Auth → Email Templates

Inhalt aus `apps/website/emails/dist/*.html` in die 6 Template-Felder einspielen:

| Supabase-Feld | Lokale Datei |
|---|---|
| Confirm signup | `dist/confirm-signup.html` |
| Magic Link | `dist/magic-link.html` |
| Change Email Address | `dist/email-change.html` |
| Reset Password | `dist/recovery.html` |
| Reauthentication | `dist/reauth.html` |
| Invite user | `dist/invite.html` |

Subjects separat setzen (aus `brand/VOICE.md`):

| Template | Subject |
|---|---|
| Confirm signup | `Willkommen bei Generation AI 👋` |
| Magic Link | `Dein Anmelde-Link` |
| Reset Password | `Neues Passwort für Generation AI` |
| Change Email | `Neue Mail-Adresse bestätigen` |
| Reauthentication | `Kurz bestätigen, dass du's bist` |
| Invite | `[Name] hat dich zu Generation AI eingeladen` |

### 2. Supabase Dashboard → Auth → Rate Limits

**Empfohlene Prod-Werte** (Supabase-Defaults für Community-Plattform, passen zu Generation-AI-Scale):

| Limit | Wert | Zweck |
|---|---|---|
| Email-based rate limits (signup, signin, reset) | **30 per hour** | Ausreichend für normale User, bremst Spam-Wellen |
| OTP verifications | **30 per hour** | gleiche Logik |
| Token refreshes | **150 per 5 min** | Session-Refreshes im Normalbetrieb |
| Anonymous sign-ins | **30 per hour** | Schutz gegen Bot-Floods |

**Begründung:** Supabase-Defaults reichen für unsere aktuelle Nutzerzahl (<1000 registrierte User). Sollten wir in eine DDoS-Welle oder Viral-Peak laufen, ist das ein Upgrade-Task (Phase in separater Milestone) — aktuell Over-Engineering.

Diese Werte sind **out-of-the-box die Supabase-Defaults**, d. h. wenn Dashboard auf „Reset to defaults" gesetzt ist, ist nichts zu tun. Luca prüft nur, ob die Test-Werte aus Phase 13 noch drin sind — wenn ja, auf Defaults zurücksetzen.

### 3. Verifikation

- Test-Mail triggern: eigener Account → Passwort zurücksetzen → Mail erhalten
- In Gmail Light + Dark + Apple Mail prüfen (Screenshots machen für Doku)
- Wenn alles passt: als Success commit-taggen

---

## Pre-Approved für Autonomous-Run

- Code-Generation: voll autonom
- Package-Install: OK
- Commit + Push auf feat-Branch: OK
- Changeset: patch (v4.3.x)
- **Stop-Gate**: Manual-Steps am Ende — Claude liefert HTML + Anleitung, Luca klickt ins Supabase-Dashboard
- **Visual-Check-Pause**: wenn Planner unsicher bei Copy-Varianten oder Layout-Entscheidungen (z. B. CTA-Farbe auf dunklem BG) — pausiert für Luca-Input

**Kommando:** `/gsd-autonomous --only 17`

Falls Rate-Limit-Werte diskutiert werden müssen: `/gsd-autonomous --only 17 --interactive`.

---

## Technische Notizen

- **Mail-Clients-Kompatibilität**: Gmail, Apple Mail, Outlook (Desktop + Web), Yahoo. React Email deckt das ab.
- **Farb-Inlining**: Brand-Tokens müssen als `style="color: #F5133B"` direkt in HTML — keine CSS-Variablen, kein Tailwind. React Email macht das automatisch wenn man Inline-Styles nutzt.
- **Logo als Bild**: SVG funktioniert in Mail-Clients **nicht zuverlässig**. Für Mail-Logos PNG-Export aus den SVGs generieren (via Sharp-Script oder Online-Tool), hosten unter `https://generation-ai.org/brand/logos/logo-wide-red.png` + `-neon.png`. Oder per Resend-Asset-URL.
- **Preview-Text**: Unsichtbarer Text am Anfang des Mail-Bodys, erscheint in Inbox neben Subject. React Email hat `<Preview />` Component dafür.
- **Plain-Text**: Automatisch generiert von React Email aus der Component-Hierarchie. Bei Bedarf überschreibbar.

---

## Referenzen

- React Email Docs: https://react.email/docs
- Supabase Email Template Variables: https://supabase.com/docs/guides/auth/auth-email-templates
- Bestehende `apps/website/lib/email.ts` als Ausgangspunkt + Referenz für bereits getestete Mail-Struktur

---

**Erstellt:** 2026-04-18 · nach Workshop-Session mit Luca
