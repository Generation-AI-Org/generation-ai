import type { ContentItemMeta } from '@/lib/types'

function stripWrappingQuotes(value: string) {
  return value.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
}

export function getCardPreview(item: ContentItemMeta) {
  const source = item.quick_win || item.summary
  return stripWrappingQuotes(source)
}
