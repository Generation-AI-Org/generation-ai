# Backlog — Generation AI

> Offene Items die Luca-Entscheidung oder manuelle Aktion brauchen

## Entscheidungen

- [x] **Vercel Pro upgraden?** — Entschieden: NEIN (2026-04-17). Plattform ist nicht-kommerziell (keine Einnahmen, nur Services ~200€/Monat Outlay). Hobby ist OK.
- [x] **CSP Header aktivieren** — Content-Security-Policy schützt vor XSS. Aktuell Report-Only (website) / fehlt ganz (tools-app). Edge-Runtime war Blocker. Wichtig, aber kein Notfall. **Erledigt Phase 13 (13-04 + 13-05): enforced CSP mit nonce + strict-dynamic auf beiden Apps.**

## DPAs

- [x] **Supabase DPA** — angefragt (2026-04-15)
- [x] **Resend DPA** — automatisch bei Signup aktiv

## Account-Setup

- [x] **Sentry Account** — eingerichtet, DSN im Code, Error-Tracking live
- [x] **Better Stack Account** — Uptime-Monitors eingerichtet
- [x] **Email-Umleitung info@generation-ai.org** — läuft über ImprovMX (admin@/hello@/noreply@ Aliases auf Luca's Postfach)

## Code-Fixes

- [x] **Telefonnummer** — +49 160 7080308 in allen Legal-Seiten
- [x] **SpeedInsights** — wieder aktiviert, lokal getestet ✓
- [x] **CSP Edge Runtime** — proxy.ts fixen (braucht Testing). **Erledigt Phase 13 (13-04 + 13-05): nonce-per-request in proxy.ts, prefetch aus matcher ausgeschlossen.**
- [x] **LLM Keys auf Vercel** — ZHIPU_API_KEY gelöscht ✓

---

## Backlog — Neu aufgenommen 2026-04-17

> Gesammelt in der Session nach dem Session-Drop-Fix. Luca-Input, noch nicht priorisiert.

### 🔐 Auth — Aus Phase 13 Audit (13-02)

- [ ] **Auth cookie httpOnly hardening (F1)** — gefunden in Phase 13 Audit, siehe docs/AUTH-FLOW.md Finding F1. `sb-` session cookie hat `httpOnly: false` weil `@supabase/ssr` Browser-Client den Token JS-seitig lesen muss. XSS könnte Session stehlen. Impact: medium (kein unmittelbarer Exploit ohne XSS-Vektor, aber schwaches Härtungsdefizit). Fix approach: Supabase SSR v2 "tokens-only" mode evaluieren (lagert Token in localStorage, setzt nur opaque cookie server-side) ODER HttpOnly-Proxy-Cookie-Pattern. Requires Supabase SSR research + migration.
- [x] **generateLink action_link hash-redirect (F2)** — gefunden in Phase 13 Audit, inline gefixt in Commit 582cd63. supabase-admin.ts baut jetzt PKCE confirm URL aus hashed_token statt rohem action_link.

### 🔐 Auth — Passwort-Flow vervollständigen (wichtig für Luca)

- [ ] **Passwort-Setzen-UI für User** — aktuell nur Magic-Link, nutzer kann Passwort nicht selbst setzen. Flow: Settings → "Passwort setzen/ändern" → Reset-Mail → neues Passwort.
- [ ] **Passwort-Reset end-to-end testen** — Code existiert, nie verifiziert. Per Playwright gegen Prod durchspielen.
- [x] **Supabase Email-Templates customizen** — erledigt in Phase 17 (React Email + Brand-Tokens + neon-terminal-style)
- [x] **Rate-Limit auf Login zurückstellen** — zurück auf Defaults (Luca 2026-04-19)

### 🔐 Auth — OAuth-Login (Circle-Integration)

- [ ] **Google OAuth** — 3-Klick-Login für Studierende, größter UX-Win. ~1 Tag.
- [ ] **Apple OAuth** — wichtig für iPhone-User. ~0.5 Tage.
- [ ] **GitHub OAuth** — optional, niedrige Priorität (kleine Zielgruppe).
- [ ] **Circle-Member-Erkennung** — Siehe Erklärung im Chat: Google OAuth ist separat von Circle. Circle-Member-Status muss per Circle-API gecheckt werden (Email-Lookup), dann `profiles.is_circle_member = true` → Pro-Modus automatisch.

### 🔐 Auth — Nice-to-have

- [ ] **2FA (TOTP)** — sobald sensible Daten im Spiel (Pro-Features, Billing). Supabase supportet das nativ.
- [ ] **Account-Delete-Verifikation** — Code existiert, aber wirklich *restlos* gelöscht? Test: Löschen → in Supabase prüfen ob alle FKs + auth.users + profiles wirklich weg.

### 🐛 Bugs tools-app

- [x] **Tool-Highlighting kaputt** — gefixt in v4.1.0 (recommendedSlugs-Pass-Through im `/api/chat` member-mode).
- [x] **Mobile Chat-Width springt auf ~80 %** — gefixt 2026-04-17: expanded Chat auf Mobile jetzt full-screen (`inset-0` + deckender `bg-[var(--bg)]`), Desktop bleibt 35%-Sidebar. FloatingChat.tsx:406.
- [x] **Mobile Shift+Enter** — verifiziert gefixt (Luca 2026-04-19)
- [x] **Desktop Chat-Input wächst nicht bei Transkription** — gefixt (Luca 2026-04-19)

### 🧪 Test-Infrastruktur

- [ ] **E2E-Baseline reparieren** — Nach Phase 18 bestätigt: `auth.spec.ts` (Password-Login sb-cookie test) + `chat.spec.ts` (3 Tests) failen bereits auf main. Ursachen: (a) `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` env nicht in CI gesetzt → auth-test wird übersprungen bzw. fehlt Fixture-User, (b) Chat-Tests erwarten `localhost:3001` Dev-Server, werden aber ohne `pnpm dev` ausgeführt. Fix: entweder `playwright.config.ts` webServer-autostart einrichten, oder Tests auf Prod-URL umstellen (wie `smoke.spec.ts`). Baseline: 2 fail / 8 skipped auf main@`f6928db`.

### 🎨 UI tools-app

- [x] **Mobile Header: Login/Logout-Button sichtbar im Header** — bereits erledigt (vor Audit 2026-04-17): `AppShell.tsx:170-222` hat farblich differenzierte Buttons — Login = accent-grün, Logout = neutral mit rotem Hover-State.
- [x] **Login-Seite: Logo statt grünem Punkt** — bereits erledigt (vor Audit 2026-04-17): `app/login/page.tsx:66-76` nutzt theme-aware Logo (`logo-blue-neon-new.jpg` / `logo-pink-red.jpg`) über dem Heading.
- [x] **Mobile-Polish allgemein** — durchgegangen (Luca 2026-04-19)
- [x] **Mobile Chat: Hintergrund deckend oder blurred** — gefixt (Luca 2026-04-19)
- [x] **Mobile Legal Footer: Sichtbarkeit + Schriftfarbe** — gefixt (Luca 2026-04-19)

### 📄 Content tools-app

- [ ] **Tool-Cards: Echte Summary statt Text-Anfang** — aktuell schneidet die Card den Intro-Text an. Cards brauchen eigenes Preview-Feld: Kernnutzen + Target-Group in 1–2 Sätzen, damit User entscheiden kann "lohnt sich das Klicken?"
- [ ] **Umlaut-Audit DB-Content** — alle Tool-Artikel in Supabase `content_items` (title, summary, use_cases, full-text) nach ae/oe/ue/ss scannen und auf echte Umlaute (ö/ä/ü/ß) umstellen. Code ist gefixt (Phase 14 Follow-up), DB noch nicht.
- [ ] **Tool-Detail-Seiten: Artikel-Qualität** — aktuell zu knapp/proprietär. Pro Tool: Use-Cases, Beispiele, Alternativen, Pricing-Details. Eigener Content-Workstream, nicht Feature-Arbeit.

### 🎬 Micro-Animations (Desktop ausbauen + Mobile bringen)

- [ ] **Sonnen-Rotation im Theme-Toggle** — aktuell nur auf Desktop? Auch auf Mobile bringen.
- [ ] **Diktier-Button Animation** (Audio-Bars) — auf Mobile verfügbar machen, falls nicht schon.
- [ ] **Paperclip / Attachment-Animation** — Polish.
- [ ] **Allgemein: Mobile-Parity für alle Desktop-Micro-Interactions** — durchgehen, Liste machen, portieren. Subtile Animations erhöhen Wertigkeit enorm.

### 💡 Feature-Ideen (zum Mitnehmen)

- [ ] **Smart-Links zu Circle** (Luca: "geile Idee") — jedes Tool zeigt, wo im Circle darüber diskutiert wird. Link zu Space/Thread mit Discussions.

### 💬 Chat überall — global Agent + Context-aware ✅ DONE in Phase 15

> Aufgenommen 2026-04-17. Luca: „wenn ich auf eine Toolseite gehe, wird der Agent nicht mehr angezeigt. Auch über Tools im Startseitefenster sinnvoll. Bei langen Artikeln Markdown nach links schieben, Agent rechts."

**Problem:** `FloatingChat` hängt nur im `AppShell`, und `AppShell` rendert nur `/`. Auf `/[slug]` (Tool-Detail) gibt es keinen Chat → UX-Bruch, User verliert Zugriff zum Agent genau dann wenn er fachliche Fragen hätte.

**Scope:**
1. **Chat global** verfügbar auf allen Routen (Home, Detail, Settings, Login bleibt bewusst ohne).
2. **Desktop Detail-Layout bei expanded Chat:** Artikel-Column schrumpft (z. B. `max-w-3xl` → `max-w-2xl`), Chat wird ~400px Sidebar rechts statt Floating. Beim Collapse zurück auf volle Breite. Vorbild: Notion AI, ChatGPT Canvas.
3. **Mobile:** Floating-Behavior wie bisher, Bottom-Sheet über Artikel. Kein Split.
4. **Agent-Context:** aktueller Slug/Title als Extra-System-Message an `/api/chat` → Antworten im Kontext des gerade gelesenen Tools.

**Architektur-Plan (grob):**
- `AppShell` splitten in `GlobalLayout` (Header + FloatingChat) + `HomeLayout` (Filter + CardGrid).
- `GlobalLayout` in `app/layout.tsx` oder als Wrapper in `(group)/layout.tsx`.
- Detail-Route `/[slug]` nutzt nur `GlobalLayout` (Header + Chat), Content ist der Artikel.
- `FloatingChat` prop `context?: { slug, title, type }` — bei Detail-Route gesetzt, bei Home null.
- Tool-Highlighting no-op wenn kein CardGrid präsent (`onHighlight` ignorieren).
- Session-ID persistieren (SessionStorage) damit Chat Navigation überlebt.

**Nebenbei mitbedenken:**
- Empty-State pro Route (Detail: „Fragen zu [ToolName]?" statt generisch).
- FloatingChat bleibt `next/dynamic`, `requestIdleCallback`-Preload für schnellen ersten Open.
- Analytics-Event `chat_opened_from_route` → nach 2 Wochen nutzungsbasiert entscheiden ob Feature-Scope ausweiten.
- Desktop Chat-Input auto-resize bei Transkription (separater Backlog-Eintrag) sollte vor oder gleichzeitig gefixt werden — sonst schwebt der Bug in den neuen Layouts mit.

**Nicht-Ziele in der ersten Runde:**
- Cross-Session-Chat-Historie in UI (zeige keine Past-Sessions-List) — separater Scope.
- Pro-Only vs. Public-Chat-Logik auf Detail-Seiten — vermutlich gleiche Mode-Detection wie Home.

### 🔧 Phase 19 — Code-Review Follow-ups (nicht-blockierend)

Aus `19-REVIEW.md`, nach Phase-19-Closure getrackt. In nächster passender Phase abarbeiten (z.B. beim nächsten Auth- oder Test-Touch).

- [ ] **WR-03:** `packages/e2e-tools/tests/chat.spec.ts` → `auth-gate.spec.ts` umbenennen. File testet jetzt `/settings` Auth-Gate, nicht mehr `/chat`. Filename + Describe alignen.
- [ ] **IN-04:** `export const dynamic = 'force-dynamic'` in `apps/tools-app/app/auth/confirm/route.ts` ergänzen. Route ist aktuell bereits dynamic (wegen `cookies()`-Zugriff via Supabase-Server-Client), aber explizit ist sicherer. Siehe `LEARNINGS.md` CSP-Regel.
- [ ] **IN-05:** Tri-state `has_password`-Check (3× dupliziert in `/auth/confirm/route.ts`, `/auth/callback/page.tsx` 2× Branches) in Helper extrahieren. Vorschlag: `@genai/auth/lib/has-password.ts` mit `needsFirstLoginPrompt(user): boolean`.
- [ ] **CI e2e-env:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` im `.github/workflows/ci.yml` e2e-Job ergänzen. Ist aktuell nur in build-Steps gesetzt, e2e-Step könnte bei Tests die den Anon-Client brauchen failen.

### 🧱 Fundament-Stufen (aus STATE.md) ✅ DONE

- [x] **Stufe 1:** `/gsd-map-codebase` — gelaufen 2026-04-19
- [x] **Stufe 2:** Auth-Flow-Audit — Phase 13 complete
- [x] **Stufe 3:** Simplify-Pass tools-app — Phase 18 complete

### 🔐 Signup-Reactivation (wenn Signup wieder geöffnet wird)

Alter Code in `apps/website/app/api/auth/signup/route.ts` steht aktuell auf 503 (pre-launch). Beim Restore aus Git-History (`git show 44f7c97:apps/website/app/api/auth/signup/route.ts`) folgendes **unbedingt anpassen**:

**BEFORE (Git-History):**
```ts
user_metadata: {
  full_name: name,
}
```

**AFTER (richtig):**
```ts
user_metadata: {
  name: name,        // ← Mail-Template liest {{ .Data.name }} + Supabase Dashboard zeigt Display-Name
  full_name: name,   // ← Konvention, wird auch von Google/Apple-OAuth auto-gesetzt
}
```

Ohne diese Änderung: neue User kriegen „Hey ," in Auth-Mails (Template-Variable matcht nicht).

**Kontext:** Bei bestehenden Accounts wurden `name` + `full_name` am 2026-04-19 via SQL-Update konsistent gemacht. Der Signup-Code muss dieselbe Konvention beim Create anwenden, sonst driften wir wieder auseinander.

**Verwandt:** Signup-Form sollte ein Name-Pflichtfeld haben (aktuell im Form bereits vorhanden laut Git-History), plus Datenschutz-Checkbox.
