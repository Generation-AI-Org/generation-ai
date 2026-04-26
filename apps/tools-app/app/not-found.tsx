import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <p className="text-neon text-6xl font-bold mb-4">404</p>
      <h1 className="text-text text-xl font-semibold mb-2">Seite nicht gefunden</h1>
      <p className="text-text-muted text-sm mb-8">Dieses Tool oder dieser Guide existiert nicht.</p>
      <Link
        href="/"
        className="bg-neon text-black-brand font-semibold px-5 py-2.5 rounded-full hover:bg-neon/90 transition-colors text-sm"
      >
        Zurück zur Bibliothek
      </Link>
    </div>
  )
}
