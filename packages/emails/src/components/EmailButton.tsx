import React from 'react'

export interface EmailButtonProps {
  href: string
  children: React.ReactNode
}

// Implementation in Task 2 — stub
export function EmailButton(_props: EmailButtonProps): React.ReactElement {
  return React.createElement('a', { href: _props.href }, _props.children)
}
