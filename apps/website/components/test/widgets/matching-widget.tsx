'use client'

// apps/website/components/test/widgets/matching-widget.tsx
// Phase 24 — W6 MatchingWidget: drag-drop task-tool pairing (desktop) or native <select> (touch).

import { useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { MatchAnswer, MatchQuestion } from '@/lib/assessment/types'
import { useIsTouch } from '@/hooks/use-is-touch'
import type { WidgetProps } from './widget-types'

// ---------------------------------------------------------------------------

function DraggableTool({
  id,
  label,
  used,
  disabled,
}: {
  id: string
  label: string
  used: boolean
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `tool-${id}`,
    disabled,
  })
  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {}
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      disabled={disabled}
      style={style}
      aria-label={`${label} ziehen`}
      className={cn(
        'min-h-[48px] rounded-xl border px-4 py-2 text-sm transition-opacity',
        'bg-[var(--bg-card)] text-[var(--text)]',
        used ? 'opacity-40' : 'opacity-100',
        isDragging
          ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
          : 'border-[var(--border)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {label}
    </button>
  )
}

function DroppableTaskRow({
  taskId,
  taskLabel,
  assignedToolLabel,
  onClear,
  disabled,
}: {
  taskId: string
  taskLabel: string
  assignedToolLabel: string | null
  onClear: () => void
  disabled?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `task-${taskId}`, disabled })
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
      <span className="flex-1 text-sm text-[var(--text)]">{taskLabel}</span>
      <div
        ref={setNodeRef}
        aria-label={`Drop-Zone für ${taskLabel}`}
        className={cn(
          'flex min-h-[48px] min-w-[140px] items-center justify-center rounded-lg border border-dashed px-3 text-sm',
          isOver
            ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
            : 'border-[var(--border)]',
        )}
      >
        {assignedToolLabel ? (
          <div className="flex items-center gap-2">
            <span>{assignedToolLabel}</span>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label="Zuordnung entfernen"
              className="text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)]"
            >
              entfernen
            </button>
          </div>
        ) : (
          <span className="text-[var(--text-muted)]">hierher ziehen</span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function MatchingWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<MatchQuestion, MatchAnswer>) {
  const isTouch = useIsTouch()
  const pairs = answer?.pairs ?? {}

  const updatePair = useCallback(
    (taskId: string, toolId: string | null) => {
      const next = { ...pairs }
      if (toolId === null || toolId === '') {
        delete next[taskId]
      } else {
        next[taskId] = toolId
      }
      onAnswer({ questionId: question.id, type: 'match', pairs: next })
    },
    [onAnswer, pairs, question.id],
  )

  const labelForTool = useCallback(
    (id: string) => question.tools.find((t) => t.id === id)?.label ?? id,
    [question.tools],
  )

  const assignedCount = Object.keys(pairs).length
  const usedToolIds = new Set(Object.values(pairs))

  // Hooks must run unconditionally — sensors are only used in the desktop branch.
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  // ---- Neutral pre-resolve shell (WR-02) -----------------------------------
  // Render a minimal static shell while `isTouch` is still `null` so SSR +
  // first client paint match on touch devices.
  if (isTouch === null) {
    return (
      <div data-widget-type="match" className="mx-auto w-full max-w-2xl space-y-3">
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          0 von {question.tasks.length} Zuordnungen gemacht
        </p>
        <div className="flex flex-col gap-3" aria-hidden>
          {question.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 opacity-60"
            >
              <span className="flex-1 text-sm text-[var(--text)]">{task.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---- Touch branch ---------------------------------------------------------
  if (isTouch) {
    return (
      <div data-widget-type="match" className="mx-auto w-full max-w-2xl space-y-3">
        <p
          className="text-sm text-[var(--text-muted)]"
          aria-live="polite"
        >
          {assignedCount} von {question.tasks.length} Zuordnungen gemacht
        </p>
        <div className="flex flex-col gap-3">
          {question.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3"
            >
              <span className="flex-1 text-sm text-[var(--text)]">{task.label}</span>
              <select
                disabled={disabled}
                className="min-h-[48px] rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text)]"
                value={pairs[task.id] ?? ''}
                onChange={(e) => updatePair(task.id, e.target.value || null)}
                aria-label={`Tool für Aufgabe: ${task.label}`}
              >
                <option value="">— wählen —</option>
                {question.tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---- Desktop branch (drag-drop) ------------------------------------------

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (!activeId.startsWith('tool-') || !overId.startsWith('task-')) return
    const toolId = activeId.slice('tool-'.length)
    const taskId = overId.slice('task-'.length)
    updatePair(taskId, toolId)
  }

  return (
    <div data-widget-type="match" className="mx-auto w-full max-w-2xl space-y-4">
      <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
        {assignedCount} von {question.tasks.length} Zuordnungen gemacht
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-2">
          {question.tools.map((t) => (
            <DraggableTool
              key={t.id}
              id={t.id}
              label={t.label}
              used={usedToolIds.has(t.id)}
              disabled={disabled}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {question.tasks.map((task) => {
            const toolId = pairs[task.id]
            return (
              <DroppableTaskRow
                key={task.id}
                taskId={task.id}
                taskLabel={task.label}
                assignedToolLabel={toolId ? labelForTool(toolId) : null}
                onClear={() => updatePair(task.id, null)}
                disabled={disabled}
              />
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
