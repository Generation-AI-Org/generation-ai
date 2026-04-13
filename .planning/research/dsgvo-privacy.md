# DSGVO / Privacy Compliance — Generation AI

**Projekt:** Generation AI (KI-Community für Studierende, DACH)
**Recherchiert:** 2026-04-13
**Stack:** Next.js, Supabase (Auth + DB), Vercel, DACH-Zielgruppe

---

## Überblick: Was ist Pflicht, was ist Nice-to-have

| Thema | Status | Priorität |
|-------|--------|-----------|
| Impressum | **PFLICHT** | Sofort |
| Datenschutzerklärung | **PFLICHT** | Sofort |
| Cookie Banner (Session Cookies) | Nein (wenn nur technische Cookies) | — |
| Cookie Banner (Analytics) | Pflicht wenn konventionelle Analytics | Wenn Analytics implementiert |
| Supabase DPA unterzeichnen | **PFLICHT** | Bald |
| Recht auf Löschung (Account Delete) | **PFLICHT** | MVP |
| Recht auf Datenauskunft / Export | **PFLICHT** | MVP |
| Datenschutzbeauftragter | Wahrscheinlich nicht nötig (<20 MA) | Prüfen |

---

## 1. Cookie Banner — Pflicht oder nicht?

### Aktuelle Rechtslage (Deutschland, TDDDG / ePrivacy)

Rechtsgrundlage ist §25 TDDDG (früher TTDSG). Ein Cookie-Banner ist nur notwendig, wenn:
- Cookies oder ähnliche Tracking-Technologien eingesetzt werden, die **nicht technisch notwendig** sind
- Analytics, Marketing, Tracking, Social-Sharing-Buttons aktiv sind

### Supabase Session Cookies: **KEIN Banner notwendig**

Supabase setzt Session Cookies für Auth (Magic Link, Email/Passwort). Diese gelten als technisch notwendig, da:
- Sie ausschließlich der Authentifizierung dienen
- Die App ohne sie nicht funktioniert
- Kein Tracking oder Profiling stattfindet

**Konsequenz:** Solange nur Supabase Auth-Cookies gesetzt werden, ist kein Cookie-Banner erforderlich.

**Pflicht bleibt:** In der Datenschutzerklärung müssen diese Cookies trotzdem dokumentiert werden (Art, Zweck, Speicherdauer).

### Was einen Banner triggert (zu vermeiden oder zu managen):
- Google Analytics / GA4
- Facebook Pixel / Meta Tracking
- Hotjar, Clarity
- YouTube-Embeds (setzen Third-Party-Cookies)
- Google Fonts wenn von Google-Servern geladen (!)
- Intercom, Crisp oder andere Live-Chat-Tools

**Empfehlung:** Google Fonts lokal hosten (Self-hosted), keine Third-Party-Scripts ohne Consent-Management.

---

## 2. Datenschutzerklärung

### Status: PFLICHT — muss live sein

Rechtsgrundlage: Art. 13 DSGVO (Informationspflicht bei Direkterhebung).

### Pflichtangaben

**Verantwortlicher:**
- Vollständiger Name und Anschrift
- E-Mail-Adresse (Pflicht)
- Telefon (empfohlen, nicht zwingend)

**Verarbeitungszwecke und Rechtsgrundlagen:**
- Registration / Account-Erstellung: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
- Magic Link / Auth-E-Mails: Art. 6 Abs. 1 lit. b (notwendig für Dienst)
- Server-Logs / technische Daten: Art. 6 Abs. 1 lit. f (berechtigtes Interesse)

**Drittanbieter (müssen alle einzeln genannt werden):**
- Supabase (Auth, Datenbank) — Verarbeitungsort, DPA
- Vercel (Hosting) — Verarbeitungsort, Datenschutzinfos
- Resend (E-Mail-Versand) — Verarbeitungsort, DPA
- Anthropic / Claude API — falls personenbezogene Daten übermittelt werden

**Betroffenenrechte (Pflichtabschnitt):**
- Auskunft (Art. 15)
- Berichtigung (Art. 16)
- Löschung (Art. 17)
- Einschränkung der Verarbeitung (Art. 18)
- Datenübertragbarkeit (Art. 20)
- Widerspruch (Art. 21)
- Beschwerde bei Aufsichtsbehörde (zuständig: Landesbeauftragter des Bundeslandes des Verantwortlichen)

