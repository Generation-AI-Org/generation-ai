'use client'

const FILTERS = [
  { label: 'Alle', value: '' },
  { label: 'Texte schreiben', value: 'Texte schreiben' },
  { label: 'Recherche', value: 'Recherche' },
  { label: 'Automation', value: 'Automation' },
  { label: 'Coding', value: 'Coding' },
  { label: 'Präsentationen', value: 'Präsentationen' },
]

interface FilterBarProps {
  active: string
  onChange: (filter: string) => void
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide border-b border-[var(--border)] bg-bg">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`
            shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-150 cursor-pointer
            ${active === f.value
              ? 'bg-[var(--accent)] text-bg shadow-[0_0_12px_var(--accent-glow)]'
              : 'bg-[var(--border)] text-text-muted hover:bg-[var(--accent)]/10 hover:text-text border border-[var(--border)]'
            }
          `}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
