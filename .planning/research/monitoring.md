# Monitoring & Error Tracking — Generation AI Monorepo

**Recherchiert:** 2026-04-13
**Kontext:** Next.js 16, Vercel Hosting, kleine Student-Organisation, Budget begrenzt, aktuell kein Monitoring

---

## TL;DR Empfehlung

| Bereich | Tool | Kosten |
|---|---|---|
| Error Tracking | Sentry (Free) | 0 € |
| Performance / CWV | Vercel Speed Insights | 0 € |
| Uptime Monitoring | Better Stack (Free) | 0 € |
| Logging | Axiom (Free) | 0 € |
| Alerting | Sentry + Better Stack built-in | 0 € |

**Gesamtkosten: 0 €/Monat** — alle empfohlenen Tools haben ausreichende Free Tiers für eine kleine Community-Plattform.

---

## 1. Error Tracking

### Vergleich: Sentry vs. Vercel Observability

| Kriterium | Sentry Free | Vercel Observability (Free) |
|---|---|---|
| Fehler / Monat | 5.000 | Nicht dokumentiert (limitiert) |
| Stack Traces | Ja, mit Source Maps | Ja, aber weniger detailliert |
| Performance Tracing | 5M Spans / Monat | Nur Error Rate-Übersicht |
| Session Replay | 50 / Monat | Nein |
| Alerting | E-Mail | Nein (nur Dashboard) |
| Retention | 30 Tage | Kürzer (Hobby-Plan) |
| Next.js App Router | Native, via `instrumentation.ts` | Native |
| Users (Free) | **1 User** | Unbegrenzt |
| Platform-Lock | Kein | Vercel-only |

**Kritischer Unterschied:** Sentry Free ist auf **1 User** begrenzt — kein Problem für einen Solo-Tech-Lead, aber erwähnenswert falls das Team wächst. Vercel Observability trackt keine einzelnen Errors mit Stack Traces auf dem Hobby-Plan, es zeigt nur aggregierte Error Rates.

### Empfehlung: Sentry (Free)

Sentry ist der Industry-Standard und die einzige Option mit echtem Error Tracking (Stack Traces, Source Maps, Kontext-Variablen). Vercel Observability ist ein Dashboard für Infra-Metriken, kein Ersatz für Error Tracking.

**Sentry + Vercel zusammen ist kein Problem**, solange `@vercel/otel` nicht gleichzeitig aktiv ist — das würde OpenTelemetry-Konflikte mit Sentry v8+ verursachen. Sentry v8 setzt OpenTelemetry intern selbst auf.

### Setup: Sentry für Next.js 16 (Monorepo)

Sentry muss **pro App** eingerichtet werden — je ein separates Sentry-Projekt für `apps/website` und `apps/tools-app`.

```bash
# In apps/website/ und apps/tools-app/ jeweils:
pnpm add @sentry/nextjs
```

**`instrumentation.ts`** (im Root jeder App):

```typescript
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Next.js 15+: Server-seitige Fehler capturen
export const onRequestError = Sentry.captureRequestError;
```

**`sentry.client.config.ts`**:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% reicht für Free Tier
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0, // Fehler immer capturen
  environment: process.env.NODE_ENV,
});
```

**`next.config.ts`**:

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = { /* ... */ };

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
```

**Wichtig für Monorepo:** `SENTRY_AUTH_TOKEN` als Vercel-Env-Variable setzen (für Source Map Upload beim Build). Separate DSN-URLs für website und tools-app.

**Konfidenz:** HIGH (offizielle Sentry-Docs verifiziert, aktiver Support für Next.js 15/16)

---

## 2. Uptime Monitoring

### Vergleich

| Tool | Free Tier | Check-Intervall | Alerts | Besonderheit |
|---|---|---|---|---|
| **Better Stack** | 10 Monitors, 10 Heartbeats | 3 Minuten | Phone/SMS/Email | Status Page gratis, Incident Management |
| UptimeRobot | 50 Monitors | 5 Minuten | E-Mail | **Non-commercial only** seit Okt 2024 |
| Vercel Monitoring | Nur mit Observability+ | — | — | Kein externes Uptime-Monitoring |

**UptimeRobot ist für diesen Fall ausgeschlossen:** Seit Oktober 2024 darf der Free Plan nur noch für nicht-kommerzielle Projekte genutzt werden. Generation AI könnte als Organisation mit Mitgliedschaften als kommerziell eingestuft werden — rechtliches Graugebiet, besser meiden.

### Empfehlung: Better Stack (Free)

