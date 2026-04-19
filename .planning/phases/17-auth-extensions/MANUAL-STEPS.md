# Phase 17 — Manual Steps für Luca

> Nach Claude's Auto-Run: 3 Schritte, ~10 Minuten.

## 1. Email-Templates in Supabase einspielen

Dashboard → https://supabase.com/dashboard/project/wbohulnuwqrhystaamjc/auth/templates

Für jedes der 6 Templates: Body + Subject setzen. Body = Inhalt der HTML-Datei 1:1 reinpasten.

| Supabase-Feld | Body-Datei | Subject |
|---|---|---|
| Confirm signup | `apps/website/emails/dist/confirm-signup.html` | `Willkommen bei Generation AI 👋` |
| Magic Link | `apps/website/emails/dist/magic-link.html` | `Dein Anmelde-Link` |
| Change Email Address | `apps/website/emails/dist/email-change.html` | `Neue Mail-Adresse bestätigen` |
| Reset Password | `apps/website/emails/dist/recovery.html` | `Neues Passwort für Generation AI` |
| Reauthentication | `apps/website/emails/dist/reauth.html` | `Kurz bestätigen, dass du's bist` |
| Invite user | `apps/website/emails/dist/invite.html` | `[Name] hat dich zu Generation AI eingeladen` |

## 2. Rate-Limits auf Prod-Defaults

Dashboard → Auth → Rate Limits. Prüfen und ggf. auf diese Werte setzen (= Supabase-Defaults):

| Limit | Wert |
|---|---|
| Email-based rate limits | 30 per hour |
| OTP verifications | 30 per hour |
| Token refreshes | 150 per 5 min |
| Anonymous sign-ins | 30 per hour |

Grund: Phase 13 hat ggf. Test-Werte drin gelassen. Für unsere Nutzerzahl (<1000) reichen Defaults, sind Over-Engineering für alles drüber.

## 3. Smoke-Test

1. Auf eigenem Account: Passwort zurücksetzen triggern (Login-Seite → "Passwort vergessen")
2. Mail in Gmail Light prüfen → Logo rot, Button rot, lesbar
3. Gmail Dark-Mode aktivieren → Logo neon-grün, Button neon-grün, Background dunkel
4. Apple Mail Light + Dark gegenchecken
5. **Outlook Desktop (falls zur Hand):** Button muss gepaddete Pill sein, nicht nackter Link-Text — verifiziert dass VML-Fallback greift
6. Wenn alles passt: Luca meldet zurück an Claude "approved" → Phase-17 SUMMARY wird finalisiert

## Notes

- **Outlook-VML-Fallback via VML roundrect**: Die Buttons nutzen handgeschriebenes VML (`<v:roundrect>`) in `<!--[if mso]>...<![endif]-->` Conditional Comments. Outlook Desktop rendert dieses VML als gepaddete Pill. Moderne Clients (Gmail, Apple Mail) sehen das VML nicht — die erhalten den normalen `<a>` Link. Verifiziert im Export via `grep mso apps/website/emails/dist/*.html` — muss in allen 5 Button-Templates matchen (reauth hat keinen Button, nur OTP-Code).

- **pX/pY Hinweis**: Der ursprüngliche Plan nutzte `@react-email/button@0.0.10` mit `pX/pY` Props. Diese Version ist mit React 19 inkompatibel (forwardRef-Crash beim SSR). Der Fix: EmailButton.tsx schreibt das VML direkt via `dangerouslySetInnerHTML`. Gleicher Outlook-Output, aber React-19-safe.

## Troubleshooting

- **Logo erscheint nicht** → Website-Deploy auf Vercel abwarten (PNGs liegen unter `https://generation-ai.org/brand/logos/logo-wide-{red|neon}.png`)
- **Dark-Mode greift nicht in Gmail** → Gmail unterstützt `prefers-color-scheme` nur im Web-Client + neueren Mobile-Apps. Outlook ignoriert es — akzeptiertes Fallback: Light-Theme greift, Button bleibt via VML korrekt gepaddet.
- **Button in Outlook Desktop sieht aus wie nackter Link (kein Padding)** → VML-Fallback fehlt. Prüfen: `grep mso apps/website/emails/dist/recovery.html` muss matchen. Falls nicht: EmailButton.tsx hat kein `<!--[if mso]>` Markup — Datei prüfen.
- **{{ .ConfirmationURL }} erscheint wörtlich im Mail-Body** → Supabase hat die Variable nicht geparst. Sicherstellen, dass HTML 1:1 in das Body-Feld des richtigen Templates gepastet wurde (nicht in das Plain-Text-Feld).
