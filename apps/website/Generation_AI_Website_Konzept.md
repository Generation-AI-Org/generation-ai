# Generation AI — Website-Konzept

**Version:** April 2026
**Status:** Umsetzungsgrundlage für Web-Team
**Hinweis:** Dieses Dokument ist so strukturiert, dass es direkt in Claude Code oder andere KI-Tools zur Weiterbearbeitung gegeben werden kann.

---

## Inhaltsverzeichnis

1. [Grundlogik & Prinzipien](#1-grundlogik--prinzipien)
2. [Hauptnavigation](#2-hauptnavigation)
3. [Übergreifende technische Anforderungen](#3-übergreifende-technische-anforderungen)
4. [Startseite](#4-startseite)
5. [Events](#5-events)
6. [Tools](#6-tools)
7. [Community](#7-community)
8. [Für Partner](#8-für-partner)
9. [Über uns](#9-über-uns)
10. [Jetzt beitreten (Join)](#10-jetzt-beitreten-join)
11. [Footer](#11-footer)
12. [CTA-Übersicht](#12-cta-übersicht)
13. [Offene Punkte & Roadmap](#13-offene-punkte--roadmap)

---

## 1. Grundlogik & Prinzipien

### 1.1 Zielgruppen

Die Website muss drei Besuchergruppen gleichzeitig abholen:

- **Studierende** wollen in Sekunden verstehen, welchen Nutzen sie haben, und sich niedrigschwellig anmelden.
- **Partner** (Unternehmen, Stiftungen, Hochschulen, Initiativen) wollen Seriosität, konkrete Kooperationsformate, klare Ansprechpartner:innen.
- **Presse, Multiplikatoren, Mitglieder** wollen Legitimität, Transparenz, Inhalte.

### 1.2 Subdomain-Architektur

- `generation-ai.org` — Hauptdomain, Marketing-Site
- `tools.generation-ai.org` — Tool-Finder (hybride Integration, siehe Abschnitt 6)
- `community.generation-ai.org` — Circle-Plattform (externe Community)

### 1.3 Leitprinzipien

- **Klarheit vor Vollständigkeit.** Lieber wenige Tabs mit dichten Inhalten.
- **Zwei klare Conversion-Pfade.** Mitglied werden (Studierende), Partner werden (alle anderen).
- **Tool-Finder als Proof-of-Concept.** Interaktiver Value-Add, prominent platziert.
- **Freemium-Logik** für SEO und Aktivierung.
- **Gen-Z-Ton.** Direkt, locker, aber professionell wo nötig. Kein aufgesetztes Coolness-Getue.
- **Keine Uni-Kritik.** Wir adressieren die Skill-Lücke, ohne Hochschulen die Schuld zu geben (strategisch wichtig für Hochschulkooperationen).

---

## 2. Hauptnavigation

### 2.1 Struktur

**Events · Tools · Community · Für Partner · Über uns | Jetzt beitreten**

5 Inhaltstabs plus Join-Button. Der Join-Button ist farblich hervorgehoben und optisch von den anderen Tabs abgesetzt.

### 2.2 Reihenfolge-Logik

- Links die drei Säulen (Events, Tools, Community) — was Studierende direkt konsumieren
- Mitte Partner-Seite für sekundäre Zielgruppe
- Rechts Über uns als Meta-Info
- Ganz rechts der Join-Button als CTA

### 2.3 „Jetzt beitreten" Tab

Dieser Tab bleibt in der Struktur erhalten, wird aber in einer späteren Session detailliert ausgearbeitet. Ziel: maximale Conversion, minimale Reibung, kein FAQ (das ist auf Startseite und Über uns verteilt).

---

## 3. Übergreifende technische Anforderungen

### 3.1 Sticky Navigation

**Pflicht auf allen Seiten der Hauptdomain UND auf der Tools-Subdomain.**

- Position: `fixed` an der oberen Kante des Viewports, beim Scrollen immer sichtbar
- Verhalten: durchgehend sichtbar, **nicht** „Hide on scroll down, show on scroll up"
- Visueller Zustand: leichte Änderung beim Scrollen (subtiler Schatten, minimal kleinere Höhe oder subtile Hintergrund-Änderung)
- Hintergrund: deckend (kein transparent), damit Content darunter nicht durchscheint
- Mobile: ebenfalls sticky, mit Burger-Menü
- Z-Index: hoch genug, damit nichts drüberliegt. Modals und Tooltips müssen aber darüberliegen können.

### 3.2 Design-Konsistenz

- **Section-Header-Pattern**: durchgängig mit Underscore-Prefix (z.B. `// kommende events`) und Überschrift darunter. Gilt auf allen Seiten.
- **CI-Farbregeln**: Rosa/Rot und Blau/Grün niemals mischen (laut CI-Doku).
- **Dummy-Data-Markierung**: solange Platzhalter-Inhalte auf der Seite sind, müssen diese klar als „Beispiel" gekennzeichnet sein.

### 3.3 URL-Struktur

- Hauptdomain-Seiten: `generation-ai.org/events`, `generation-ai.org/partner`, etc.
- Partner-Seite: URL-Parameter für Tab-Zustand: `generation-ai.org/partner?typ=stiftungen`
- Community-Artikel: eigene URLs pro Artikel für SEO: `generation-ai.org/community/artikel/[slug]`
- Tools: `tools.generation-ai.org` (Subdomain), aber mit Hauptnav integriert

### 3.4 Mobile-First

Alle Entscheidungen müssen auf Mobile funktionieren. Tab-Leisten werden zu horizontalem Scroll oder Dropdowns, Navigation wird zu Burger-Menü.

---

## 4. Startseite

### 4.1 Zweck

In unter 10 Sekunden muss klar sein, wer wir sind, für wen, und was der nächste Schritt ist.

### 4.2 Sektionsreihenfolge

1. Hero
2. **Problem-Block** (neu, direkt nach Hero)
3. Drei Säulen („Was wir bauen")
4. Tool-Bibliothek
5. Aus der Community (mit zwei Links zu Community und Events)
6. Wer mit uns baut / Keine zufälligen Bekannten (Trust-Sektion, bewegende Logoleiste)
7. Finaler CTA
8. **Kurz-FAQ** (neu, nach CTA)
9. Footer

### 4.3 Hero (bereits live)

Claim: „KI-Skills, die im Studium fehlen."

Drei Trust-Badges: Kostenlos · Gemeinnützig · Für Studis & Early-Career

CTAs: „Kostenlos beitreten" + „Mehr erfahren"

### 4.4 Problem-Block (neu)

Kontrast-Statement oben, groß, farblich kontrastierend:

```
Studierende lernen mit ChatGPT.
Unternehmen arbeiten mit Agenten.
```

Überleitungssatz darunter:

> *Die Lücke wächst jeden Monat. Und niemand bringt dir systematisch bei, wie du sie schließt.*

Drei Beleg-Kacheln:

1. **+56% höheres Gehalt** für Jobs mit KI-Skills
   *Quelle: PwC AI Jobs Barometer 2025*

2. **Beförderungen an KI-Nutzung gekoppelt** bei Accenture, ab 2026
   *Quelle: Financial Times, Feb 2026*

3. **Performance-Reviews an KI-Einsatz gebunden** bei Meta, ab 2026
   *Quelle: The Information / heise online, 2026*

Abschluss mit Tonwechsel:

> **Aber: du bist hier richtig.**
> Wir bringen dir die Skills bei, die in Jobs heute schon erwartet werden. Kostenlos, praxisnah, für alle Fachrichtungen.

Scroll-Einladung:

> So gehen wir's an ↓

### 4.5 Drei Säulen (bereits live)

Community, Wissensplattform, Events als Teaser-Kacheln mit jeweils Mini-Vorschau und Link zur Subdomain/Seite.

### 4.6 Tool-Bibliothek (bereits live)

„Über 100 KI-Tools, kuratiert"

12 Beispiel-Kacheln, Link auf `tools.generation-ai.org`.

### 4.7 Aus der Community (Fix erforderlich)

**Fix:** Der Section-Header hat aktuell nicht die Design-Elemente (zwei Striche + Punkt). Muss ergänzt werden, damit konsistent.

Inhalt: letzte Artikel + kommende Events kombiniert.

**Zwei Links unten:**
- Einer zur Community-Subdomain
- Einer zur Events-Seite

### 4.8 Trust-Sektion (Umbau erforderlich)

**Umbau:** Aktuell statische Logoleiste. Muss zu bewegenden Logo-Kacheln werden, analog zur Tool-Bibliothek.

Header:

```
// wer mit uns baut
### Keine zufälligen Bekannten.
```

Logoleiste mit Unis (TU Berlin, LMU München, Mannheim, ETH, WU Wien, KIT) und Firmen/Initiativen (Anthropic, Make, Perplexity, ElevenLabs, Bitkom, KI-Bundesverband).

### 4.9 Finaler CTA (bereits live)

„Sei dabei, bevor der Rest aufholt."

Zwei CTAs: „Jetzt beitreten" + „Erst mal umschauen → tools."

### 4.10 Kurz-FAQ (neu)

Als Accordion-/Dropdown-Element, nach dem finalen CTA-Block.

Fragen (4–5):

1. Kostet das was?
2. Brauche ich technisches Vorwissen?
3. Muss ich an einer bestimmten Uni studieren?
4. Wie viel Zeit muss ich investieren?
5. Was passiert nach der Anmeldung?

Unter dem FAQ-Block: „Mehr Fragen? → Über uns"

---

## 5. Events

### 5.1 Zweck

Events sind der Hauptaktivierungskanal. Die Seite muss es einfach machen, kommende Events zu entdecken und anzumelden. Archiv zeigt Track Record.

### 5.2 Sektionsreihenfolge

1. Hero
2. Kommende Events
3. Formate
4. Members-Only Hinweis
5. Archiv
6. Abschluss-CTA

### 5.3 Hero

```
Generation AI · Events

# Events, die dich weiterbringen.

Jeden Monat neue Events: Hands-on lernen, smarte Leute treffen, direkt anwenden.
```

### 5.4 Kommende Events

```
// kommende events
### Sichere dir deinen Platz.
```

3 Event-Kacheln nebeneinander.

**Metadaten pro Kachel:**
- Titel
- Datum und Uhrzeit
- Format-Tag (Workshop / Speaker Session / Masterclass)
- Level-Tag (Einsteiger / Fortgeschritten / Expert)
- Ort (Online / Stadt / hybrid)
- Partner (nur bei Masterclasses)
- Anmelde-Button

**Ab mehr als 3 Events:** Button „Mehr Events anzeigen ↓" darunter. Team entscheidet, ob Ausklappen auf derselben Seite oder Unterseite.

**Interaktionslogik:**
- Klick auf Kachel → Modal mit Event-Details (längere Beschreibung, Speaker, Agenda, Anmelde-Button, optional ICS-Download für Kalender)
- „Anmelden" im Modal → Login-/Registrierungs-Check (Variante B, siehe unten)
- Bestandsmitglieder: weiter zu Luma oder Circle
- Nicht-Mitglieder: zuerst Registrierung, dann Event-Zugang

### 5.5 Formate

```
// so lernst du bei uns
### Drei Formate, ein Ziel.
```

Drei Kacheln:

**Workshops** — Praktisch lernen, direkt anwenden. Von Prompting-Grundlagen bis Agentic Workflows. Für jedes Level was dabei.

**Speaker Sessions** — Ehrliche Einblicke von Menschen, die es gerade machen. Mit Zeit für deine Fragen.

**Masterclasses** — Reale Use Cases, echte Unternehmen, konkrete Lösungen. Kein Recruiting-Pitch, echtes Lernen.

### 5.6 Members-Only Hinweis

> Unsere Events sind exklusiv für Mitglieder. Die Mitgliedschaft ist kostenlos und in 2 Minuten erledigt.
>
> [Jetzt beitreten]

### 5.7 Archiv

```
// rückblick
### Was schon lief.
```

*Was du verpasst hast.*

**Archiv-Kacheln minimal:**
- Foto (Event-Foto oder Thumbnail)
- Titel
- Datum
- 2-Satz-Recap

Keine Modals für Archiv-Events, reduziert Pflegeaufwand.

### 5.8 Abschluss-CTA

```
### Keine Events verpassen.

Kostenlos Mitglied werden, Events-Benachrichtigungen aktivieren, dabei sein.

[Jetzt beitreten]
```

### 5.9 Offene Punkte Events

- **Hosting-Frage**: Luma, Circle oder Hybrid. Empfehlung: Hybrid (Luma für Discovery, Circle für Mitglieder-Verifikation)
- **Launch-Voraussetzung**: echte Events statt Dummy-Data
- **Roadmap-Item**: Filter-Funktion ab 5+ parallelen Events

---

## 6. Tools

### 6.1 Hybride Integration (wichtigste Anforderung)

Die Tools-Seite läuft technisch auf der Subdomain `tools.generation-ai.org`, damit sie als eigenständiges Produkt skalieren kann. **Visuell und navigatorisch muss sie sich aber wie Teil der Hauptwebsite anfühlen.**

Konkret fürs Team:

- **Gleiche Sticky Navigation** wie Hauptdomain (Events · Tools · Community · Für Partner · Über uns | Jetzt beitreten)
- **Der Tab „Tools" ist aktiv markiert**, solange man auf Tools-Subdomain ist
- **Logo-Link in der Nav** führt zurück auf `generation-ai.org` (aktuell fehlerhaft: führt auf Community — muss gefixt werden)
- **Andere Nav-Tabs** führen auf jeweilige Seite der Hauptdomain
- **Keine neuen Browser-Tabs**: Klick auf „Tools" öffnet im gleichen Tab
- **Sticky-Verhalten identisch** zur Hauptdomain

Hintergrund: Nutzer:innen müssen sich durchgängig in einer Website bewegen, nicht zwischen zwei separaten Welten. Die Subdomain bleibt, damit Tools die volle Breite für Kacheln und Agent-Chat hat.

### 6.2 Aktueller Live-Status

- Kategorienfilter (Alle, KI-Assistenten, Schreiben & Chat, Recherche, Coding, Bilder & Design, Audio & Transkription, Automation, Produktivität)
- Ca. 30 Tool-Kacheln mit Tier-Badges (Freemium, Kostenpflichtig, Open Source, Kostenlos), Kurzbeschreibung, Use-Case-Tipp
- Klick auf Kachel führt auf Tool-Detailseite (wird separat ausgearbeitet)
- Agent-Chat als blinkendes Icon unten rechts

### 6.3 Hero (neu, über Filter-Tabs)

```
// deine ki-tool-bibliothek

# KI-Tools, kuratiert für dich.

Über 100 Tools, sortiert nach Anwendungsfall. Brauchst du Hilfe? Frag unseren Agenten.
```

Kein langer Marketing-Block, nur diese zwei Zeilen. Darunter direkt die bestehenden Filter-Tabs und Tool-Kacheln.

### 6.4 Login und Registrierung (Umbau erforderlich)

**Aktuell:** Einzelner „Anmelden" Button rechts oben. Muss differenziert werden.

**Neue Struktur:**

Position: rechts oben in der Navigation, ersetzt den aktuellen „Anmelden" Button.

Botschaft: „Kostenlos registrieren, um alle Funktionen zu nutzen."

Button-Hierarchie:
- **Primary:** `[Kostenlos registrieren]`
- **Secondary (Textlink daneben/darunter):** `Bereits Mitglied? Hier einloggen →`

**Umsetzung der Botschaft:** Entscheidung liegt beim Team, je nach UX. Mögliche Varianten:
- Kleine Textzeile direkt unter dem primären Button
- Tooltip oder Hover-Erklärung
- Badge oder Banner-Zeile unter der Navigation

Wichtig: die Botschaft muss vor der Registrierung klar sein.

### 6.5 Light vs. Pro Logik (bereits technisch umgesetzt)

Nicht-Mitglieder sehen Light-Version, Mitglieder bekommen Pro-Version mit erweiterten Funktionen (Filter, Agenten-Tiefe). Durch den Login-Button-Umbau wird der Unterschied klar kommuniziert.

### 6.6 Agent-Chat (bereits live)

Das bestehende blinkende Chat-Icon unten bleibt. Durch Erwähnung im Hero („Frag unseren Agenten") wird der Zusammenhang klar.

### 6.7 Offene Punkte Tools

- **Tool-Detailseiten**: eigenes Wording- und Layout-Projekt
- **Kategorien-Konsistenz zur Startseite**: Labels wie „Bildgenerierung" vs. „Bilder & Design" angleichen
- **Erweiterte Filter für Pro**: Filter nach Tier-Badge, nach Studienrichtung, nach Use Case
- **Suchfeld**: als Pro-Feature oder allgemeine Ergänzung

---

## 7. Community

### 7.1 Zweck

Die Community-Seite ist die Landingpage für die Circle-Community auf `community.generation-ai.org`. Auf der Hauptdomain erklärt sie was es drinnen gibt, bietet Blog-Teaser (SEO-relevant) und führt Mitglieder direkt weiter.

### 7.2 Sektionsreihenfolge

1. Hero (mit Direktlink für Mitglieder)
2. Was dich drinnen erwartet (4 Kacheln)
3. Was wir gerade teilen (Blog-Teaser)
4. Members-Only + CTA (kombiniert)

### 7.3 Hero

```
Generation AI · Community

# Mehr als eine Community.

Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis.

Direkt zur Community →
```

Der Direktlink unten führt auf `community.generation-ai.org` für Bestandsmitglieder.

### 7.4 Was dich drinnen erwartet

```
// was dich erwartet
### Das findest du drinnen.
```

Vier Kacheln mit kleinen Mockup-Visualisierungen (im Stil der „Drei Säulen"-Sektion der Startseite, keine Circle-Screenshots):

**Austausch**
Stell deine Fragen, teil deine Learnings, finde Sparringspartner. Peer-to-Peer unter Studierenden, die wissen worum's geht.

**Lernpfade & Kurse**
Strukturierte Wege von Prompting-Grundlagen bis Agentic Workflows. Lerne in deinem Tempo, ohne durch YouTube-Tutorials zu kämpfen.

**News & Insights**
Kuratierte KI-News, die wirklich relevant sind. Wöchentlich aufbereitet. Signal statt Noise.

**Exklusive Inhalte**
Prompt-Bibliotheken, Tool-Tiefgänge, Masterclass-Materialien. Nur für Mitglieder.

### 7.5 Was wir gerade teilen (Blog-Teaser, SEO-relevant)

```
// aus der community
### Was wir gerade teilen.
```

Horizontale Scroll-Reihe mit Artikel-Kacheln, chronologisch (neueste links).

**Pro Kachel:**
- Titel
- 2 Minuten Lesezeit (oder ähnlich)
- Klickbar

**Klick-Logik:**
- Klick auf Kachel → eigene Artikel-Vorschau-Seite mit eigener URL (z.B. `generation-ai.org/community/artikel/bachelorarbeit-claude`)
- **Wichtig für SEO**: keine Modals, echte Unterseiten
- Auf der Vorschau-Seite: Überschrift, 2–3 Absätze echter Inhalt, am Ende „Weiterlesen in der Community →" Link auf Circle

**KI-News-Beiträge** laufen als normale Artikel in dieser Blog-Sektion mit kleinem Badge „KI-generiert, vom Team kuratiert". Keine separate Sektion.

### 7.6 Members-Only + Abschluss-CTA (kombiniert)

```
### Wir sehen uns drinnen.

Kostenlos, keine Haken, kein Spam. Einfach beitreten und loslegen.

[Kostenlos beitreten]
```

### 7.7 Technische Anforderungen Community

- **Artikel bekommen eigene URLs** auf der Hauptdomain, nicht als Modals
- **Inhalte der Artikel-Vorschauen werden aus Circle-Content extrahiert und aufbereitet** (manuell oder später via AI-Agent)
- **SEO-relevante Struktur**: crawlbar, Meta-Tags, Überschriften-Hierarchie
- **Horizontales Scroll-Carousel** für Artikel-Kacheln, chronologisch sortiert (neueste links)
- **KI-Badge** muss als Design-Element definiert werden

---

## 8. Für Partner

### 8.1 Zweck

Seriöser, klarer Business-Case für vier Partnertypen: Unternehmen, Stiftungen/Fördergeber, Hochschulen, Initiativen. Jeder Partnertyp hat seinen eigenen Pfad, damit niemand durch irrelevante Inhalte scrollen muss.

### 8.2 Gesamtaufbau

1. Hero
2. Trust-Elemente „Wer mit uns baut / Keine zufälligen Bekannten" (bewegende Logoleiste)
3. Vier Partner-Kacheln als Tab-Leiste (Unternehmen Default aktiv)
4. Dynamischer Bereich pro Partnertyp
5. Kontaktformular mit Ansprechpartner-Karten
6. Transparenz-Hinweis (e.V.)

### 8.3 Hero

```
Generation AI · Für Partner

# Lass uns zusammen was bewegen.

Wir statten Studierende mit echten KI-Skills aus. Gemeinsam mit Partnern, die den gleichen Hebel sehen.
```

### 8.4 Trust-Sektion

```
// wer mit uns baut
### Keine zufälligen Bekannten.
```

Bewegende Logoleiste (identisch zur Startseite für Konsistenz).

### 8.5 Partner-Kacheln (Tab-Leiste, immer sichtbar)

Vier Kacheln nebeneinander:

**Unternehmen** — Zugang zu KI-affinen Talenten aus allen Fachrichtungen.

**Stiftungen** — Gemeinsam Bildungschancen im KI-Zeitalter schaffen.

**Hochschulen** — Praxisnahe KI-Kompetenz für eure Studierenden.

**Initiativen** — Gemeinsame Formate, geteilte Community.

### 8.6 Tab-Interaktion (wichtige technische Anforderung)

- **Default-Zustand beim Seitenaufruf**: „Unternehmen" ist vorausgewählt, Bereich geöffnet
- **Klick auf andere Kachel**: diese wird gehighlightet (aktiv markiert), Inhalt darunter wechselt. Nur ein Bereich zur Zeit sichtbar.
- **Kein Scroll-Reset**: nach Klick bleibt Nutzer:in auf gleicher Scroll-Position, nur Tab-Inhalt wechselt
- **Mobile**: Tab-Leiste als horizontaler Scroll oder Dropdown
- **URL-Parameter für Tab-Zustand**: `generation-ai.org/partner?typ=stiftungen` für Deep-Linking
- **Smooth Fade-In** beim Tab-Wechsel, keine harten Sprünge

### 8.7 Bereich Unternehmen (Default aktiv)

„KI-kompetente Talente aus allen Fachrichtungen werden zur wertvollsten Zielgruppe im Recruiting der nächsten Jahre. Wir bringen euch zusammen."

**Vorteile:**
- Early Access zu KI-affinen Talenten über alle Studiengänge hinweg
- Brand Association als zukunftsorientierter Arbeitgeber
- DACH-Reichweite über eine einzige Partnerschaft

**Formate:** Masterclasses · Speaker Sessions · Sponsoring und Sachleistungen

**CTA:** `[Gespräch vereinbaren]` (scrollt zum Kontaktformular)

### 8.8 Bereich Stiftungen

„Wir schließen eine Bildungslücke, die kein Lehrplan bisher adressiert. Fachrichtungsoffen, kostenlos, DACH-weit."

**Vorteile:**
- Messbarer Impact in einer schnell wachsenden Zielgruppe
- Gemeinnütziger Verein (e.V. i.G.) — transparente Strukturen
- Hochschulübergreifende Reichweite ohne Mehraufwand

**Formate:** Projekt- und Programmförderung · Stipendienkooperationen · Institutionelle Förderung

**CTA:** `[Förderanfrage senden]`

### 8.9 Bereich Hochschulen

„Wir ergänzen den Lehrplan dort, wo KI-Kompetenz praxisnah erlernt werden muss. Kostenfrei für eure Studierenden, unaufwendig für euch."

**Vorteile:**
- Praxisnahe KI-Skills, die der Lehrplan nicht abdecken kann
- Entlastung für Career Services und Lehrstühle
- Kostenloses Angebot für alle Studierenden

**Formate:** Vorlesungsvorstellungen und Gastvorträge · Career-Service-Integration · Lehrstuhl- und Fachbereichskooperationen

**CTA:** `[Kooperation anfragen]`

### 8.10 Bereich Initiativen

„Wir glauben an Kollaboration statt Konkurrenz. Wenn ihr eine komplementäre Community habt, lasst uns gemeinsam etwas bauen."

**Vorteile:**
- Geteilte Reichweite, geteilte Sichtbarkeit
- Fachrichtungsoffene Community als Multiplikator
- Gemeinsame Formate statt Einzelkämpfertum

**Formate:** Co-hosted Events und Workshops · Inhaltliche Cross-Promotion · Geteilte Speaker und Masterclasses

**CTA:** `[Unverbindlich kennenlernen]`

### 8.11 Kontaktformular

```
// kontakt
### Lass uns sprechen.

Wir melden uns meist innerhalb von 48 Stunden. Schreibst du lieber direkt? Unten findest du unsere Ansprechpartner:innen.
```

**Formular-Felder:**
- Name
- E-Mail
- Organisation
- Ich interessiere mich als … (Dropdown mit vier Partnertypen, **vorausgefüllt je nach aktivem Tab**)
- Nachricht (optional)

**Submit-Button:** `[Nachricht senden]`

**Ansprechpartner-Karten (unter dem Formular):**

Drei Karten mit Foto, Name, Rolle, Kontaktmöglichkeit:
- **Alex** — Head of Partnerships
- **Janna** — Co-Founder
- **Simon** — Co-Founder

### 8.12 Transparenz-Hinweis

> Generation AI ist als gemeinnütziger Verein (e.V. i.G.) organisiert. Alle Infos zur Satzung und Finanzierung findest du [hier] (→ Über uns).

---

## 9. Über uns

### 9.1 Zweck

Glaubwürdigkeit für alles andere. Muss gleichzeitig warm für Studierende und seriös für Partner wirken.

### 9.2 Sektionsreihenfolge

1. Hero (Mission)
2. Story (Minimal)
3. Team
4. Was uns antreibt (Werte)
5. Vereinsstruktur
6. Mitmach-CTA
7. FAQ
8. Abschluss-CTA
9. Kontaktbox

### 9.3 Hero

```
Generation AI · Über uns

# Warum es uns gibt.

**We shape talent for an AI-native future.**

Wir bringen Studierenden die KI-Skills bei, die in Jobs heute schon erwartet werden. Kostenlos, praxisnah, für alle Fachrichtungen.
```

### 9.4 Story (Minimal)

```
// unsere story
### Warum wir das machen.
```

Janna und Simon haben die Lücke selbst gespürt. Zwei Studierende, die nebenbei mit KI gearbeitet haben — und schnell gemerkt: was in Jobs heute schon läuft, ist ein anderes Level, als das was die meisten mitbekommen.

Im Februar 2026 haben sie Generation AI gegründet. Heute sind wir ein Team aus zehn Leuten, mit einem wachsenden Netzwerk aus Hochschulen, Unternehmen und Unterstützer:innen im Rücken.

Das Ziel: Studierenden den Vorsprung zu geben, den sie in einer KI-geprägten Arbeitswelt brauchen.

`Werde Teil davon →`

### 9.5 Team

```
// wer dahintersteckt
### Wir sind Generation AI.
```

**Gründer-Karten (oben, prominent):**
- **Janna** — Co-Founder
- **Simon** — Co-Founder

**Aktive Mitglieder (darunter, kleinere Kacheln):**

Nur Bilder + Namen, keine Rollen (lässt sich später ergänzen).

**Sub-Zeile:** `Stand: April 2026 · Wir wachsen.`

### 9.6 Was uns antreibt (Werte)

```
// was uns antreibt
### Worauf wir Wert legen.
```

**Offen für alle.**
KI-Kompetenz ist keine Frage des Studiengangs. Jurastudentin, Maschinenbauer, Kommunikationsdesignerin — bei uns lernen alle gemeinsam, ohne Vorwissen zu brauchen.

**Anwenden statt auswendig lernen.**
Unsere Formate sind Hands-on. Wir erklären nicht nur Tools, wir nutzen sie mit dir. Ein Workshop ist erst dann erfolgreich, wenn du danach was bauen kannst.

**Signal statt Noise.**
Es gibt zu viele KI-Tools, zu viele Kurse, zu viele Gurus. Wir filtern — und bringen dir nur das, was wirklich relevant ist.

**Voneinander lernen, zusammen wachsen.**
Generation AI ist keine Content-Plattform. Der wichtigste Teil unseres Angebots sind die Menschen, die du hier triffst.

### 9.7 Vereinsstruktur

```
// verein
### Gemeinnützig. Transparent. Offen.
```

Generation AI ist als gemeinnütziger Verein (e.V. i.G.) organisiert. Das heißt: wir arbeiten ohne Profit-Interesse, transparent in der Struktur, und finanzieren uns durch Fördermittel, Unternehmenspartnerschaften und Sachleistungen.

Die Mitgliedschaft ist kostenlos. Wer Lust hat, sich aktiv einzubringen, kann Teil des Teams werden.

### 9.8 Mitmach-CTA

```
### Bock, mitzumachen?

Wir suchen Leute, die mit aufbauen wollen. Events, Content, Strategie, Tech — sag uns, wo du anpacken würdest.

[Melde dich]
```

### 9.9 FAQ (erster Aufschlag, iterativ zu ergänzen)

```
// fragen & antworten
### Was du wissen solltest.
```

Als Accordion, mehrere Fragen gleichzeitig öffenbar.

**1. Was ist Generation AI?**
Eine Community für Studierende im DACH-Raum, die KI-Kompetenz aufbauen wollen. Wir bieten Events, Kurse, eine kuratierte Tool-Bibliothek und ein Netzwerk — kostenlos.

**2. Wer kann Mitglied werden?**
Jeder, der gerade studiert oder früh im Berufsleben ist. Fachrichtung ist egal, Vorwissen brauchst du keins.

**3. Kostet die Mitgliedschaft etwas?**
Nein. Sie ist kostenlos und soll es auch bleiben.

**4. Wie melde ich mich an?**
Über unser Anmeldeformular. Dauert etwa 2 Minuten.

**5. Brauche ich technisches Vorwissen?**
Nein. Wir fangen dort an, wo du stehst. Einsteiger-Workshops gibt es monatlich.

**6. Wie viel Zeit muss ich investieren?**
So viel wie du willst. Unsere Events sind optional. Manche nehmen gelegentlich teil, andere sind jede Woche dabei — beides passt.

**7. Muss ich an einer bestimmten Uni sein?**
Nein. Wir sind DACH-weit und uni-unabhängig.

**8. Wer steckt hinter Generation AI?**
Janna und Simon haben im Februar 2026 gegründet. Inzwischen gehören zehn aktive Mitglieder zum Kernteam, unterstützt von einem wachsenden Netzwerk aus Professor:innen, Unternehmer:innen und Praktiker:innen. [Link zu Team-Sektion]

**9. Wie finanziert ihr euch?**
Durch Fördermittel, Stiftungen, Unternehmenspartnerschaften und Sachleistungen. Mitgliedsbeiträge gibt es aktuell nicht und sind auch langfristig nicht als Haupteinnahme geplant.

**10. Kann ich aktiv im Verein mitarbeiten?**
Ja, ausdrücklich. Wenn du mehr als Fördermitglied sein willst, schreib uns einfach an. [Link zu „Melde dich" Button]

### 9.10 Abschluss-CTA

```
### Wir freuen uns auf dich.

Mitgliedschaft ist kostenlos und in 2 Minuten erledigt.
Du willst Partner werden oder mitmachen? Auch das geht →

[Kostenlos Mitglied werden]
```

Der „Auch das geht →" Link führt entweder auf Partner-Seite oder zum „Melde dich" Button. Team entscheidet, ob kleiner Hover-Popup mit zwei Links oder direkter Link.

### 9.11 Kontaktbox

```
// kontakt
### Hier erreichst du uns.

**Allgemeine Anfragen:** info@generation-ai.org

**Partnerschaften:** [Link zu Partner-Seite]

**Aktiv mitmachen:** [Link zu „Melde dich" Button oben]
```

### 9.12 Technische Anforderungen Über uns

- FAQ als Accordion
- Inline-Links in FAQ-Antworten
- Team-Bilder in konsistentem Format
- Anker-Links für alle Sektionen
- „Wir wachsen" Subtext leicht aktualisierbar

---

## 10. Jetzt beitreten (Join)

**Status:** wird in separater Session detailliert ausgearbeitet.

**Grundprinzipien (bereits entschieden):**
- Maximale Conversion, minimale Reibung
- **Kein FAQ** (das ist auf Startseite und Über uns verteilt)
- Hero mit direktem Einstieg ins Formular
- Drei Benefit-Icons als schnelle Bestätigung („Kostenlos · Keine Verpflichtung · In 2 Minuten")
- Formular sofort auf der Seite sichtbar, nicht erst nach Scrollen
- Optional: Assessment zur KI-Kompetenz-Einschätzung (späteres Thema)

---

## 11. Footer

### 11.1 Inhalt (bereits live)

- **Logo**
- **Kurze Tagline**: „Die KI-Community für Studierende im DACH-Raum."

**Entdecken:**
- Über uns
- Tools
- Community
- Für Partner
- Jetzt beitreten

**Rechtliches:**
- Impressum
- Datenschutz
- Satzung (hier einbinden)

**Kontakt:**
- info@generation-ai.org

© 2026 Generation AI e.V. (i.G.)

Made with care in Berlin & Hamburg.

---

## 12. CTA-Übersicht

| Seite | Primary CTA | Secondary CTA |
|---|---|---|
| Startseite (Hero) | Kostenlos beitreten | Mehr erfahren |
| Startseite (Final) | Jetzt beitreten | Erst mal umschauen → tools |
| Startseite (FAQ-Link) | — | Mehr Fragen? → Über uns |
| Events (Modal) | Anmelden (→ Login) | Kalender speichern |
| Events (Members-Only) | Jetzt beitreten | — |
| Events (Abschluss) | Jetzt beitreten | — |
| Tools (Hero-nah) | Kostenlos registrieren | Bereits Mitglied? Hier einloggen |
| Community (Hero) | — | Direkt zur Community → |
| Community (Abschluss) | Kostenlos beitreten | — |
| Partner (Unternehmen) | Gespräch vereinbaren | — |
| Partner (Stiftungen) | Förderanfrage senden | — |
| Partner (Hochschulen) | Kooperation anfragen | — |
| Partner (Initiativen) | Unverbindlich kennenlernen | — |
| Über uns (Story) | — | Werde Teil davon → |
| Über uns (Mitmach) | Melde dich | — |
| Über uns (Abschluss) | Kostenlos Mitglied werden | Auch das geht → (Partner/Mitmach) |

---

## 13. Offene Punkte & Roadmap

### 13.1 Zu klären (kurzfristig)

- **Event-Hosting**: Luma, Circle oder Hybrid — Empfehlung Hybrid
- **Launch-Voraussetzung Events**: echte Events statt Dummy-Data
- **Kategorien-Konsistenz Tools**: Labels zwischen Startseite und Tools-Seite angleichen
- **„Auch das geht →"-Link Über uns**: Mini-Popup mit zwei Links oder direkter Link
- **Artikel-Content für Community**: wie werden Circle-Inhalte für Hauptdomain aufbereitet?

### 13.2 Roadmap (mittelfristig)

- **Tool-Detailseiten**: eigenes Wording- und Layout-Projekt
- **Erweiterte Filter für Tools Pro**: Filter nach Tier-Badge, Studienrichtung, Use Case
- **Suchfeld** auf Tools-Seite
- **Filter-Funktion Events** ab 5+ parallelen Events
- **AI-Content-Agent** für automatisierte wöchentliche KI-News in Community
- **Jetzt-beitreten-Seite** im Detail ausarbeiten
- **KI-Kompetenz-Assessment** im Registrierungsflow
- **FAQ** iterativ erweitern

### 13.3 Fixes auf Live-Seite

- **Sticky Navigation** aktivieren (aktuell scrollt Nav mit)
- **„Aus der Community" Section-Header** braucht Design-Elemente (zwei Striche + Punkt)
- **Logo-Link auf Tools-Subdomain** führt aktuell auf Community, muss auf Hauptdomain zeigen
- **Trust-Sektion Startseite**: statische Logoleiste → bewegende Logo-Kacheln, mit Header „Wer mit uns baut / Keine zufälligen Bekannten"

---

**Ende des Konzepts. Version April 2026.**

Bei Fragen zur Umsetzung: info@generation-ai.org
