'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Clock } from 'lucide-react'
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from '@/lib/schemas/auth'
import { authEvents } from '@/lib/analytics/posthog'
import { authApi, authHelpers } from '@/lib/api/auth-client'
import { z } from 'zod'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isRateLimit: boolean
    retryAfter?: number
    countdownSeconds?: number
  }>({ isRateLimit: false })
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Countdown timer for rate limits
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (rateLimitInfo.isRateLimit && typeof rateLimitInfo.countdownSeconds === 'number' && rateLimitInfo.countdownSeconds > 0) {
      interval = setInterval(() => {
        setRateLimitInfo(prev => {
          const newCountdown = (prev.countdownSeconds || 0) - 1
          if (newCountdown <= 0) {
            return { isRateLimit: false }
          }
          return { ...prev, countdownSeconds: newCountdown }
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [rateLimitInfo.isRateLimit, rateLimitInfo.countdownSeconds])

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field-specific error when user types
    setErrors(prev => ({ ...prev, [name]: '' }))
    setGeneralError(null)
    // Clear rate limit if user starts typing
    if (rateLimitInfo.isRateLimit) {
      setRateLimitInfo({ isRateLimit: false })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Don't submit if rate limited
    if (rateLimitInfo.isRateLimit && typeof rateLimitInfo.countdownSeconds === 'number' && rateLimitInfo.countdownSeconds > 0) {
      return
    }
    
    setIsLoading(true)
    setErrors({})
    setGeneralError(null)
    setRateLimitInfo({ isRateLimit: false })

    try {
      if (mode === 'signup') {
        authEvents.signupStarted()
        
        // Validate form data
        const validatedData = signupSchema.parse(formData)
        
        const result = await authApi.register(validatedData)
        
        if (!result.success || result.error) {
          authEvents.signupFailed(result.error || 'Registration failed')
          if (result.field) {
            setErrors({ [result.field]: result.error || 'Registration failed' })
          } else {
            setGeneralError(result.error || 'Registration failed')
          }
        } else {
          authEvents.signupCompleted('email')
          if (result.email_confirmation_required) {
            setGeneralError(result.message || 'Please check your email to verify your account.')
          } else {
            router.push('/app')
          }
        }
      } else {
        authEvents.loginStarted()
        
        // Validate form data
        const validatedData = loginSchema.parse({
          email: formData.email,
          password: formData.password,
        })
        
        const result = await authApi.login(validatedData)
        
        if (!result.success || result.error) {
          authEvents.loginFailed(result.error || 'Login failed')
          if (result.field) {
            setErrors({ [result.field]: result.error || 'Login failed' })
          } else {
            setGeneralError(result.error || 'Login failed')
          }
        } else {
          authEvents.loginCompleted('email')
          router.push('/app')
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        // Check for rate limit information
        const rateLimitData = authHelpers.extractRateLimitInfo(error)
        if (rateLimitData.isRateLimit) {
          setRateLimitInfo({
            isRateLimit: true,
            retryAfter: rateLimitData.retryAfter,
            countdownSeconds: rateLimitData.retryAfter
          })
        }
        
        const errorMessage = authHelpers.extractErrorMessage(error)
        const fieldErrors = authHelpers.extractFieldErrors(error)
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
        } else {
          setGeneralError(errorMessage)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setGeneralError(null)
    setRateLimitInfo({ isRateLimit: false })
    
    try {
      if (mode === 'signup') {
        authEvents.signupStarted()
      } else {
        authEvents.loginStarted()
      }
      
      const result = await authApi.googleAuth()
      
      if (!result.success || result.error) {
        const eventMethod = mode === 'signup' ? authEvents.signupFailed : authEvents.loginFailed
        eventMethod(result.error || 'Google auth failed')
        setGeneralError(result.error || 'Unable to sign in with Google')
      } else if (result.redirectUrl) {
        // Redirect to Google OAuth
        window.location.href = result.redirectUrl
      }
    } catch (error) {
      // Check for rate limit information
      const rateLimitData = authHelpers.extractRateLimitInfo(error)
      if (rateLimitData.isRateLimit) {
        setRateLimitInfo({
          isRateLimit: true,
          retryAfter: rateLimitData.retryAfter,
          countdownSeconds: rateLimitData.retryAfter
        })
      }
      
      const errorMessage = authHelpers.extractErrorMessage(error)
      setGeneralError(errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#2A2A2A] backdrop-blur-md">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-white">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </CardTitle>
        <CardDescription className="text-[#B7B7B7]">
          {mode === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Enter your details to get started with Resco'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 px-6">
        {/* Rate limit error with countdown */}
        {rateLimitInfo.isRateLimit && typeof rateLimitInfo.countdownSeconds === 'number' && rateLimitInfo.countdownSeconds > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-orange-500/10 border border-orange-500/20 p-3 text-sm text-orange-400">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Too many attempts</span>
              <span className="text-xs">
                Please wait {formatTimeRemaining(rateLimitInfo.countdownSeconds)} before trying again
              </span>
            </div>
          </div>
        )}
        
        {/* General error */}
        {generalError && !rateLimitInfo.isRateLimit && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}
        
        <style jsx global>{`
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s !important;
            box-shadow: inset 0 0 20px 20px rgba(0, 0, 0, 0.5) !important;
          }
        `}</style>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-black/50 border-[#2A2A2A] text-white placeholder:text-[#B7B7B7] focus:border-indigo-500 focus:ring-indigo-500/20 h-10 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-black/50 border-[#2A2A2A] text-white placeholder:text-[#B7B7B7] focus:border-indigo-500 focus:ring-indigo-500/20 h-10 pr-10 ${errors.email ? 'border-red-500' : ''}`}
              />
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B7B7B7]" />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-black/50 border-[#2A2A2A] text-white placeholder:text-[#B7B7B7] focus:border-indigo-500 focus:ring-indigo-500/20 h-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B7B7B7] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
            {mode === 'signup' && (
              <p className="text-xs text-[#B7B7B7]">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}
          </div>
          
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`bg-black/50 border-[#2A2A2A] text-white placeholder:text-[#B7B7B7] focus:border-indigo-500 focus:ring-indigo-500/20 h-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B7B7B7] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          )}
          
          <div className="pt-2">
            <Button
              type="submit"
                              className={`w-full font-bold h-11 text-base shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                rateLimitInfo.isRateLimit && typeof rateLimitInfo.countdownSeconds === 'number' && rateLimitInfo.countdownSeconds > 0
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
              }`}
              disabled={isLoading || isGoogleLoading || (rateLimitInfo.isRateLimit && typeof rateLimitInfo.countdownSeconds === 'number' && rateLimitInfo.countdownSeconds > 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : rateLimitInfo.isRateLimit && typeof rateLimitInfo.countdownSeconds === 'number' && rateLimitInfo.countdownSeconds > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Wait {formatTimeRemaining(rateLimitInfo.countdownSeconds)}
                </>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </Button>
          </div>
        </form>
        
        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-[#2A2A2A]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] px-2 text-[#B7B7B7]">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full bg-black/30 border-[#2A2A2A] text-white hover:bg-black/50 hover:text-white h-12"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {isGoogleLoading ? 'Connecting...' : 'Google'}
        </Button>*/}
      </CardContent> 
      
      <CardFooter className="flex flex-col space-y-2 pt-2 pb-4">
        <div className="text-sm text-center text-[#B7B7B7]">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <a href="/auth/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </a>
            </>
          )}
        </div>
        
        {mode === 'login' && (
          <a href="/auth/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot your password?
          </a>
        )}
        
        <p className="text-xs text-center text-[#B7B7B7] px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardFooter>
    </Card>
  )
} 