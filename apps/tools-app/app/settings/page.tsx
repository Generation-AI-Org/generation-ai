import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { PasswordSection } from './PasswordSection'
import { DeleteAccountButton } from './DeleteAccountButton'

// Disable caching - auth state must be fresh on every request
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Einstellungen | Generation AI Tools',
}

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg)] pt-8 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </Link>

        <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Einstellungen</h1>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Account</h2>
          <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <p className="text-[var(--text-secondary)] mb-2">Angemeldet als:</p>
            <p className="text-[var(--text)] font-medium">{user.email}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Passwort</h2>
          <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <p className="text-[var(--text-secondary)] mb-4">
              {user.user_metadata?.has_password === true
                ? 'Ändere dein Passwort. Du brauchst dein aktuelles Passwort zur Bestätigung.'
                : 'Setze ein Passwort, damit du dich auch ohne Magic-Link anmelden kannst.'}
            </p>
            <PasswordSection
              hasPassword={user.user_metadata?.has_password === true}
              email={user.email ?? ''}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Rechtliches</h2>
          <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] flex flex-col gap-2">
            <Link href="/impressum" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
              Datenschutz
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-red-400 mb-4">Gefahrenzone</h2>
          <div className="p-4 bg-[var(--surface)] rounded-lg border border-red-500/30">
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Account löschen</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Löscht deinen Account und alle zugehörigen Daten (Chat-Verlauf, Sessions).
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </div>
  )
}
