import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withCors } from '@/lib/api/cors'

async function logoutHandler(request: NextRequest): Promise<NextResponse> {
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
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unable to sign out. Please try again.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Successfully signed out'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Logout error:', error)
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
export const POST = withCors(logoutHandler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 })) 