10 Monitore reichen für `generation-ai.org`, `tools.generation-ai.org`, `community.generation-ai.org` und wichtige API-Endpoints. 3-Minuten-Checks sind schneller als UptimeRobot (5 Min). Inklusive Status Page und Incident Management.

**Zu monitoren:**
1. `https://generation-ai.org` — Hauptseite
2. `https://tools.generation-ai.org` — Tools App
3. `https://community.generation-ai.org` — Circle Community
4. `https://tools.generation-ai.org/api/health` — API Health Check (eigenen Endpoint bauen)

**`/api/health` Endpoint** (empfohlen in `apps/tools-app`):

```typescript
// apps/tools-app/src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

**Konfidenz:** MEDIUM (Free Tier-Limits aus WebSearch verifiziert, Pricing-Page nicht direkt gecrawlt)

---

## 3. Performance Monitoring (Core Web Vitals)

### Vergleich

| Tool | Kosten | Daten | Setup-Aufwand |
|---|---|---|---|
| **Vercel Speed Insights** | Free (Hobby) | Real User Monitoring (RUM) | Minimal |
| Google Search Console | Free | CWV aus Crawl-Daten | Nur Registrierung |
| `next/web-vitals` Hook | Free | Custom-Reporting | Mittel |
| Sentry Performance | Inklusive (Free: 5M Spans) | Transaction Tracing | Bereits im Stack |

### Empfehlung: Vercel Speed Insights + Google Search Console

Beide kostenlos, beide ohne Aufwand. Speed Insights liefert Real User Monitoring direkt im Vercel Dashboard. Google Search Console zeigt CWV aus Google's Perspektive (relevant für SEO).

**Setup: Vercel Speed Insights**

```bash
# In apps/website/ und apps/tools-app/:
pnpm add @vercel/speed-insights
```

```typescript
// apps/website/src/app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

Nach dem nächsten Deploy sind CWV-Daten automatisch im Vercel Dashboard → Speed Insights Tab sichtbar.

**Konfidenz:** HIGH (offizielle Vercel-Docs verifiziert)

---

## 4. Logging (Structured Logging für API Routes)

### Problem mit `console.log` in Next.js / Vercel

Vercel zeigt Function Logs im Dashboard an, aber nur für kurze Zeit (Hobby: ~1 Stunde Retention). Für Production-Debugging und Audit Trails braucht man einen externen Log-Drain.

### Vergleich

| Tool | Free Tier | Retention | Next.js Integration | Besonderheit |
|---|---|---|---|---|
| **Axiom** | 500 GB / Monat | 30 Tage | Native Vercel Integration, `next-axiom` | Vercel-Marketplace, zero-config |
| Better Stack Logs | 3 GB / Monat | 3 Tage (Free) | `logtail-nextjs` | Bereits im Stack wenn Uptime genutzt |
| Vercel Log Drains | Nur Pro Plan | — | Native | Kostet Geld |

### Empfehlung: Axiom (Free)

Axiom hat die mit Abstand großzügigste Free Tier (500 GB/Monat vs. 3 GB bei Better Stack) und eine direkte Vercel-Integration ohne Code-Änderungen. Für eine Student-Community mit moderatem Traffic irrelevant, ob 3 GB oder 500 GB — aber die längere Retention (30 Tage) und der Zero-Config-Setup machen Axiom klar zum Sieger.

**Achtung:** Axiom hat seit 2025 eine Vercel Marketplace Integration. Logs fließen automatisch ohne Code-Änderungen wenn die Integration aktiviert ist.

**Setup via Vercel Marketplace (empfohlen):**
1. Vercel Dashboard → Integrations → Axiom suchen → Add Integration
2. Axiom-Account erstellen (Free)
3. Alle Function Logs fließen automatisch zu Axiom

**Alternativ: Strukturiertes Logging mit `next-axiom`**

```bash
pnpm add next-axiom
```

```typescript
// apps/tools-app/src/app/api/chat/route.ts
import { log } from "next-axiom";

export async function POST(request: Request) {
  const { userId, message } = await request.json();
  
  log.info("Chat request", { 
    userId, 
    messageLength: message.length,
    timestamp: new Date().toISOString()
  });
  
  // ... handler logic
}
```

**Was zu loggen ist:**
- API Route Errors (mit Kontext: userId, route, params)
- Auth-Ereignisse (Login, Logout, failed attempts)
- LLM API Calls (Token Usage, Latenz — kein Message-Inhalt aus Datenschutzgründen)
- Webhook-Events

