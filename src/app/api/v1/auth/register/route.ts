import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/schemas/auth'
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
      message: `Too many signup attempts. Please wait ${timeMessage} before trying again.`
    }
  }
  
  // Check for other rate limit patterns
  if (errorMessage.toLowerCase().includes('rate limit') || 
      errorMessage.toLowerCase().includes('too many requests') ||
      errorMessage.toLowerCase().includes('security purposes')) {
    return {
      isRateLimit: true,
      message: 'Too many signup attempts. Please wait a moment before trying again.'
    }
  }
  
  return { isRateLimit: false, message: errorMessage }
}

async function registerHandler(request: NextRequest): Promise<NextResponse> {
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
    const validatedData = signupSchema.parse(body)
    
    const supabase = await createClient()
    
    // Check if user already exists (but handle potential rate limits here too)
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validatedData.email)
        .single()
      
      if (existingUser) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'An account with this email already exists',
            field: 'email'
          }),
          { 
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    } catch (profileError) {
      // If profiles table doesn't exist or other errors, continue with signup
      console.log('Profile check skipped:', profileError)
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
      },
    })

    if (error) {
      console.error('Signup error:', error.message)
      
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
      
      // Handle specific Supabase errors
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'This email is already registered',
            field: 'email'
          }),
          { 
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (error.message.includes('invalid email')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Please enter a valid email address',
            field: 'email'
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (error.message.includes('password')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Password does not meet requirements',
            field: 'password'
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unable to create account. Please try again.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Create profile record (this should be handled by the database trigger)
    if (data.user && !data.user.email_confirmed_at) {
      // If email confirmation is required, inform the user
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: 'Please check your email to verify your account.',
          user: {
            id: data.user.id,
            email: data.user.email,
            name: validatedData.name,
          },
          email_confirmation_required: true
        }),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success response with user data
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Account created successfully!',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: validatedData.name,
        },
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        } : null
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Register validation error:', error)
    
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
export const POST = withCors(registerHandler)
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 })) 