import { updateSession } from "@genai/auth/middleware"
import { type NextRequest } from "next/server"
import { buildCspDirectives } from "./lib/csp"

export async function proxy(request: NextRequest) {
  // Nonce + CSP müssen auf den REQUEST-Headers liegen, BEVOR gerendert wird.
  // Next.js liest CSP vom Request-Header, extrahiert den Nonce und hängt ihn
  // automatisch an Framework- + Page-Script-Tags. Ohne das: keine nonce-Attribute
  // im HTML → strict-dynamic blockt alle Chunks → schwarze Seite.
  // updateSession() ruft intern NextResponse.next({ request }) — die mutierten
  // Request-Headers werden dabei durchgereicht (Phase-13 Pitfall 1: keine neue Response!).
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV === "development"
  const csp = buildCspDirectives(nonce, isDev)

  request.headers.set("x-nonce", nonce)
  request.headers.set("Content-Security-Policy", csp)

  const response = await updateSession(request)

  response.headers.set("Content-Security-Policy", csp)

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
