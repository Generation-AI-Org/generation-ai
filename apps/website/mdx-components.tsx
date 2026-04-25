// Canonical MDX component map (Phase 26 D-19, ergänzt um Phase 24 level-profile usage).
//
// MUSS im Project-Root liegen (apps/website/mdx-components.tsx), NICHT in app/.
// @next/mdx scheitert sonst silent und Pages rendern als raw MDX-String.
// Quelle: https://nextjs.org/docs/app/guides/mdx (file convention, REQUIRED).
//
// Components erhalten Default-DS-Styling, Caller kann via `components`-Param
// (z.B. in einer Page) einzelne Tags überschreiben.
import type { MDXComponents } from "mdx/types"
import type { ComponentPropsWithoutRef } from "react"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p: ComponentPropsWithoutRef<"h1">) => (
      <h1
        className="mb-6 font-mono text-3xl font-bold tracking-tight text-text"
        {...p}
      />
    ),
    h2: (p: ComponentPropsWithoutRef<"h2">) => (
      <h2
        className="mt-10 mb-4 font-mono text-2xl font-bold tracking-tight text-text"
        {...p}
      />
    ),
    h3: (p: ComponentPropsWithoutRef<"h3">) => (
      <h3 className="mt-8 mb-3 font-mono text-lg font-bold text-text" {...p} />
    ),
    p: (p: ComponentPropsWithoutRef<"p">) => (
      <p className="mb-5 text-base leading-[1.7] text-text-secondary" {...p} />
    ),
    a: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover,var(--accent))]"
        {...rest}
      >
        {children}
      </a>
    ),
    ul: (p: ComponentPropsWithoutRef<"ul">) => (
      <ul
        className="mb-5 list-disc space-y-2 pl-6 text-text-secondary"
        {...p}
      />
    ),
    ol: (p: ComponentPropsWithoutRef<"ol">) => (
      <ol
        className="mb-5 list-decimal space-y-2 pl-6 text-text-secondary"
        {...p}
      />
    ),
    li: (p: ComponentPropsWithoutRef<"li">) => (
      <li className="leading-[1.65]" {...p} />
    ),
    strong: (p: ComponentPropsWithoutRef<"strong">) => (
      <strong className="font-semibold text-text" {...p} />
    ),
    em: (p: ComponentPropsWithoutRef<"em">) => <em className="italic" {...p} />,
    blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        className="my-6 border-l-4 border-[var(--accent)] py-1 pl-4 italic text-text"
        {...p}
      />
    ),
    code: (p: ComponentPropsWithoutRef<"code">) => (
      <code
        className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-sm text-text"
        {...p}
      />
    ),
    ...components,
  }
}
