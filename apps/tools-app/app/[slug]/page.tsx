import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getItemBySlug, getPublishedTools } from '@/lib/content'
import Badge from '@/components/ui/Badge'
import ToolLogo from '@/components/ui/ToolLogo'
import MarkdownContent from '@/components/ui/MarkdownContent'
import DetailPageShell from '@/components/detail/DetailPageShell'
import { ToolsFooter } from '@/components/layout/ToolsFooter'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getItemBySlug(slug)
  if (!item) return { title: 'Nicht gefunden | Generation AI' }
  return {
    title: `${item.title} für Studierende | Generation AI`,
    description: item.summary,
  }
}

export async function generateStaticParams() {
  const items = await getPublishedTools()
  return items.map((item) => ({ slug: item.slug }))
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params
  const item = await getItemBySlug(slug)
  if (!item) notFound()

  return (
    <DetailPageShell item={item}>
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-text transition-colors mb-6"
          >
            ← Zurück zur Bibliothek
          </Link>

          {/* Hero */}
          <div className="flex items-start gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
              <ToolLogo slug={item.slug} domain={item.logo_domain} name={item.title} size={64} />
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="type" value={item.type} />
                {item.pricing_model && (
                  <Badge variant="pricing" value={item.pricing_model} />
                )}
              </div>
              <h1 className="text-2xl font-bold text-text tracking-tight leading-tight">{item.title}</h1>
              <p className="text-text-secondary text-sm md:text-[13px] mt-1.5 leading-relaxed">{item.summary}</p>
              {item.external_url && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent)]/80 text-xs mt-2 hover:text-[var(--accent)] transition-colors font-medium tracking-wide"
                >
                  {item.external_url.replace('https://', '')} ↗
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-[var(--border)] text-text-muted border border-[var(--border)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Win Callout */}
          {item.quick_win && (
            <div className="border-l-2 border-[var(--accent)] pl-4 py-2 mb-8 bg-[var(--accent-soft)] rounded-r-lg">
              <p className="text-[10px] uppercase tracking-wider text-[var(--accent)] mb-1 font-medium">Quick Win</p>
              <p className="text-text text-sm md:text-[14px] leading-relaxed">{item.quick_win}</p>
            </div>
          )}

          {/* Content */}
          {item.content && (
            <MarkdownContent content={item.content} />
          )}

          {/* CTA */}
          {item.external_url && (
            <div className="mt-10 pt-8 border-t border-[var(--border)]">
              <a
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold px-6 py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-[opacity,transform] duration-150 text-base w-full sm:w-auto min-h-[48px]"
              >
                {item.title} öffnen ↗
              </a>
            </div>
          )}
        </div>
        <ToolsFooter />
      </div>
    </DetailPageShell>
  )
}
