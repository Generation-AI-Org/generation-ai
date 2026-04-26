'use client'

import { X, Link, ExternalLink, FolderPlus } from 'lucide-react'

export interface Attachment {
  id: string
  type: 'url'
  title: string
  url: string
  content: string
  excerpt: string
}

interface AttachmentsPanelProps {
  attachments: Attachment[]
  onRemove: (id: string) => void
  onAddLink: () => void
}

export default function AttachmentsPanel({ attachments, onRemove, onAddLink }: AttachmentsPanelProps) {
  if (attachments.length === 0) {
    return (
      <div className="px-4 py-3 border-b border-[var(--border)]/50">
        <button
          onClick={onAddLink}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--accent)]/50 hover:border-[var(--accent)] transition-all"
        >
          <FolderPlus className="w-5 h-5 text-[var(--accent)]/70" />
          <span className="text-sm text-[var(--text-muted)]">Web-Link hinzufügen</span>
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-b border-[var(--border)]/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Anhänge ({attachments.length})
        </span>
        <button
          onClick={onAddLink}
          className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          <Link className="w-3 h-3" />
          Weiteren Link
        </button>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-[var(--border)]/30 group"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
              <Link className="w-4 h-4 text-[var(--accent)]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">
                {attachment.title}
              </p>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] truncate flex items-center gap-1"
              >
                {new URL(attachment.url).hostname}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <button
              onClick={() => onRemove(attachment.id)}
              className="shrink-0 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 opacity-0 group-hover:opacity-100 transition-all"
              title="Entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
