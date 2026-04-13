import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendMagicLinkEmail } from '@/lib/email'

const CIRCLE_API_TOKEN = process.env.CIRCLE_API_TOKEN!
const CIRCLE_COMMUNITY_URL = process.env.CIRCLE_COMMUNITY_URL!

interface SignupRequest {
  email: string
  name: string
  university: string
  studyField: string
  kiLevel: number
  interests: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    const { email, name, university, studyField, kiLevel, interests } = body

    // Validate required fields
    if (!email || !name || !university || !studyField || !kiLevel) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt sein.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige Email-Adresse ein.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Create Supabase user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        full_name: name,
      },
    })

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Diese Email ist bereits registriert. Check deine Emails für den Login-Link.' },
          { status: 409 }
        )
      }
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'Fehler bei der Registrierung. Bitte versuche es später erneut.' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // 1b. Generate magic link and send via Resend
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'https://generation-ai.org',
      },
    })

    if (linkError) {
      console.error('Magic link generation error:', linkError)
    } else if (linkData?.properties?.action_link) {
      try {
        await sendMagicLinkEmail({
          email,
          name,
          magicLink: linkData.properties.action_link,
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // Don't fail signup, user was created - they can request a new link
      }
    }

    // 2. Create profile in Supabase
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: name,
      university,
      study_field: studyField,
      ki_level: kiLevel,
      interests,
      questionnaire_answers: {
        university,
        studyField,
        kiLevel,
        interests,
        submittedAt: new Date().toISOString(),
      },
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the whole signup if profile creation fails
      // The user can still join Circle
    }

    // 3. Create Circle member
    let circleMemberId: number | null = null
    try {
      const circleResponse = await fetch(
        `${CIRCLE_COMMUNITY_URL}/api/admin/v2/community_members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${CIRCLE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            skip_invitation: false, // Circle will send magic link
            community_member_profile_fields: {
              headline: `${studyField} @ ${university}`,
            },
          }),
        }
      )

      if (circleResponse.ok) {
        const circleData = await circleResponse.json()
        circleMemberId = circleData.community_member?.id || null

        // Update profile with Circle member ID
        if (circleMemberId) {
          await supabase
            .from('profiles')
            .update({ circle_member_id: circleMemberId })
            .eq('id', userId)
        }
      } else {
        const errorData = await circleResponse.json()
        console.error('Circle API error:', errorData)
        // Don't fail signup if Circle fails - user can still be added manually
      }
    } catch (circleError) {
      console.error('Circle API request failed:', circleError)
      // Don't fail signup if Circle fails
    }

    return NextResponse.json({
      success: true,
      message: 'Willkommen! Check deine Emails für den Magic Link.',
      userId,
      circleMemberId,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
