---
phase: 22
slug: partner-page
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-24
depends_on:
  - 20.6 (Landing Sections Rebuild — Nav + DS baseline final)
  - 21 (/about — für Verein-Transparenz-Link aus Partner-Page)
branch: feature/phase-22-partner-page
---

# Phase 22 — `/partner` Seite

> B2B-Landing für vier Partnertypen (Unternehmen, Stiftungen, Hochschulen, Initiativen) mit **4-Tab-System**, URL-Parameter-Routing und Kontaktformular mit Ansprechpartner-Karten. Umsetzung nach Simons Konzept §8.

---

## Mission

Vier unterschiedliche B2B-Zielgruppen auf einer Seite bedienen, ohne dass jemand durch irrelevante Inhalte scrollen muss. Tab-System statt 3-Anker-Scroll (wie ursprünglich in v4.0-Roadmap angedacht) — weil Mobile-UX besser, Deep-Linking sauberer und das 4. Segment (Initiativen) eigenständig adressierbar wird.

---

## Scope

**In-scope:**
- Hero: „Lass uns zusammen was bewegen."
- Trust-Sektion „Keine zufälligen Bekannten" (identisch zur Landing-Trust — Component aus Phase 20.6-06 wiederverwenden)
- **4-Tab-System** als Partner-Kacheln (Unternehmen / Stiftungen / Hochschulen / Initiativen)
  - Unternehmen Default aktiv
  - Klick wechselt aktiven Tab, Inhalt darunter wechselt, **kein Scroll-Reset**
  - Smooth Fade-In beim Tab-Wechsel
  - Mobile: horizontaler Scroll oder Dropdown
- **URL-Parameter für Deep-Linking**: `?typ=unternehmen|stiftungen|hochschulen|initiativen`
  - URL ändert sich beim Tab-Klick (pushState, kein Full-Reload)
  - Direkt-Aufruf mit Parameter setzt aktiven Tab
  - Default ohne Parameter → „unternehmen"
- Dynamische Bereichs-Inhalte pro Tab (4 Blöcke mit jeweils Value-Prop + Vorteile + Formate + CTA)
  - Unternehmen → Masterclasses · Speaker Sessions · Sponsoring
  - Stiftungen → Projekt/Programm-Förderung · Stipendien · institutionelle Förderung
  - Hochschulen → Gastvorträge · Career-Service-Integration · Lehrstuhl-Kooperationen
  - Initiativen → Co-hosted Events · Cross-Promotion · geteilte Speaker
- Kontaktformular mit Feldern:
  - Name, E-Mail, Organisation, „Ich interessiere mich als …" (Dropdown **vorausgefüllt je nach aktivem Tab**), Nachricht (optional)
  - Honeypot gegen Spam
  - Submit → Mail via Resend an `admin@generation-ai.org` (ImprovMX-Alias läuft bereits)
  - Success-Screen: „Wir melden uns innerhalb von 48 Stunden"
- Ansprechpartner-Karten (unter dem Formular): Alex (Head of Partnerships) · Janna (Co-Founder) · Simon (Co-Founder)
  - Foto + Name + Rolle + Kontaktmöglichkeit (Mail oder LinkedIn)
- Transparenz-Hinweis: „Generation AI ist gemeinnütziger Verein (e.V. i.G.)" mit Link auf `/about#verein`

**Out-of-scope:**
- Sales-CRM, Partner-Portal, Testimonials (deferred)
- Live-Tabs-Analytics (Roadmap)
- `partner@generation-ai.org` als eigene Mail-Adresse (deferred — erstmal `admin@` via ImprovMX)
- Foto-Assets Ansprechpartner (Placeholder-Avatars bis Fotos vorhanden)
- Finales Copywriting — Simons Konzept-Wording ist Startpunkt, Marketing-Pass in Phase 27

---

## Decisions

