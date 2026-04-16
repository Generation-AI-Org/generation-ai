// Thin shim over the shared @genai/auth package.
// Kept as a stable import path for code that used to live in this app.
export { createBrowserClient as createClient } from '@genai/auth'
