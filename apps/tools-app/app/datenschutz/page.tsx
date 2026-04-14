import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datenschutzerklaerung | Generation AI',
  description: 'Datenschutzerklaerung von Generation AI - Informationen zur Verarbeitung personenbezogener Daten.',
}

export default function Datenschutz() {
  return (
    <main className="min-h-screen bg-bg pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurueck zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-text mb-8">Datenschutzerklaerung</h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-medium text-text mb-2">Allgemeine Hinweise</h3>
            <p className="text-text-secondary">
              Die folgenden Hinweise geben einen einfachen Ueberblick darueber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
              Daten sind alle Daten, mit denen Sie persoenlich identifiziert werden koennen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">2. Verantwortliche Stelle</h2>
            <p className="text-text-secondary">
              Generation AI e.V. (i.Gr.)<br />
              Feuerbachstrasse 26<br />
              71254 Ditzingen<br /><br />
              {/* TODO: Echte Telefonnummer eintragen */}
              Telefon: +49 XXX XXXXXXXX<br />
              E-Mail: info@generation-ai.org
            </p>
            <p className="text-text-secondary mt-4">
              Verantwortliche Stelle ist die natuerliche oder juristische Person, die allein oder
              gemeinsam mit anderen ueber die Zwecke und Mittel der Verarbeitung von personenbezogenen
              Daten entscheidet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">3. Datenerfassung auf dieser Website</h2>

            <h3 className="text-lg font-medium text-text mb-2 mt-6">Anmeldung und Account</h3>
            <p className="text-text-secondary">
              Bei der Anmeldung zu unserer Plattform erheben wir folgende Daten:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>E-Mail-Adresse</li>
              <li>Name (optional)</li>
            </ul>
            <p className="text-text-secondary mt-4">
              <strong>Zweck:</strong> Die Daten werden verwendet, um Ihnen Zugang zur Plattform zu
              gewaehren und Ihre Einstellungen zu speichern.
            </p>
            <p className="text-text-secondary mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung)
            </p>

            <h3 className="text-lg font-medium text-text mb-2 mt-6">Chat-Verlauf</h3>
            <p className="text-text-secondary">
              Ihre Chat-Nachrichten mit dem KI-Assistenten werden in unserer Datenbank gespeichert,
              um Ihnen einen persistenten Verlauf zu ermoeglichen. Sie koennen Ihren Account und
              alle zugehoerigen Daten jederzeit loeschen.
            </p>
            <p className="text-text-secondary mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung)
            </p>

            <h3 className="text-lg font-medium text-text mb-2 mt-6">Cookies</h3>
            <p className="text-text-secondary">
              Diese Website verwendet technisch notwendige Cookies fuer die Authentifizierung.
              Diese Cookies sind fuer den Betrieb der Website erforderlich und koennen nicht
              deaktiviert werden.
            </p>
            <p className="text-text-secondary mt-2">
              <strong>Rechtsgrundlage:</strong> Paragraph 25 Abs. 2 Nr. 2 TDDDG (technisch notwendige Speicherung)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">4. Externe Dienste</h2>

            <h3 className="text-lg font-medium text-text mb-2">Hosting (Vercel)</h3>
            <p className="text-text-secondary">
              Diese Website wird bei Vercel Inc. gehostet. Beim Besuch der Website werden
              automatisch technische Daten (IP-Adresse, Browsertyp, Betriebssystem) erfasst.
            </p>
            <p className="text-text-secondary mt-2">
              Anbieter: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
            </p>

            <h3 className="text-lg font-medium text-text mb-2 mt-6">Authentifizierung und Datenbank (Supabase)</h3>
            <p className="text-text-secondary">
              Fuer die Benutzeranmeldung und Datenspeicherung nutzen wir Supabase. Dabei werden
              Ihre E-Mail-Adresse, Profildaten und Chat-Verlaeufe sicher gespeichert.
            </p>
            <p className="text-text-secondary mt-2">
              Anbieter: Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992
            </p>

            <h3 className="text-lg font-medium text-text mb-2 mt-6">E-Mail-Versand (Resend)</h3>
            <p className="text-text-secondary">
              Fuer den Versand von E-Mails (z.B. Magic Link zur Anmeldung) nutzen wir Resend.
            </p>
            <p className="text-text-secondary mt-2">
              Anbieter: Resend Inc., 2261 Market Street #4059, San Francisco, CA 94114, USA
            </p>

            <h3 className="text-lg font-medium text-text mb-2 mt-6">KI-Assistent (Anthropic Claude)</h3>
            <p className="text-text-secondary">
              Fuer unseren KI-Assistenten nutzen wir die Claude API von Anthropic.
              Bei der Nutzung des Chat-Assistenten werden Ihre Eingaben an Anthropic uebermittelt.
            </p>
            <p className="text-text-secondary mt-2">
              Anbieter: Anthropic, PBC, 548 Market St, San Francisco, CA 94104, USA
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">5. Ihre Rechte</h2>
            <p className="text-text-secondary">
              Sie haben jederzeit das Recht:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Auskunft ueber Ihre gespeicherten Daten zu erhalten</li>
              <li>Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Loeschung Ihrer Daten zu verlangen</li>
              <li>Die Einschraenkung der Verarbeitung zu verlangen</li>
              <li>Der Verarbeitung zu widersprechen</li>
              <li>Ihre Daten in einem uebertragbaren Format zu erhalten</li>
            </ul>
            <p className="text-text-secondary mt-4">
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter: info@generation-ai.org
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">6. Beschwerderecht</h2>
            <p className="text-text-secondary">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehoerde ueber die
              Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">7. Aktualitaet</h2>
            <p className="text-text-secondary">
              Diese Datenschutzerklaerung ist aktuell gueltig und hat den Stand April 2026.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
