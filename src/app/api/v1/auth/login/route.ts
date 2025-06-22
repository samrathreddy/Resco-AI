import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/schemas/auth'
import { withCors } from '@/lib/api/cors'

// Helper function to parse rate limit errors
function parseRateLimitError(errorMessage: string): { isRateLimit: boolean; retryAfter?: number; message: string } {
  // Match patterns like "For security purposes, you can only request this after 26 seconds."
  const rateLimitMatch = errorMessage.match(/you can only request this after (\d+) seconds?/i)
  
  if (rateLimitMatch) {
    const seconds = parseInt(rateLimitMatch[1], 10)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    let timeMessage = ''
    if (minutes > 0) {
      timeMessage = `${minutes} minute${minutes > 1 ? 's' : ''}`
      if (remainingSeconds > 0) {
        timeMessage += ` and ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`
      }
    } else {
      timeMessage = `${seconds} second${seconds > 1 ? 's' : ''}`
    }
    
    return {
      isRateLimit: true,
      retryAfter: seconds,
      message: `Too many login attempts. Please wait ${timeMessage} before trying again.`
    }
  }
  
  // Check for other rate limit patterns
  if (errorMessage.toLowerCase().includes('rate limit') || 
      errorMessage.toLowerCase().includes('too many requests') ||
      errorMessage.toLowerCase().includes('security purposes')) {
    return {
      isRateLimit: true,
      message: 'Too many login attempts. Please wait a moment before trying again.'
    }
  }
  
  return { isRateLimit: false, message: errorMessage }
}

async function loginHandler(request: NextRequest): Promise<NextResponse> {
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
    const body = await request.json()
    
    // Validate input with Zod
    const validatedData = loginSchema.parse(body)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      console.error('Login error:', error.message)
      
      // Parse rate limit errors first
      const rateLimitInfo = parseRateLimitError(error.message)
      if (rateLimitInfo.isRateLimit) {
        return new NextResponse(
          JSON.stringify({ 
            error: rateLimitInfo.message,
            isRateLimit: true,
            retryAfter: rateLimitInfo.retryAfter
          }),
          { 
            status: 429, // Too Many Requests
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Handle other specific errors
      if (error.message.includes('Invalid login credentials')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid email or password',
            field: 'credentials'
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (error.message.includes('Email not confirmed')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Please check your email and click the confirmation link before signing in.'
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unable to sign in. Please try again.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success response with user data
    return new NextResponse(
      JSON.stringify({
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name,
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Login validation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid input. Please check your details.',
          details: error.message
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
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
export const POST = withCors(loginHandler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 })) 