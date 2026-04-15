'use client'

const QUICK_ACTIONS = [
  {
    id: 'thesis',
    label: 'Ich schreibe meine Thesis',
    prompt: 'Ich schreibe gerade meine Thesis. Welche KI-Tools helfen mir bei Recherche, Schreiben und Quellenmanagement?',
  },
  {
    id: 'automate',
    label: 'Ich will was automatisieren',
    prompt: 'Ich will wiederkehrende Aufgaben automatisieren, auch ohne programmieren zu können. Was gibt es da?',
  },
  {
    id: 'start',
    label: 'Ich fange gerade an mit AI',
    prompt: 'Ich bin Anfänger bei KI-Tools. Mit welchen 2-3 Tools sollte ich starten?',
  },
  {
    id: 'nocode',
    label: 'Ohne Code was bauen',
    prompt: 'Ich will ohne Programmieren etwas bauen — Website, App oder Automation. Welche Tools sind da gut?',
  },
]

interface QuickActionsProps {
  onPick: (prompt: string) => void
}

export default function QuickActions({ onPick }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => onPick(action.prompt)}
          className="text-left px-4 py-3 min-h-[48px] rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-muted)] text-sm transition-all duration-200 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:shadow-[0_0_12px_var(--accent-glow)]"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
