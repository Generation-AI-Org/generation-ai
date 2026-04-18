// Minimal fire-and-forget analytics helper. Tries known sinks in order:
// Vercel Analytics (window.va), then Sentry breadcrumbs (window.Sentry).
// Falls back to a no-op so callers can always invoke trackEvent without guards.

type EventPayloads = {
  chat_opened_from_route: {
    route: string
    context_slug?: string
    mode: 'public' | 'member'
  }
}

export function trackEvent<K extends keyof EventPayloads>(
  event: K,
  payload: EventPayloads[K],
): void {
  if (typeof window === 'undefined') return

  try {
    const w = window as unknown as {
      va?: { track?: (name: string, data: Record<string, unknown>) => void }
      Sentry?: {
        addBreadcrumb?: (b: {
          category: string
          message: string
          data: Record<string, unknown>
          level?: string
        }) => void
      }
    }

    w.va?.track?.(event, payload as Record<string, unknown>)
    w.Sentry?.addBreadcrumb?.({
      category: 'analytics',
      message: event,
      data: payload as Record<string, unknown>,
      level: 'info',
    })
  } catch {
    // never throw from analytics
  }
}
