# Phase 20: Navigation + Landing-Skeleton - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning
**Depends on:** Brand-Extension (commit 961dfda — brand-{neon,blue,pink,red}-{1-12} Skalen)

<domain>
## Phase Boundary

Top-Nav mit "Für Partner"-Dropdown + 10 Landing-Sections mit Stub-Daten-Platzhaltern. Visuelles Gerüst der neuen Conversion-Landing. Live-Content (Tool-Showcase, Community-Preview) kommt in Phase 26 nachträglich in dasselbe Gerüst.

**Explizit NICHT in Phase 20:** Hero-Claim-Wording (Marketing-Arbeit, separat), echte Daten in Tool-Showcase/Community-Preview (Phase 26), Live-Signup-Reaktivierung, `/about`- / `/partner`- / `/join`-Seiten selbst (Phase 21-23).

</domain>

<decisions>
## Implementation Decisions

### Stack-Additions
- **D-01:** **Motion** (ehem. Framer Motion) als Animation-Library. Industrie-Standard, built-in `prefers-reduced-motion`, kompatibel mit 21st.dev / Aceternity / MagicUI.
- **D-02:** **shadcn/ui** als UI-Primitives-Layer für a11y-kritische Komponenten (Dropdown-Menu, später ggf. Dialog/Sheet). Basiert auf Radix UI → passt zu Radix-Colors-Setup aus Phase 16 + 19.5.
- **D-03:** **21st.dev / Aceternity / MagicUI Komponenten per Copy-in**, selektiv. Handkuratierte Auswahl während Execution. Jede Komponente beim Einziehen auf unsere Brand-Tokens (brand-neon-*, brand-blue-*, brand-pink-*, brand-red-* Skalen) umgefärbt — kein fremdes Purple/Cyan im Code.

### Design-Direction
- **D-04:** **"Creative Technical" als Basis-Vibe** (Raycast / Supabase / Railway: dark-first, neon-glows, scroll-triggered reveals, polished) + **"Playful Wärme" als Modulation** (via Microcopy aus `brand/VOICE.md`, subtile Cursor-/Hover-Effekte). Zitat Luca: "90% Raycast-Vibe, 10% Anthropic-Wärme".
- **D-05:** **Wow-Momente auf 3 strategische Punkte konzentriert:** (1) Hero-Hintergrund, (2) Diskrepanz-Section Scroll-Viz, (3) Final-CTA. Zwischen diesen Stellen bleibt die Landing visuell ruhig — so entsteht überhaupt erst das Wow-Gefühl an den Peaks.
- **D-06:** **Reduced-Motion-Fallback PFLICHT.** Jede Animation muss bei `prefers-reduced-motion: reduce` sauber abschalten oder auf statische Variante fallen.

### Section-Mapping (Claude's Discretion — während Execution User-Override erlaubt)
- **D-07:** **Terminal-Splash** bleibt unverändert (Teil der Brand-Identität, Hacker/Tech-Signal).
- **D-08:** **Hero** — Aurora-Background oder Background-Beams (Aceternity) + Text-Generate-Effect für Claim. Claim bleibt Platzhalter bis Marketing-Pass.
- **D-09:** **Diskrepanz-Section** — Custom Bento-Split-Layout (links "Was Wirtschaft will" / rechts "Was Studis mitbringen"). Animated Number-Counter (MagicUI "Number Ticker") für die 6 Kernzahlen. Scroll-triggered Divergenz-Animation (Motion `useScroll`). Closer "Generation AI schließt diese Lücke." als Text-Reveal. **Das zentrale Wow-Stück.**
- **D-10:** **4-Card-Angebot** — Bento Grid (Aceternity) mit Hover-Glow auf brand-neon-alpha-Werten. Jede Card: Icon + Titel + 1-Satz + Deep-Link.
- **D-11:** **Tool-Showcase** — Apple-Cards-Carousel oder Infinite-Moving-Cards (Aceternity) mit **sichtbarem "Beispiel"-Badge** (siehe D-23).
- **D-12:** **Community-Preview** — zweispaltiges Layout (Artikel links, Events rechts). Ruhig, keine Animation-Overkill.
- **D-13:** **Zielgruppen-Split** — Studi-Section groß + Primary-CTA, B2B-Streifen visuell dezenter (kleinere Typo, weniger Kontrast, weniger Höhe).
- **D-14:** **Trust (Logo-Strip)** — Velocity-Scroll-Marquee (MagicUI), langsames Tempo. Bei reduced-motion → statisch. Logo-Assets als TODO-Placeholder bis Luca finale Sparringspartner-Logos liefert.
- **D-15:** **Final-CTA** — Lamp-Effect oder Background-Boxes (Aceternity) für visuellen Höhepunkt. Claim-Wiederholung + Primary-Button "Jetzt beitreten" → `/join` + Sekundär-Link `tools.generation-ai.org`.
- **D-16:** **Footer** — klassisch, keine Animation. Legal + Sitemap + Social (LinkedIn) + Kontakt-Mail (admin@generation-ai.org) + Copyright.

