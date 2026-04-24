// mdx-components.tsx — Next.js 16 MDX root component map.
// Phase 24 uses MDX for level-profile prose (apps/website/content/assessment/profiles/*.mdx).
// Components map lets us restyle MDX output with our Design-System typography.
import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef } from 'react'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p: ComponentPropsWithoutRef<'h1'>) => (
      <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]" {...p} />
    ),
    h2: (p: ComponentPropsWithoutRef<'h2'>) => (
      <h2 className="mt-6 text-2xl font-bold text-[var(--text)]" {...p} />
    ),
    h3: (p: ComponentPropsWithoutRef<'h3'>) => (
      <h3 className="mt-4 text-xl font-semibold text-[var(--text)]" {...p} />
    ),
    p: (p: ComponentPropsWithoutRef<'p'>) => (
      <p className="mb-4 text-base leading-[1.65] text-[var(--text)]" {...p} />
    ),
    ul: (p: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-[var(--text)]" {...p} />
    ),
    ol: (p: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-[var(--text)]" {...p} />
    ),
    li: (p: ComponentPropsWithoutRef<'li'>) => <li className="leading-[1.65]" {...p} />,
    strong: (p: ComponentPropsWithoutRef<'strong'>) => (
      <strong className="font-semibold text-[var(--text)]" {...p} />
    ),
    em: (p: ComponentPropsWithoutRef<'em'>) => <em className="italic" {...p} />,
    a: (p: ComponentPropsWithoutRef<'a'>) => (
      <a className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)]" {...p} />
    ),
    code: (p: ComponentPropsWithoutRef<'code'>) => (
      <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-sm" {...p} />
    ),
    ...components,
  }
}
