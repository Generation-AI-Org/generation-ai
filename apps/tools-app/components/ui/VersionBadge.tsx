'use client'

export function VersionBadge() {
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  const shortSha = commitSha?.slice(0, 7) || 'dev'

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-50 hover:opacity-100 transition-opacity">
        {shortSha}
      </span>
    </div>
  )
}
