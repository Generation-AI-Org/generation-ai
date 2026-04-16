import { NextResponse } from 'next/server'
import { createServerClient as createAuthClient } from '@genai/auth'
import { createServerClient } from '@/lib/supabase'

export async function DELETE() {
  try {
    // 1. Get current user via session-based server client
    const supabase = await createAuthClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const userId = user.id

    // 2. Delete user data in correct order (no CASCADE on user_id):
    // - chat_messages first
    // - chat_sessions second
    // - auth user last
    const admin = createServerClient()

    // Delete chat_messages for this user
    const { error: messagesError } = await admin
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)

    if (messagesError) {
      console.error('Failed to delete chat_messages:', messagesError)
      return NextResponse.json(
        { error: 'Fehler beim Loeschen der Nachrichten' },
        { status: 500 }
      )
    }

    // Delete chat_sessions for this user
    const { error: sessionsError } = await admin
      .from('chat_sessions')
      .delete()
      .eq('user_id', userId)

    if (sessionsError) {
      console.error('Failed to delete chat_sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Fehler beim Loeschen der Sessions' },
        { status: 500 }
      )
    }

    // 3. Delete auth user (requires service role client)
    const { error: authError } = await admin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Failed to delete auth user:', authError)
      return NextResponse.json(
        { error: 'Fehler beim Loeschen des Accounts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account delete error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
