---
"tools-app": patch
---

Performance Polish (Phase 11)

- Removed console.logs from production code
- Memoized MarkdownContent with React.memo + useMemo
- Switched audio visualization from Framer Motion to CSS scaleY (GPU-accelerated)
- Memoized ContentCard component
- Added CSS utility classes: animate-dropdown, animate-slide-in, animate-pop-in, animate-fade-in, dropdown-glow
- Added will-change hints for smooth animations
- Lazy-loaded FloatingChat with next/dynamic (smaller initial bundle)
- Added priority prop to above-the-fold images (first 6 cards)
- Added mobile login/logout button to header (no more horizontal scroll needed)
