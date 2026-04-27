'use client'

const FILTERS = [
  { label: 'Alle', value: '' },
  { label: 'KI-Assistenten', value: 'KI-Assistenten' },
  { label: 'Schreiben & Chat', value: 'Schreiben & Chat' },
  { label: 'Recherche', value: 'Recherche' },
  { label: 'Coding', value: 'Coding' },
  { label: 'Bilder & Design', value: 'Bilder & Design' },
  { label: 'Audio & Transkription', value: 'Audio & Transkription' },
  { label: 'Automation', value: 'Automation' },
  { label: 'Produktivität', value: 'Produktivität' },
]

interface FilterBarProps {
  active: string
  onChange: (filter: string) => void
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="mx-auto mt-6 flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 pr-24 scrollbar-hide sm:px-6 sm:pr-24 md:gap-1.5 lg:px-8 lg:pr-24 xl:pr-8">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`
            shrink-0 px-4 md:px-3 py-2.5 md:py-1.5 min-h-[44px] md:min-h-0 rounded-full text-sm md:text-xs font-medium transition-[background-color,box-shadow,color,border-color,transform] duration-150 cursor-pointer active:scale-95
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
