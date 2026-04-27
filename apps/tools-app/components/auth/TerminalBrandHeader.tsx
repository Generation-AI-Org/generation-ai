import Image from 'next/image'
import Link from 'next/link'

interface TerminalBrandHeaderProps {
  href?: string
}

export function TerminalBrandHeader({ href = '/' }: TerminalBrandHeaderProps) {
  return (
    <Link
      href={href}
      className="mx-auto mb-8 block w-full max-w-[320px] transition-opacity duration-150 hover:opacity-90"
      aria-label="Generation AI"
    >
      <Image
        src="/brand/logos/terminal-header.png"
        alt="Generation AI"
        width={1120}
        height={700}
        priority
        sizes="320px"
        className="h-auto w-full rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      />
    </Link>
  )
}
