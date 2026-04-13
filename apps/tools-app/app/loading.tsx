import SkeletonCard from '@/components/ui/SkeletonCard'

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      {/* Header Skeleton */}
      <header className="flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-header)]">
        <div className="h-9 md:h-11 w-32 bg-white/20 rounded animate-pulse" />
        <div className="w-px h-6 md:h-7 bg-white/20 hidden md:block" />
        <div className="h-4 w-20 bg-white/20 rounded hidden md:block animate-pulse" />
      </header>

      {/* Filter Skeleton */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-[var(--border)] bg-bg">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-[var(--border)] animate-pulse" />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>

        {/* Chat Panel Skeleton */}
        <div className="hidden md:flex w-[35%] shrink-0 border-l border-[var(--border)] flex-col bg-chat-bg">
          <div className="px-4 py-3 border-b border-[var(--accent)]/20 flex items-center gap-3 bg-[var(--accent)]/5">
            <div className="w-9 h-9 rounded-xl bg-[var(--border)] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-[var(--border)] rounded animate-pulse" />
              <div className="h-3 w-40 bg-[var(--border)] rounded animate-pulse" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