**Was NICHT zu loggen ist:**
- Message-Inhalte von Chat-Nutzern (DSGVO)
- Passwörter, Tokens, Session-IDs im Klartext
- Persönliche Nutzerdaten ohne Anonymisierung

**Konfidenz:** MEDIUM (Axiom Free-Tier-Zahlen aus mehreren WebSearch-Quellen bestätigt, offizielles Pricing nicht direkt gecrawlt)

---

## 5. Alerting

### Strategie: Wann und wie benachrichtigen?

**Grundprinzip für eine kleine Org:** Lieber weniger, aber actionable Alerts. Alert-Fatigue durch zu viele Benachrichtigungen ist das häufigste Problem bei Monitoring-Setups.

### Alert-Matrix

| Event | Schwere | Kanal | Wer bekommt es? |
|---|---|---|---|
| Site komplett down | Kritisch | SMS / Phone (Better Stack) | Luca sofort |
| > 10 Errors / Minute (neue Fehler) | Hoch | E-Mail (Sentry) | Luca |
| CWV-Verschlechterung | Mittel | Vercel Dashboard | Wöchentlicher Review |
| API Health Check failed | Mittel | E-Mail (Better Stack) | Luca |
| Sentry Error-Budget erschöpft (80%) | Niedrig | E-Mail (Sentry) | Monatlicher Review |

### Sentry Alert-Konfiguration (empfohlen)

**Issue Alert:** Neuer Fehler der vorher nicht vorkam → E-Mail sofort
**Issue Alert:** Fehler tritt > 100x in 1 Stunde auf → E-Mail sofort
**Metric Alert:** Error Rate > 5% für eine Route → E-Mail

In Sentry unter Project → Alerts → Create Alert Rule.

### Better Stack Alert-Konfiguration

- Downtime-Alert: sofort via E-Mail
- Wenn Budget vorhanden (Better Stack Starter ~24 €/Mo): SMS/Phone-Call für kritische Downtimes
- Recovery-Alert: "Site is back up" aktivieren

### Anti-Pattern: NICHT machen

- Jeden einzelnen Sentry-Error als E-Mail-Alert — führt zu Alert-Fatigue
- Alerts ohne klare "Was tue ich jetzt?"-Antwort
- PagerDuty oder komplexes On-Call-Routing für ein 1-Personen-Tech-Team

---

## Setup-Reihenfolge (Empfehlung)

Die Reihenfolge nach Aufwand/Nutzen-Verhältnis:

**Schritt 1 — Sofort (30 Minuten):**
- Vercel Speed Insights aktivieren (`@vercel/speed-insights` installieren + Component einbinden)
- Better Stack Account erstellen, 3-4 Uptime-Monitore anlegen

**Schritt 2 — Bald (1-2 Stunden):**
- Sentry-Projekte anlegen (eines für website, eines für tools-app)
- Sentry SDK installieren, `instrumentation.ts` einrichten
- `SENTRY_AUTH_TOKEN` in Vercel Env setzen
- Basis-Alert-Regeln in Sentry konfigurieren

**Schritt 3 — Optional (1 Stunde):**
- Axiom Vercel-Marketplace-Integration aktivieren (zero-config)
- `/api/health` Endpoint in tools-app bauen
- `next-axiom` für strukturiertes Logging in kritischen API Routes

---

## Kosten-Szenario: Wann müsste man upgraden?

| Trigger | Tool | Upgrade-Kosten |
|---|---|---|
| > 5.000 Errors/Monat (z.B. bei Wachstum) | Sentry Team | 26 $/Mo |
| > 10 Monitore benötigt | Better Stack Starter | ~24 €/Mo |
| > 500 GB Logs/Monat | Axiom Basic | 25 $/Mo |

Bei einer Student-Community mit einigen hundert aktiven Nutzern ist ein Upgrade in den nächsten 12 Monaten unwahrscheinlich.

---

## Quellen

- [Sentry Pricing](https://sentry.io/pricing/)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Observability Docs](https://vercel.com/docs/observability)
- [Vercel Speed Insights Quickstart](https://vercel.com/docs/speed-insights/quickstart)
- [Better Stack Pricing](https://betterstack.com/pricing)
- [Axiom für Vercel](https://axiom.co/vercel)
- [Axiom next-axiom GitHub](https://github.com/axiomhq/next-axiom)
- [Arcjet Structured Logging Next.js](https://blog.arcjet.com/structured-logging-in-json-for-next-js/)
- [Top 10 Next.js Monitoring Tools 2026](https://earezki.com/ai-news/2026-04-09-10-best-nextjs-monitoring-tools-in-2026-honest-review-from-a-founder/)
