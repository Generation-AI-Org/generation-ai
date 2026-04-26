'use client'

// apps/website/components/test/widgets/drag-rank-widget.tsx
// Phase 24 — W2 DragRankWidget: sortable list via @dnd-kit, Levenshtein-scored.
// Mobile fallback: tap-to-select then tap-to-place.

import { useCallback, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RankAnswer, RankQuestion } from '@/lib/assessment/types'
import { useIsTouch } from '@/hooks/use-is-touch'
import type { WidgetProps } from './widget-types'

// ---------------------------------------------------------------------------

interface SortableItemProps {
  id: string
  label: string
  index: number
  disabled?: boolean
}

function SortableItem({ id, label, index, disabled }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      role="option"
      aria-selected={isDragging}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-[var(--bg-card)] p-3',
        isDragging
          ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
          : 'border-[var(--border)]',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`Drag ${label}`}
        className={cn(
          'flex min-h-[48px] min-w-[48px] items-center justify-center rounded',
          'hover:bg-[var(--bg-elevated)]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        <GripVertical className="h-5 w-5 text-[var(--text-muted)]" aria-hidden />
      </button>
      <span className="flex-1 text-sm text-[var(--text)]">{label}</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] font-mono text-sm">
        {index + 1}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------

interface TapFallbackListProps {
  order: string[]
  labelFor: (id: string) => string
  selectedId: string | null
  onToggle: (id: string) => void
  onPlace: (targetIndex: number) => void
  disabled?: boolean
}

function TapFallbackList({
  order,
  labelFor,
  selectedId,
  onToggle,
  onPlace,
  disabled,
}: TapFallbackListProps) {
  return (
    <ol className="flex flex-col gap-2">
      {order.map((id, index) => {
        const isSelected = selectedId === id
        return (
          <li key={id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => (selectedId && selectedId !== id ? onPlace(index) : onToggle(id))}
              aria-pressed={isSelected}
              aria-label={
                isSelected
                  ? `Ausgewählt: ${labelFor(id)} — tippe eine andere Position zum Platzieren`
                  : selectedId
                    ? `Tippen um ${labelFor(selectedId)} hier einzusetzen`
                    : `${labelFor(id)} auswählen zum Verschieben`
              }
              className={cn(
                'flex min-h-[48px] flex-1 items-center gap-3 rounded-xl border p-3 text-left',
                isSelected
                  ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] font-mono text-sm">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-[var(--text)]">{labelFor(id)}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------

export function DragRankWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<RankQuestion, RankAnswer>) {
  const isTouch = useIsTouch()
  const [order, setOrder] = useState<string[]>(
    answer?.order ?? question.items.map((i) => i.id),
  )
  const [tapSelection, setTapSelection] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<boolean>(answer?.confirmed ?? false)

  const labelFor = useCallback(
    (id: string) => question.items.find((i) => i.id === id)?.label ?? id,
    [question.items],
  )

  const commit = useCallback(
    (next: string[]) => {
      setOrder(next)
      // Reset confirmed when order changes — user must re-confirm after each reorder.
      setConfirmed(false)
      onAnswer({ questionId: question.id, type: 'rank', order: next, confirmed: false })
    },
    [onAnswer, question.id],
  )

  const handleConfirm = useCallback(() => {
    setConfirmed(true)
    onAnswer({ questionId: question.id, type: 'rank', order, confirmed: true })
  }, [onAnswer, question.id, order])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = order.indexOf(String(active.id))
      const newIndex = order.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return
      commit(arrayMove(order, oldIndex, newIndex))
    },
    [commit, order],
  )

  const handleTapToggle = useCallback((id: string) => {
    setTapSelection((prev) => (prev === id ? null : id))
  }, [])

  const handleTapPlace = useCallback(
    (targetIndex: number) => {
      if (!tapSelection) return
      const oldIndex = order.indexOf(tapSelection)
      if (oldIndex < 0) return
      commit(arrayMove(order, oldIndex, targetIndex))
      setTapSelection(null)
    },
    [commit, order, tapSelection],
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Element ${labelFor(String(active.id))} aufgenommen`
    },
    onDragOver({ active, over }) {
      if (!over) return ''
      return `Element ${labelFor(String(active.id))} über Position ${
        order.indexOf(String(over.id)) + 1
      }`
    },
    onDragEnd({ active, over }) {
      if (!over) return 'Abgebrochen'
      return `Element ${labelFor(String(active.id))} auf Position ${
        order.indexOf(String(over.id)) + 1
      } abgelegt`
    },
    onDragCancel({ active }) {
      return `Element ${labelFor(String(active.id))} — Drag abgebrochen`
    },
  }

  // WR-02: while `isTouch` is still `null` (not yet resolved on the client),
  // render a neutral skeleton list so SSR + first paint match on touch devices.
  if (isTouch === null) {
    return (
      <div data-widget-type="rank" className="mx-auto w-full max-w-2xl space-y-3">
        <ol className="flex flex-col gap-2" aria-hidden>
          {order.map((id, index) => (
            <li
              key={id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 opacity-60"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] font-mono text-sm">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-[var(--text)]">{labelFor(id)}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div data-widget-type="rank" className="mx-auto w-full max-w-2xl space-y-3">
      {isTouch ? (
        <>
          <p className="text-sm text-[var(--text-muted)]">
            Tippe zum Auswählen, dann Zielposition.
          </p>
          <TapFallbackList
            order={order}
            labelFor={labelFor}
            selectedId={tapSelection}
            onToggle={handleTapToggle}
            onPlace={handleTapPlace}
            disabled={disabled}
          />
        </>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements }}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <ol role="listbox" aria-label={question.prompt} className="flex flex-col gap-2">
              {order.map((id, index) => (
                <SortableItem
                  key={id}
                  id={id}
                  label={labelFor(id)}
                  index={index}
                  disabled={disabled}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      {/* Confirm step — explicit confirmation gates Nächste Aufgabe, including when the initial order is already the user's intended order. */}
      {!confirmed && !disabled && (
        <button
          type="button"
          onClick={handleConfirm}
          className={cn(
            'mt-2 w-full rounded-xl border border-[var(--border-accent)] bg-[var(--accent-soft)]',
            'px-4 py-3 text-sm font-mono font-bold tracking-[0.02em] text-[var(--text)]',
            'hover:bg-[var(--bg-elevated)]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
            'min-h-[48px]',
          )}
        >
          Reihenfolge bestätigen
        </button>
      )}
      {confirmed && !disabled && (
        <p className="text-center text-sm text-[var(--text-muted)]" aria-live="polite">
          Reihenfolge bestätigt ✓
        </p>
      )}
      <details className="text-xs text-[var(--text-muted)]">
        <summary className="cursor-pointer">Tastatur-Bedienung</summary>
        <p className="mt-1">
          Tab zur Karte, Leertaste zum Aufnehmen, Pfeiltasten zum Verschieben, Leertaste zum
          Ablegen, Escape zum Abbrechen.
        </p>
      </details>
    </div>
  )
}
