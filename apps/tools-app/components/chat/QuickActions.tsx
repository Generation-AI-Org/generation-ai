'use client'

import type { ChatContext } from '@/lib/types'

const GENERIC_QUICK_ACTIONS = [
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

// LOCKED copy from CONTEXT.md D-04 — do not reformulate. {ToolName} interpolated
// from context.title.
function buildDetailActions(context: ChatContext) {
  return [
    {
      id: 'compare',
      label: 'Wie unterscheidet sich das von ähnlichen Tools?',
      prompt: 'Wie unterscheidet sich das von ähnlichen Tools?',
    },
    {
      id: 'usecase',
      label: `Für welche Use-Cases passt ${context.title}?`,
      prompt: `Für welche Use-Cases passt ${context.title}?`,
    },
    {
      id: 'start',
      label: 'Wie fange ich an?',
      prompt: 'Wie fange ich an?',
    },
  ]
}

interface QuickActionsProps {
  onPick: (prompt: string) => void
  variant?: 'generic' | 'detail'
  context?: ChatContext
}

export default function QuickActions({ onPick, variant = 'generic', context }: QuickActionsProps) {
  const actions =
    variant === 'detail' && context
      ? buildDetailActions(context)
      : GENERIC_QUICK_ACTIONS

  return (
    <div className="flex flex-col gap-2 w-full">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onPick(action.prompt)}
          className="text-left px-4 py-3 min-h-[48px] rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-muted)] text-sm transition-[background-color,border-color,box-shadow,color] duration-200 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:shadow-[0_0_12px_var(--accent-glow)]"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
