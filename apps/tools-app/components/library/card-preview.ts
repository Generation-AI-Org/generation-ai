import type { ContentItemMeta } from '@/lib/types'

function stripWrappingQuotes(value: string) {
  return value.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
}

export function getCardPreview(item: ContentItemMeta) {
  return stripWrappingQuotes(item.summary)
}
