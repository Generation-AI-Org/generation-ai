import { createClient as createServerClient } from '@genai/auth/server'

export async function getUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}
