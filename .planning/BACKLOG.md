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

- [x] **WR-03:** `packages/e2e-tools/tests/chat.spec.ts` → `auth-gate.spec.ts` umbenennen. File testet jetzt `/settings` Auth-Gate, nicht mehr `/chat`. Filename + Describe alignen.
- [x] **IN-04:** `export const dynamic = 'force-dynamic'` in `apps/tools-app/app/auth/confirm/route.ts` — commit `20ac816` (2026-04-20).
- [x] **IN-05:** `needsFirstLoginPrompt(user)` Helper in `@genai/auth/src/password.ts` — commit `8ded103` (2026-04-20).
- [x] **CI e2e-env:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` im e2e-Job — commit `89f9163` (2026-04-20).

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

---

## Backlog — Neu aufgenommen 2026-04-25 (Phase 22.6 Closure)

### 🧪 Phase 22.6 — UAT Follow-up

- [ ] **Item 6 — Logged-in tools-app Regression-Smoke (~5min)** — auf develop-Preview (https://tools-app-git-develop-lucas-projects-e78962e9.vercel.app) live verifizieren. Test-Steps: Lite-Account einloggen → CTAs verschwinden → Settings + Signout sichtbar → Tool-Card-Click → Detail-Page lädt → Chat funktioniert → Lite/Pro Toggle in Settings → Logout → CTAs zurück. Phase 12/19 Auth-Schutz-Verifikation. Source: `.planning/phases/22.6-pre-launch-polish-bundle/22.6-HUMAN-UAT.md` §6.

### 🔧 Phase 22.6 — Code-Review Follow-ups (V1-akzeptabel, nicht-blockierend)

Aus `22.6-REVIEW.md` (4 Warnings · 6 Info, 0 Critical). Pre-launch nicht blocking. In nächster passender UI/Test-Phase abarbeiten oder bei tools-app Polish-Pass mitnehmen.

- [ ] **WR-01: Mobile-Burger Accessibility-Härtung** — Escape-Handler, Auto-Focus auf erstes Item beim Open, optional Focus-Trap. Executor (Plan 09) hat das bewusst übersprungen um Zero-Deps zu bleiben — Escape + `role="dialog"` sind in ~10 Zeilen ohne neue Deps machbar. File: `apps/tools-app/components/layout/GlobalLayout.tsx` (Z. 311-380).
- [ ] **WR-02: HomeLayout State-Reset Inkonsistenz** — Backdrop-Click schließt nur Search-Overlay, Escape resetted alles. Bug oder Absicht? Code-Kommentar fehlt. File: `apps/tools-app/components/HomeLayout.tsx`.
- [ ] **WR-03: Mobile-Nav E2E-Coverage fehlt** — `tools-app.spec.ts` hat 5 Tests aber keinen einzigen Mobile-Burger-Tap. Test-Snippet vorgeschlagen in `22.6-REVIEW.md`.
- [ ] **WR-04: B-req-5 schwacher Assert** — `toHaveCount(1)` statt `toBeVisible()` weil Buttons `md:hidden` sind. Würde nicht catchen wenn Buttons später auf Desktop sichtbar werden. File: `packages/e2e-tools/tests/tools-app.spec.ts`.

### 🚀 Tools-app Performance-Phase (post-launch, eigene Phase)

- [ ] **Bundle-Optimierung tools-app** — Aktuell Lighthouse Performance **78** (LCP 4.0s, 705 KiB unminified JS, 2.7 MB unused JS). Pre-22.6 Baseline war 53, Phase 22.6 hat +25 gebracht — 90er-Schwelle erfordert eigene Bundle-Phase. Approach: next/image für Tool-Logos · dynamic imports für tool-detail-page · code-splitting der 200+ Tool-Cards · Reduce unused JavaScript scan. **Nicht pre-launch-blocking.** Reports: `.planning/phases/22.6-pre-launch-polish-bundle/lighthouse/tools-app.report.html`.

### 🎨 Phase 22.6 — Side-Findings (post-launch)

- [ ] **Tools-app shared header → packages/ui extrahieren (B-08 V2)** — Aktuell sync-anchor MIRROR-Comment am File-Top der `apps/tools-app/components/layout/GlobalLayout.tsx` zeigt auf canonical Website-Header. Cheap V1. V2-Plan: shared `@genai/ui/Header` Component mit Theme-Prop, dann beide Apps importieren. Phase 28+ Backlog (UI-Polish-Phase nach Launch).

### 🧹 Cleanup nach 22.6

- [x] **Footer /events Polish** — drive-by commit `a28821b` auf develop, Header bleibt D-18-locked.
- [ ] **Lokal Branch löschen:** `git branch -d feature/phase-22.6-pre-launch-polish` — ist auf develop gemerged, kann lokal weg (remote auch wenn UAT Item 6 durch ist).

### 🎨 Phase 22.8 — Deferred Items

- [ ] **A-N04: ChatInput stop-button glow needs new --status-error-glow token** — `apps/tools-app/components/chat/ChatInput.tsx:86` uses `bg-red-500/80 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]`. Plan 22.8-02 constraint: no new tokens. Defer until DS-token expansion plan adds `--status-error-glow` (or `--status-error/40` with rgba helper). Then swap inline.
- [ ] **A-N07: Email template inline-CSS → packages/emails/src/tokens.ts refactor** — Email templates currently inline-CSS-style status colors (correct DS-mapping by value but not by import). Refactor to centralize in a shared `tokens.ts` for the emails package. Not a compliance fix — values are already correct; this is a maintainability improvement. Phase 28+.
- [ ] **Tools-app out-of-scope red-* (audit didn't flag, follow-up):**
  - `apps/tools-app/app/settings/page.tsx:73-74` — Gefahrenzone wrapper still uses `text-red-400` / `border-red-500/30`. Same pattern as DeleteAccountButton (now token-mapped). Quick swap to `--status-error` recommended.
  - `apps/tools-app/app/auth/callback/page.tsx:97, 102` — error-icon circle + error text use `bg-red-500` / `text-red-400`. Light-mode visibility risk like A-M01..M03 had.
  - `apps/tools-app/components/layout/GlobalLayout.tsx:266-271` — logout button hover state uses `red-500/20` / `red-400`. Consistent with FilterBar logout pattern (now token-mapped). Recommend follow-up to align.
