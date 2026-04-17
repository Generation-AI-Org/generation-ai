import { updateSession } from "@genai/auth/middleware"
import { type NextRequest } from "next/server"
import { buildCspDirectives } from "./lib/csp"

export async function proxy(request: NextRequest) {
  // Phase-12 Pattern: Session-Refresh zuerst; response trägt Auth-Cookies.
  // Phase-13: CSP-Header wird auf DIESE Response gesetzt (Pitfall 1 aus RESEARCH: keine neue Response!).
  const response = await updateSession(request)

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV === "development"
  const csp = buildCspDirectives(nonce, isDev)

  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("x-nonce", nonce)

  return response
}

export const config = {
  matcher: [
    // api-routes + static assets ausschließen.
    // Next.js 16 CSP Pattern: prefetches nicht matchen (Cache-Konsistenz bei Nonce).
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
