import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Impressum | Generation AI',
  description: 'Impressum und rechtliche Informationen zu Generation AI.',
}

export default function Impressum() {
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
          Zurück zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-text mb-8">Impressum</h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="text-text-secondary">
              Generation AI e.V. (i.Gr.)<br />
              Feuerbachstraße 26<br />
              71254 Ditzingen
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Vertreten durch</h2>
            <p className="text-text-secondary">
              Janna Schweigmann (Vorsitzende)<br />
              Simon Vetter (Vorsitzender)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Kontakt</h2>
            <p className="text-text-secondary">
              E-Mail: info@generation-ai.org
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="text-text-secondary">
              Janna Schweigmann<br />
              Feuerbachstraße 26<br />
              71254 Ditzingen
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">EU-Streitschlichtung</h2>
            <p className="text-text-secondary">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-text-secondary mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Haftung für Inhalte</h2>
            <p className="text-text-secondary">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Haftung für Links</h2>
            <p className="text-text-secondary">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-4">Urheberrecht</h2>
            <p className="text-text-secondary">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
