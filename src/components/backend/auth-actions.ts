'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from '@/lib/schemas/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Generic error response type
type AuthError = {
  error: string
  field?: string
  isRateLimit?: boolean
  retryAfter?: number
}

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
      message: `Too many attempts. Please wait ${timeMessage} before trying again.`
    }
  }
  
  // Check for other rate limit patterns
  if (errorMessage.toLowerCase().includes('rate limit') || 
      errorMessage.toLowerCase().includes('too many requests') ||
      errorMessage.toLowerCase().includes('security purposes')) {
    return {
      isRateLimit: true,
      message: 'Too many attempts. Please wait a moment before trying again.'
    }
  }
  
  return { isRateLimit: false, message: errorMessage }
}

export async function login(formData: LoginFormData): Promise<{ error?: AuthError }> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(formData)
    
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      console.error('Login error:', error.message)
      
      // Parse rate limit errors first
      const rateLimitInfo = parseRateLimitError(error.message)
      if (rateLimitInfo.isRateLimit) {
        return { 
          error: { 
            error: rateLimitInfo.message,
            isRateLimit: true,
            retryAfter: rateLimitInfo.retryAfter
          } 
        }
      }
      
      // Handle other specific errors
      if (error.message.includes('Invalid login credentials')) {
        return { error: { error: 'Invalid email or password' } }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { error: { error: 'Please check your email and click the confirmation link before signing in.' } }
      }
      
      return { error: { error: 'Unable to sign in. Please try again.' } }
    }

    return {}
  } catch (error) {
    console.error('Login validation error:', error)
    if (error instanceof Error) {
      return { error: { error: 'Invalid input. Please check your details.' } }
    }
    return { error: { error: 'An unexpected error occurred' } }
  }
}

export async function signup(formData: SignupFormData): Promise<{ error?: AuthError }> {
  try {
    // Validate input
    const validatedData = signupSchema.parse(formData)
    
    const supabase = await createClient()
    
    // Check if user already exists (but handle potential rate limits here too)
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validatedData.email)
        .single()
      
      if (existingUser) {
        return { error: { error: 'An account with this email already exists', field: 'email' } }
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
        return { 
          error: { 
            error: rateLimitInfo.message,
            isRateLimit: true,
            retryAfter: rateLimitInfo.retryAfter
          } 
        }
      }
      
      // Handle specific Supabase errors
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { error: { error: 'This email is already registered', field: 'email' } }
      }
      
      if (error.message.includes('invalid email')) {
        return { error: { error: 'Please enter a valid email address', field: 'email' } }
      }
      
      if (error.message.includes('password')) {
        return { error: { error: 'Password does not meet requirements', field: 'password' } }
      }
      
      return { error: { error: 'Unable to create account. Please try again.' } }
    }
    
    // Create profile record if user was created successfully
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: validatedData.email,
            name: validatedData.name,
            created_at: new Date().toISOString(),
          })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't fail the whole signup if profile creation fails
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the whole signup if profile creation fails
      }
    }

    return {}
  } catch (error) {
    console.error('Signup validation error:', error)
    if (error instanceof Error) {
      return { error: { error: 'Invalid input. Please check your details.' } }
    }
    return { error: { error: 'An unexpected error occurred' } }
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || ''
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Google sign-in error:', error)
      
      // Parse rate limit errors for OAuth too
      const rateLimitInfo = parseRateLimitError(error.message)
      if (rateLimitInfo.isRateLimit) {
        return { 
          error: { 
            error: rateLimitInfo.message,
            isRateLimit: true,
            retryAfter: rateLimitInfo.retryAfter
          } 
        }
      }
      
      return { error: { error: 'Unable to sign in with Google' } }
    }

    if (data.url) {
      redirect(data.url)
    }
    
    return {}
  } catch (error) {
    console.error('Google OAuth error:', error)
    return { error: { error: 'An unexpected error occurred' } }
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return { error: { error: 'Unable to sign out' } }
    }
    
    redirect('/')
  } catch (error) {
    console.error('Logout error:', error)
    return { error: { error: 'An unexpected error occurred' } }
  }
}

export async function getSession() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // Return a session-like object for compatibility
  return {
    user,
    access_token: null, // Not available from getUser()
    refresh_token: null, // Not available from getUser()
    expires_at: null, // Not available from getUser()
  }
} 