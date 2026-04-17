# Backlog — Generation AI

> Offene Items die Luca-Entscheidung oder manuelle Aktion brauchen

## Entscheidungen

- [x] **Vercel Pro upgraden?** — Entschieden: NEIN (2026-04-17). Plattform ist nicht-kommerziell (keine Einnahmen, nur Services ~200€/Monat Outlay). Hobby ist OK.
- [x] **CSP Header aktivieren** — Content-Security-Policy schützt vor XSS. Aktuell Report-Only (website) / fehlt ganz (tools-app). Edge-Runtime war Blocker. Wichtig, aber kein Notfall. **Erledigt Phase 13 (13-04 + 13-05): enforced CSP mit nonce + strict-dynamic auf beiden Apps.**

## DPAs

- [x] **Supabase DPA** — angefragt (2026-04-15)
- [x] **Resend DPA** — automatisch bei Signup aktiv

## Account-Setup

- [ ] **Sentry Account** — sentry.io → Free → DSN holen
- [ ] **Better Stack Account** — betterstack.com → Uptime Monitors

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
- [ ] **Supabase Email-Templates customizen** — aktuell heller Hintergrund, Luca will Systemfarbe (dunkel bei Darkmode-Mail). Templates in Supabase Dashboard → Auth → Email Templates.
- [ ] **Rate-Limit auf Login zurückstellen** — während Tests hochgestellt wegen Fehlschlägen. Wieder auf normale Werte.

### 🔐 Auth — OAuth-Login (Circle-Integration)

- [ ] **Google OAuth** — 3-Klick-Login für Studierende, größter UX-Win. ~1 Tag.
- [ ] **Apple OAuth** — wichtig für iPhone-User. ~0.5 Tage.
- [ ] **GitHub OAuth** — optional, niedrige Priorität (kleine Zielgruppe).
- [ ] **Circle-Member-Erkennung** — Siehe Erklärung im Chat: Google OAuth ist separat von Circle. Circle-Member-Status muss per Circle-API gecheckt werden (Email-Lookup), dann `profiles.is_circle_member = true` → Pro-Modus automatisch.

### 🔐 Auth — Nice-to-have

- [ ] **2FA (TOTP)** — sobald sensible Daten im Spiel (Pro-Features, Billing). Supabase supportet das nativ.
- [ ] **Account-Delete-Verifikation** — Code existiert, aber wirklich *restlos* gelöscht? Test: Löschen → in Supabase prüfen ob alle FKs + auth.users + profiles wirklich weg.

### 🐛 Bugs tools-app

- [ ] **Tool-Highlighting kaputt** — KI gibt "string" statt der Tool-Liste aus. Highlight-Mechanismus funktioniert nicht mehr. Regression-Check.
- [ ] **Mobile Chat-Width springt auf ~80 %** — wenn Chat geöffnet wird, werden die Ränder abgeschnitten statt volle Breite zu nutzen.
- [ ] **Mobile Shift+Enter** — Luca glaubt gefixt, verifizieren.
- [ ] **Desktop Chat-Input wächst nicht bei Transkription** — Normales Tippen + Enter expandiert das Input-Feld korrekt. Wenn stattdessen ein langer Text per Diktat reinkommt, bleibt das Feld klein/schmal → nervig zu lesen/editieren. Auto-Resize muss auch bei programmatischen Text-Writes triggern.

### 🎨 UI tools-app

- [ ] **Mobile Header: Login/Logout-Button sichtbar im Header** — aktuell nicht klar auffindbar. Beide rund, aber visueller Unterschied (z. B. Farbe) zeigen was was ist.
- [ ] **Login-Seite: Logo statt grünem Punkt** — entweder Terminal-Logo (das im Terminal/App-Header benutzt wird) über "Bei Generation AI anmelden", oder die Terminal-Ansicht vom Home als kleines schwebendes Element.
- [ ] **Mobile-Polish allgemein** — einmal durchgehen, Luca nutzt es auf Handy auch oft.
- [ ] **Mobile Chat: Hintergrund deckend oder blurred** — wenn Chat offen ist, schimmert die Page darunter durch (CardGrid/Akzentfarben sichtbar) → ablenkend. Entweder (a) Chat-Panel opaque `bg-[var(--bg)]` statt `bg-[var(--bg-card)]` mit Transparenz, oder (b) zusätzliches Backdrop-Element `fixed inset-0 bg-black/40 backdrop-blur-md z-30` hinter dem Panel. Option (b) ist der Modal-Sheet-Standard und fühlt sich „richtiger" an. Nur Mobile (lg:hidden) — Desktop bleibt Sidebar. Datei: `apps/tools-app/components/chat/FloatingChat.tsx:406`.
- [ ] **Mobile Legal Footer: Sichtbarkeit + Schriftfarbe** — aktueller Code `AppShell.tsx:340-349` nutzt `text-text-muted` (dunkle Schrift) statt Theme-aware hell. Außerdem erscheint der Footer inkonsistent (mal sichtbar, mal weg). Entweder konsistent immer sichtbar (unter CardGrid angeheftet, nicht floating) oder konsistent weg und Legal-Links nur im Header-Menü. Luca-Tendenz: immer sichtbar, aber hell im Darkmode. Auch prüfen: verdeckt Chat-Expand den Footer unabsichtlich?

### 📄 Content tools-app

- [ ] **Tool-Cards: Echte Summary statt Text-Anfang** — aktuell schneidet die Card den Intro-Text an. Cards brauchen eigenes Preview-Feld: Kernnutzen + Target-Group in 1–2 Sätzen, damit User entscheiden kann "lohnt sich das Klicken?"
- [ ] **Tool-Detail-Seiten: Artikel-Qualität** — aktuell zu knapp/proprietär. Pro Tool: Use-Cases, Beispiele, Alternativen, Pricing-Details. Eigener Content-Workstream, nicht Feature-Arbeit.

### 🎬 Micro-Animations (Desktop ausbauen + Mobile bringen)

- [ ] **Sonnen-Rotation im Theme-Toggle** — aktuell nur auf Desktop? Auch auf Mobile bringen.
- [ ] **Diktier-Button Animation** (Audio-Bars) — auf Mobile verfügbar machen, falls nicht schon.
- [ ] **Paperclip / Attachment-Animation** — Polish.
- [ ] **Allgemein: Mobile-Parity für alle Desktop-Micro-Interactions** — durchgehen, Liste machen, portieren. Subtile Animations erhöhen Wertigkeit enorm.

### 💡 Feature-Ideen (zum Mitnehmen)

- [ ] **Smart-Links zu Circle** (Luca: "geile Idee") — jedes Tool zeigt, wo im Circle darüber diskutiert wird. Link zu Space/Thread mit Discussions.

### 💬 Chat überall — global Agent + Context-aware

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

### 🧱 Fundament-Stufen (aus STATE.md)

- [ ] **Stufe 1:** `/gsd-map-codebase` laufen lassen
- [ ] **Stufe 2:** Auth-Flow-Audit als GSD-Phase (deckt den ganzen Auth-Block hier mit ab)
- [ ] **Stufe 3:** Simplify-Pass tools-app