**Cookies-Abschnitt:**
- Welche Cookies gesetzt werden (Supabase Auth-Cookies)
- Technisch notwendige Cookies brauchen keine Einwilligung, müssen aber dokumentiert sein

**Aktueller Hinweis:** Das Gesetz heißt seit 2021 TDDDG (Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz), nicht mehr TTDSG. Datenschutzerklärungen mit veralteter Bezeichnung sollten aktualisiert werden.

### Tools für DSGVO-konforme Datenschutzerklärung
- eRecht24 Premium (kostenpflichtig, sehr gut für DE)
- Datenschutz-Generator von Dr. Thomas Schwenke (kostenlos, solide)
- Eigene Erstellung nach Vorlage (zeitintensiver, aber flexibler)

**Wichtig:** Generierte Texte immer auf den konkreten Stack anpassen. Boilerplate allein reicht nicht.

---

## 3. Impressum

### Status: PFLICHT — muss live sein

Rechtsgrundlage: §5 DDG (Digitale-Dienste-Gesetz, früher TMG), §55 MStV (Medienstaatsvertrag).

**Gilt für:** Alle Websites, die "geschäftsmäßig" betrieben werden. Das schließt:
- Communities mit Registrierung
- Plattformen die Mehrwert für Nutzer bieten
- Auch nicht-kommerzielle Angebote, sobald sie einen geschäftsmäßigen Charakter haben

Generation AI als KI-Community mit Registrierung fällt eindeutig darunter.

### Pflichtangaben Impressum

```
Name und Anschrift des Verantwortlichen (Person oder Org)
E-Mail-Adresse
Telefonnummer (seit DDG 2023 wieder Pflicht)
Vertretungsberechtigte Person (falls Organisation/Verein)
Umsatzsteuer-ID oder Handelsregisternummer (falls vorhanden)
```

**Wichtig:** Das Impressum muss von jeder Seite aus maximal 2 Klicks erreichbar sein (Rechtsprechung). Footer-Link reicht.

**Für beide Domains erforderlich:**
- generation-ai.org
- tools.generation-ai.org (eigene Domain = eigene Impressumspflicht, kann aber auf dasselbe Impressum verlinken)

**Strafe bei Fehlen:** Ordnungswidrigkeit, bis zu 50.000 EUR Bußgeld. Außerdem häufig Abmahngefahr durch Mitbewerber.

---

## 4. Consent Management für Analytics

### Status: Nice-to-have (erst relevant wenn Analytics implementiert wird)

**Empfehlung: Cookieless Analytics ohne Banner**

Wenn Analytics implementiert wird, sollte eine datenschutzfreundliche Lösung gewählt werden, die keinen Cookie-Banner erfordert:

| Tool | Cookies | Banner nötig | EU-Hosting | Empfehlung |
|------|---------|-------------|------------|------------|
| **Plausible** | Nein | Nein (lt. Plausible) | Ja (EU-Option) | Empfohlen |
| **Fathom** | Nein | Nein | Ja | Gut |
| **Matomo (Self-hosted)** | Optional | Nein wenn cookieless | Ja (selbst) | Aufwändig |
| Google Analytics 4 | Ja | Ja | Nein | Nicht empfohlen |
| Vercel Analytics | Minimal | Unklar | Vercel EU | Prüfen |

**Plausible** ist die klarste Empfehlung für diesen Stack: DSGVO-konform, kein Cookie-Banner, EU-Hosting verfügbar, einfache Next.js-Integration via `@analytics/plausible` oder direktem Script.

**Hinweis:** Deutsche Aufsichtsbehörden interpretieren das TDDDG streng. Selbst für cookieless Analytics empfehlen einige Juristen einen Hinweis in der Datenschutzerklärung. Kein separater Banner nötig, aber Dokumentation in der Datenschutzerklärung ist Pflicht.

### Falls doch konventionelle Analytics: Consent Management Platform (CMP)

Empfehlung: **Consentmanager.net** oder **Usercentrics** (beide DE-basiert, DSGVO-spezialisiert). Komplexer zu implementieren aber rechtssicher.

---

## 5. Supabase DPA (Data Processing Agreement)

### Status: PFLICHT — aktiv unterzeichnen

Da Supabase personenbezogene Daten (E-Mail-Adressen, Auth-Daten) für Generation AI verarbeitet, ist ein Auftragsverarbeitungsvertrag (AVV / DPA) nach Art. 28 DSGVO rechtlich vorgeschrieben.