### Navigation
- **D-17:** **Dropdown "Für Partner"** via shadcn Dropdown-Menu (click-to-open, Keyboard-A11y out-of-the-box).
- **D-18:** **Desktop-Nav:** `Tools · Community · Für Partner ▾ · Über uns · [Jetzt beitreten]`. Kein Login-Button. Tools/Community als externe Links zu Subdomains (target="_blank", rel="noopener noreferrer").
- **D-19:** **Mobile-Nav:** Hamburger-Icon → Full-Screen-Overlay mit staggered-reveal der Nav-Items (Motion). Dropdown-Inhalt als Accordion-Unterebene im Overlay.
- **D-20:** **Theme-Toggle** bleibt im Header (bestehendes Muster), evtl. Position anpassen bei neuer Nav-Dichte.

### Alt-Content-Handling
- **D-21:** **Bestehende Sections ersetzen**: `components/hero.tsx`, `sections/features.tsx`, `sections/target-audience.tsx`, `sections/signup.tsx` komplett löschen — Neuversion ist zu anders für Teilrecycling.
- **D-22:** **Bestehender Header/Footer umbauen** — nicht neu von Null: neue Nav-Struktur + Dropdown + Mobile-Menu einziehen in vorhandene Files.
- **D-23:** **`home-client.tsx`** neu strukturieren — bleibt Client-Wrapper für TerminalSplash + neue Sections.

### Stub-Placeholder-Strategie
- **D-24:** **Tool-Showcase + Community-Preview:** realistischer Dummy-Content (plausible Tool-Namen / Artikel-Titel) + **sichtbares "Beispiel"-Badge** (kleine Pill z.B. oben rechts, Text "Beispiel" o.ä. aus `brand/VOICE.md`). **Kein Skeleton-Loader** — suggeriert Ladezustand, aber es gibt keine API in Phase 20.
- **D-25:** Badge-Styling via brand-Token-Alpha-Skalen (z.B. `bg-brand-neon-3` dark / `bg-brand-red-3` light).

### CSP / Performance-Gates (nicht verhandelbar)
- **D-26:** `export const dynamic = "force-dynamic"` im Root-Layout BLEIBT. Alle Landing-Routes dynamic.
- **D-27:** Nach Build: alle Landing-Routes müssen `ƒ` (dynamic) sein, nicht `○` (static). Pflicht-Check nach jedem Task.
- **D-28:** Jede neue Komponente lokal mit `pnpm build && NODE_ENV=production pnpm start` prod-verifizieren auf CSP-Errors. Playwright-Smoke als Gate.
- **D-29:** **Lighthouse Landing > 90** in allen Kategorien — hard gate in Verification (R1 Akzeptanzkriterium).
- **D-30:** **CLS ≤ 0.1** bei scroll-triggered Animationen (R1 Akzeptanzkriterium).

### Release
- **D-31:** Release minor — **v5.0.0-alpha** (Breaking UX-Change: neue Nav, neue Landing-Struktur) ODER **v4.5.0**. Finale Nummer beim Changeset.

