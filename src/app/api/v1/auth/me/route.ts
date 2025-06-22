import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withCors } from '@/lib/api/cors'

async function getMeHandler(request: NextRequest): Promise<NextResponse> {
  if (request.method !== 'GET') {
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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User error:', userError)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unable to retrieve user' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Not authenticated' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Get profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Profile error:', profileError)
      // If profile doesn't exist, still return user data from auth
    }
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: profile?.name || user.user_metadata?.name,
          created_at: profile?.created_at || user.created_at,
          updated_at: profile?.updated_at,
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Get user error:', error)
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
export const GET = withCors(getMeHandler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 })) 