- **D-01** — 4-Tab-System statt 3-Anker-Sections. Simons Konzept §8.5-8.6 ist canonical. Initiativen als eigenständiges 4. Segment mitkonzipiert.
- **D-02** — URL-Parameter `?typ=...` statt URL-Hash `#unternehmen`. Grund: Tab-Inhalt kann dynamisch serverseitig präselektiert werden, SEO-Crawl pro Tab-Variante möglich.
- **D-03** — Kein Scroll-Reset bei Tab-Wechsel. User bleibt auf gleicher Position, nur Tab-Content wechselt via Smooth-Fade-In. Motion-Easing aus DS (`--ease-in-out`, `--dur-fast`).
- **D-04** — Default-Tab ist „Unternehmen" (laut Konzept §8.6). URL ohne Parameter lädt `?typ=unternehmen` visuell aber setzt den URL-State nicht (kein History-Spam bei Landing).
- **D-05** — Formular-Dropdown „Ich interessiere mich als …" ist vom aktiven Tab pre-selected, bleibt aber änderbar.
- **D-06** — Form-Submit geht via Server-Action + Resend an `admin@generation-ai.org`. Kein 3rd-Party-Form-Service. Honeypot-Field als simpler Spam-Schutz (Hidden-Input, Bots füllen es, Humans nicht → Submit mit Wert = silent-reject).
- **D-07** — Ansprechpartner-Karten: 3 Karten (Alex/Janna/Simon) mit **Initialen-Avatars** auf Brand-Background (DS-Pattern, kein Gravatar). **Mail-Links + LinkedIn-URLs** — LinkedIn-URLs werden nachgeliefert, Plan blockt nicht darauf (Placeholder-Hrefs akzeptabel bis Lieferung).
- **D-08** — Trust-Sektion bleibt in `apps/website/components/sections/`, wird zweimal gemountet (Landing + Partner). Kein Umzug nach `packages/ui` — Tools-App braucht es aktuell nicht, YAGNI.
- **D-09** — Resend-Mail an admin@ als **React Email Template in `@genai/emails` Package**. Konsistent mit zukünftigen Transaktionsmails, saubere Template-Basis. Template-Name: `PartnerInquiryEmail`.
- **D-10** — **Confirmation-Mail an den Partner-Lead** wird versendet („Wir haben deine Anfrage erhalten, wir melden uns innerhalb 48h"). Absender `noreply@generation-ai.org` (Domain-Verify via Resend muss vorhanden sein — falls nicht, Plan erkennt und markiert als Blocker). Zweites React-Email-Template `PartnerInquiryConfirmationEmail`.

---

## Success Criteria

- [ ] `/partner` Route existiert in `apps/website/app/partner/page.tsx`
- [ ] 4 Tabs switchable, Default Unternehmen, URL-Param synced (pushState, nicht navigate)
- [ ] Deep-Link `?typ=stiftungen` setzt Tab beim Mount
- [ ] Tab-Wechsel ohne Scroll-Reset, Smooth-Fade-In, reduced-motion Fallback
- [ ] Mobile: Tab-Leiste als horizontaler Scroll oder Dropdown funktioniert
- [ ] Formular submittet via Server-Action, Mail landet in admin@ Inbox
- [ ] Honeypot blockt Bot-Submissions (manueller Test: Hidden-Field-Wert setzen → Reject ohne User-Feedback)
- [ ] Ansprechpartner-Karten rendern mit Avatars + Name + Rolle + Kontakt-Link
- [ ] Trust-Sektion identisch zur Landing (Component-Reuse, nicht duplizierter Code)
- [ ] Transparenz-Link auf `/about#verein` funktioniert (Anker greift sobald Phase 21 live)
- [ ] Nav-Item „Für Partner" highlightet `/partner`
- [ ] Lighthouse `/partner` > 90 in allen Kategorien
- [ ] Keyboard-navigierbar, Screen-Reader-korrekt (ARIA-Tabs)
- [ ] Playwright-Smoke: Route lädt, 4 Tabs sichtbar, Tab-Wechsel funktioniert, Formular-Submit triggert Success-Screen

---

## Geklärt (2026-04-24, /gsd-autonomous --interactive)

1. **Ansprechpartner-Fotos:** Initialen-Avatars auf Brand-BG, keine Fotos nötig für Launch → siehe D-07.
2. **LinkedIn-Links:** Werden nachgeliefert, Placeholder-Hrefs (`#` oder TODO-Kommentar) bis Lieferung → siehe D-07.
3. **Resend-Template:** React Email Template im `@genai/emails` Package → siehe D-09.
4. **Confirmation-Mail an Absender:** Ja, via `noreply@generation-ai.org` → siehe D-10.
5. **Trust-Component-Heimat:** Bleibt in `apps/website/components/sections/` → siehe D-08.

---

## Release

Patch innerhalb Milestone v4.0. Kein Minor-Bump nötig — reine Page-Addition ohne Breaking Change.