### Execution-Autonomie
- **D-32:** **User-Override jederzeit:** Luca kann während Execution einzelne 21st.dev/Aceternity/MagicUI-Komponenten austauschen. Plan-Phase erlaubt Komponenten-Swap ohne Re-Planning-Zwang. Zitat: *"du machst mal so wie du dir denkst und wenn ich später irgendwelche Features oder einzelne Elemente habe, dann kann ich das Ganze mit einbauen"*.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` §R1 — Navigation & Landing-Page (R1.1–R1.10, Akzeptanzkriterien)
- `.planning/ROADMAP.md` § Phase 20 — Scope + Success Criteria
- `.planning/research/v4-scoping/SCOPE.md` — vollständige Landing-Section-Beschreibung (10 Sections, Diskrepanz-Zahlen, Nav-Struktur, Out-of-Scope-Liste)

### Brand & Design
- `brand/DESIGN.md` — Brand-System (Farben, Typografie, Layout-Prinzipien)
- `brand/VOICE.md` — Microcopy-Library + Tone (für Labels, Placeholder-Badges, Empty-States)
- `brand/tokens.json` — Brand-Tokens inkl. 12-Step-Skalen (commit 961dfda)
- `packages/config/tailwind/base.css` — Tailwind-Bindings inkl. `brand-neon-*`, `brand-blue-*`, `brand-pink-*`, `brand-red-*` + Radix Slate Neutrals

### Non-Negotiable Rules (PFLICHTLEKTÜRE vor jeder Änderung)
- `LEARNINGS.md` § CSP-Incident 2026-04-18 — Nonce auf Request, force-dynamic, Build-Output prüfen, lokaler Prod-Check
- `apps/website/AGENTS.md` — Next.js 16 Pattern-Regeln

### Existing Code Touch-Points
- `apps/website/components/layout/header.tsx` — bestehend, wird umgebaut
- `apps/website/components/layout/footer.tsx` — bestehend, wird erweitert
- `apps/website/components/home-client.tsx` — Landing-Root, komplett neu strukturiert
- `apps/website/components/terminal-splash.tsx` — bleibt unverändert
- `apps/website/components/ThemeProvider.tsx` — Theme-Toggle-Context, bleibt
- `apps/website/proxy.ts` + `apps/website/lib/csp.ts` — NICHT anfassen ohne LEARNINGS.md-Re-Read

### External Docs (zu konsultieren während Planning)
- motion.dev — Animation-Library-Docs (useInView, useScroll, prefers-reduced-motion)
- ui.shadcn.com — Dropdown-Menu + Sheet-Component-Docs
- aceternity.com/components — Aurora, Beams, Bento, Lamp, Infinite Cards
- magicui.design — Number Ticker, Velocity Scroll, Marquee

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`<Logo />`** aus `@genai/ui` — 11 Colorway-Varianten (Phase 16). Nutzung: `<Logo context="header|footer" theme={theme} size="md" />`
- **`useTheme()` + `ThemeProvider`** — Theme-Switching mit Dark-Default, Light via `.light` Class auf `<html>`
- **`TerminalSplash`** — einmaliges Intro-Overlay beim ersten Besuch (bleibt)
- **Brand-Tokens via CSS-Custom-Props:** `--accent`, `--bg-header`, `--text`, `--text-muted`, `--border`
- **Neue 12-Step-Brand-Skalen** (commit 961dfda): `brand-neon-{1-12}`, `brand-blue-{1-12}`, `brand-pink-{1-12}`, `brand-red-{1-12}` als Tailwind-Utilities
- **Radix Slate Neutrals** (Phase 16): `slate-{1-12}` mit semantischem Mapping (slate-1 BG, slate-6 Border, slate-11/12 Text)

### Established Patterns
- **Client/Server-Split:** Landing ist aktuell `'use client'` wegen Theme + TerminalSplash-State. Einzelne Server-Sections möglich — Decision während Planning.
- **Force-Dynamic-Rendering:** Alle Landing-Routes bleiben dynamic (CSP-Nonce-Pflicht).
- **Token-Naming-Vorrang:** `bg-bg-header`, `text-text-on-accent` → eigene Tokens haben Vorrang vor rohen Hex-Werten.
- **Typography-Roles:** H1 Geist Mono, H2/H3/Body Geist Sans (UI-SPEC §B, Phase 16).

### Integration Points
- Nav-CTA "Jetzt beitreten" → `/join` (existiert noch nicht, Phase 23). Für Phase 20: `<Link href="/join">` setzen, 404 ist OK bis Phase 23.
- Nav-Link "Über uns" → `/about` (Phase 21).
- Nav-Dropdown-Links → `/partner#unternehmen` etc. (Phase 22).
- Externe Links: Tools → `https://tools.generation-ai.org`, Community → `https://community.generation-ai.org` (target="_blank", rel="noopener noreferrer").

</code_context>

<specifics>
## Specific Ideas

### Stil-Referenzen (Luca-Freigabe 2026-04-20)
- **Primäre Anker:** Raycast, Supabase, Railway — für Dark-first, neon-glows, polished scroll-reveals
- **Sekundäre Würze:** Anthropic, Arc, Lovable — für Microcopy-Wärme und freundlichere Hover-Effekte
- **Explizit NICHT:** Midjourney/Framer-style bildlastig, Linear/Vercel-style minimalistisch-kühl

### User-Driven Component-Picks
Luca hat Freigabe erteilt, einzelne Komponenten während Execution von 21st.dev / Aceternity / MagicUI zu ersetzen. Claude picks initial (D-07 bis D-16), User-Override jederzeit möglich ohne Re-Planning-Zwang.

### Animation-Philosophy
"Wow an 3 Stellen, Rest ruhig" — **nicht** flächendeckende Effekte. Nervigkeit entsteht durch Dauerbewegung, nicht durch einzelne starke Momente.

### Stub-Strategie
Realistischer Dummy-Content (echt aussehend) + sichtbares "Beispiel"-Badge — kein Skeleton (würde "lädt gerade" suggerieren, aber es gibt keine API).

</specifics>

<deferred>
## Deferred Ideas

- **Hero-Claim finales Wording** — explicit out-of-scope v4.0 (Marketing-Arbeit). Landing liefert Platzhalter, finales Wording via späterer Content-Pass.
- **Final-CTA finales Wording** — gleiche Logik.
- **4-Card-Formulierungen final** — Platzhalter für jetzt.
- **Diskrepanz-Section Intro + Closer finales Wording** — Zahlen stehen (aus Value-Prop-v2), Rahmenwording später.
- **Zielgruppen-Split Copy** — offen.
- **Social-Proof-Section mit Member-Avataren/Count** — "später" per SCOPE.md.
- **Sparringspartner-Logos** — Asset-Delivery durch Luca, nicht Phase-20-Scope.

### Reviewed Todos (not folded)
Keine Todos mit Phase-20-Match.

</deferred>

---

*Phase: 20-navigation-landing-skeleton*
*Context gathered: 2026-04-20*