### Wie der Supabase DPA abgeschlossen wird

1. Supabase Dashboard öffnen
2. Unter **Settings → Legal Documents** das DPA anfordern
3. Supabase sendet ein PandaDoc-Dokument zum Unterzeichnen
4. Unterzeichnetes Dokument aufbewahren (Nachweis bei Datenschutzprüfung)

**Es gibt keine automatische / Self-Service-Option.** Der DPA muss aktiv angefordert und unterzeichnet werden.

### Was der Supabase DPA abdeckt

- Standard Contractual Clauses (SCC) für internationale Datentransfers (auch wenn EU-Region genutzt wird: Supabase Inc. ist US-Unternehmen)
- SOC2 Type 2 zertifiziert
- HIPAA-konform (für Healthcare-Daten, hier nicht relevant aber zeigt Compliance-Reife)

### Supabase Region: Frankfurt empfohlen

Wenn das Projekt noch auf einer US-Region läuft: Migration auf **EU Central (Frankfurt)** empfohlen. Vereinfacht DSGVO-Compliance erheblich, da Daten physisch in der EU bleiben.

Aktuelles Supabase-Projekt: `wbohulnuwqrhystaamjc.supabase.co` — Region prüfen im Dashboard unter **Settings → Infrastructure**.

### Weitere Drittanbieter die AVVs benötigen

| Anbieter | Notwendig | Wie |
|----------|-----------|-----|
| Vercel | Ja | Vercel DPA: vercel.com/legal/dpa (self-service in Dashboard) |
| Resend | Ja | Resend DPA: resend.com/legal/dpa |
| Anthropic (Claude API) | Ja wenn User-Daten verarbeitet | Enterprise DPA nötig |

---

## 6. Recht auf Löschung und Datenexport

### Recht auf Löschung (Art. 17 DSGVO) — PFLICHT

Nutzer müssen ihren Account und alle personenbezogenen Daten löschen können. "Unverzüglich" = innerhalb weniger Werktage nach Anfrage.

**Was gelöscht werden muss:**
- Auth-Account in Supabase (`auth.users`)
- Alle Profildaten in der Datenbank
- Alle nutzergenerierten Inhalte (Chat-Historie, gespeicherte Tools etc.)
- E-Mail aus Mailing-Listen (Resend / Newsletter)

**Minimum-Implementierung (MVP):**
- Account-Delete-Funktion in den Einstellungen oder
- Klar sichtbare E-Mail-Adresse in der Datenschutzerklärung für Löschanfragen

**Besser:** Self-Service "Account löschen"-Button in den User-Settings. Spart manuellen Aufwand bei skalierendem User-Base.

**Achtung bei Supabase:** `auth.deleteUser()` löscht den Auth-User, aber custom Tabellen müssen separat per CASCADE oder manuell gelöscht werden. RLS-Policies und Foreign Keys beachten.

### Recht auf Datenauskunft (Art. 15 DSGVO) — PFLICHT

Nutzer können jederzeit Auskunft verlangen, welche Daten gespeichert sind.

**Minimum:** E-Mail-Adresse in Datenschutzerklärung, manuelle Bearbeitung von Anfragen (Frist: 1 Monat, verlängerbar auf 3 Monate).

### Recht auf Datenübertragbarkeit (Art. 20 DSGVO) — PFLICHT

Daten müssen in strukturiertem, maschinenlesbarem Format (JSON oder CSV) bereitgestellt werden.

**Minimum:** Auf Anfrage per E-Mail exportieren.
**Besser:** Self-Service Datenexport-Funktion ("Meine Daten herunterladen").

### Reaktionsfrist für alle Betroffenenrechte

1 Monat ab Anfrage (verlängerbar auf 3 Monate mit Begründung). Anfragen müssen dokumentiert werden.

---

## 7. Weitere Punkte

### Datenschutzbeauftragter (DSB)

**Wahrscheinlich nicht Pflicht** bei Generation AI (Start-up/Community, <20 Personen die regelmäßig Daten verarbeiten). Grenze liegt laut §38 BDSG bei 20 Mitarbeitenden.

Geplante Gesetzesänderung 2025/2026 würde die Schwelle auf 50 Mitarbeitende erhöhen — aber noch nicht in Kraft.

**Empfehlung:** Aktuell nicht nötig. Wenn Team und Nutzerdaten wachsen, neu bewerten.

