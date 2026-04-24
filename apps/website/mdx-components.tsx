// Phase 26: Canonical MDX component map (D-19) — kein @tailwindcss/typography.
//
// MUSS im Project-Root liegen (apps/website/mdx-components.tsx), NICHT in app/.
// @next/mdx scheitert sonst silent und Pages rendern als raw MDX-String.
// Quelle: https://nextjs.org/docs/app/guides/mdx (file convention, REQUIRED).
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-mono text-3xl font-bold tracking-tight text-text mb-6">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-mono text-2xl font-bold tracking-tight text-text mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-mono text-lg font-bold text-text mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base leading-[1.7] text-text-secondary mb-5">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover,var(--accent))]"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-5 text-text-secondary space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-5 text-text-secondary space-y-2">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--accent)] pl-4 py-1 my-6 text-text italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-sm text-text">
      {children}
    </code>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
