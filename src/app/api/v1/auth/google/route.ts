import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withCors } from '@/lib/api/cors'

async function googleAuthHandler(request: NextRequest): Promise<NextResponse> {
  if (request.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const supabase = await createClient()
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Google sign-in error:', error)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unable to sign in with Google. Please try again.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (data.url) {
      return new NextResponse(
        JSON.stringify({
          success: true,
          redirectUrl: data.url,
          message: 'Redirecting to Google OAuth...'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Unable to generate OAuth URL' 
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Google OAuth error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Export with CORS wrapper
export const POST = withCors(googleAuthHandler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 })) 