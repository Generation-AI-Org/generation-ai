// lib/sanitize.ts
// Simple HTML escaping for XSS prevention
// No external dependencies - works everywhere
// Source: CONTEXT.md D-07, D-10

/**
 * Escape HTML special characters to prevent XSS.
 * For chat messages, we don't need to allow any HTML - just escape everything.
 *
 * @param input - Raw user input string
 * @returns HTML-escaped string safe for storage and display
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
