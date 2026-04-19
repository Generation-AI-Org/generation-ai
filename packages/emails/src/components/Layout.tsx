import React from 'react'

export interface LayoutProps {
  preview: string
  children: React.ReactNode
}

// Implementation in Task 2 — stub
export function Layout(_props: LayoutProps): React.ReactElement {
  return React.createElement('div', null, _props.children)
}