### Nutzungsalter / Minderjährigenschutz

Für Studierende (18+) ist das i.d.R. kein Problem. Trotzdem in den AGB/Datenschutzerklärung festhalten, dass der Dienst für Personen ab 16 Jahren ist (DSGVO erlaubt Datenverarbeitung für Minderjährige ab 16 ohne elterliche Zustimmung in Deutschland).

### Verarbeitungsverzeichnis (Art. 30 DSGVO)

Pflicht für alle Verantwortlichen. Internes Dokument (muss nicht veröffentlicht werden), das alle Verarbeitungstätigkeiten dokumentiert. Schablone erstellen und befüllen.

---

## Konkrete TODOs — nach Priorität

### Sofort (vor Go-Live / jetzt wenn live)

- [ ] **Impressum** auf generation-ai.org und tools.generation-ai.org prüfen/erstellen
- [ ] **Datenschutzerklärung** auf beiden Domains prüfen/aktualisieren (TDDDG-Bezeichnung, Supabase + Vercel + Resend als Drittanbieter eintragen)
- [ ] **Supabase DPA** anfordern und unterzeichnen (Dashboard → Settings → Legal Documents)
- [ ] **Vercel DPA** aktivieren (vercel.com/legal/dpa)
- [ ] **Resend DPA** prüfen und unterzeichnen
- [ ] **Supabase Region** prüfen — wenn US-Region: Migration nach Frankfurt (EU Central) einplanen

### Kurzfristig (nächste 2-4 Wochen)

- [ ] **Account-Delete-Funktion** implementieren (Self-Service bevorzugt, minimum: E-Mail-Adresse für Anfragen)
- [ ] **Datenauskunft** klären: Prozess für manuelle Anfragen definieren, E-Mail-Adresse in Datenschutzerklärung dokumentieren
- [ ] **Google Fonts** prüfen — müssen lokal gehostet werden (kein Google-CDN)
- [ ] **Verarbeitungsverzeichnis** als internes Dokument anlegen
- [ ] **Cookie-Dokumentation** in Datenschutzerklärung: Supabase Auth-Cookies mit Name, Zweck, Speicherdauer dokumentieren

### Wenn Analytics implementiert wird

- [ ] **Plausible Analytics** statt Google Analytics wählen — kein Cookie-Banner nötig, EU-Hosting
- [ ] Plausible in Datenschutzerklärung dokumentieren
- [ ] Bei Vercel Analytics: rechtliche Einschätzung prüfen

### Nice-to-have / Langfristig

- [ ] **Self-Service Datenexport** (JSON-Download "Meine Daten")
- [ ] **Datenschutz-FAQ** für Nutzer (reduziert Support-Anfragen)
- [ ] **Anthropic/Claude API DPA** prüfen, falls User-Eingaben an Claude-API gesendet werden (Chat-Feature im tools-app)

---

## Quellen

- [§25 TDDDG — Cookie-Banner-Pflicht (DATUREX)](https://externer-datenschutzbeauftragter-dresden.de/datenschutz/cookie-banner-pflicht/)
- [Technisch notwendige Cookies (datenschutz.org)](https://www.datenschutz.org/technisch-notwendige-cookies/)
- [Supabase DPA](https://supabase.com/legal/dpa)
- [Supabase GDPR Discussion (GitHub)](https://github.com/orgs/supabase/discussions/2341)
- [Plausible — Privacy-focused Analytics ohne Cookie-Banner](https://plausible.io/privacy-focused-web-analytics)
- [Art. 17 DSGVO — Recht auf Löschung (dejure.org)](https://dejure.org/gesetze/DSGVO/17.html)
- [Art. 20 DSGVO — Recht auf Datenübertragbarkeit (dejure.org)](https://dejure.org/gesetze/DSGVO/20.html)
- [Impressumspflicht DDG (IHK Chemnitz)](https://www.ihk.de/chemnitz/recht-und-steuern/rechtsinformationen/internetrecht/pflichtangaben-im-internet-die-impressumspflicht-4401580)
- [Datenschutzerklärung Pflichtangaben (dr-dsgvo.de)](https://dr-dsgvo.de/datenschutzerklaerung-auf-webseiten-inhalt/)
- [Datenschutzbeauftragter Pflicht 2025 (datenschutz.org)](https://www.datenschutz.org/datenschutzbeauftragter-ab-wann/)
