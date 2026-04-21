import { headers } from "next/headers";
import { HomeClient } from "@/components/home-client";

// `await headers()` reads the request-time x-nonce header set by proxy.ts and
// forces dynamic rendering — consistent with the Root-Layout `force-dynamic`
// directive that keeps the CSP nonce flow intact (see LEARNINGS.md CSP incident).
export default async function Home() {
  const nonce = (await headers()).get("x-nonce") ?? "";
  return <HomeClient nonce={nonce} />;
}
