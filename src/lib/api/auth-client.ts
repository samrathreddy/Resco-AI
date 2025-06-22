import { LoginFormData, SignupFormData } from '@/lib/schemas/auth'

// API base URL
const API_BASE = '/api/v1'

// Generic API response type
interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  field?: string
  details?: string
  message?: string
  data?: T
  isRateLimit?: boolean
  retryAfter?: number
}

// User type for API responses
export interface ApiUser {
  id: string
  email: string
  name?: string
  created_at?: string
  updated_at?: string
}

// Session type for API responses
export interface ApiSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

// Login response
export interface LoginResponse extends ApiResponse {
  user?: ApiUser
  session?: ApiSession
}

// Register response
export interface RegisterResponse extends ApiResponse {
  user?: ApiUser
  session?: ApiSession | null
  email_confirmation_required?: boolean
}

// Me response
export interface MeResponse extends ApiResponse {
  user?: ApiUser
  session?: ApiSession
}

// Google auth response
export interface GoogleAuthResponse extends ApiResponse {
  redirectUrl?: string
}

class AuthApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Create a custom error object that preserves rate limit information
        const error = new Error(errorData.error || `HTTP ${response.status}`)
        // Attach additional data to the error for rate limit handling
        if (errorData.isRateLimit) {
          (error as any).isRateLimit = true
          if (errorData.retryAfter) {
            (error as any).retryAfter = errorData.retryAfter
          }
        }
        if (errorData.field) {
          (error as any).field = errorData.field
        }
        
        throw error
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // Login with email and password
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  // Register new user
  async register(userData: SignupFormData): Promise<RegisterResponse> {
    return this.makeRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Logout current user
  async logout(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/logout', {
      method: 'POST',
    })
  }

  // Get current user information
  async getMe(): Promise<MeResponse> {
    return this.makeRequest<MeResponse>('/auth/me', {
      method: 'GET',
    })
  }

  // Initiate Google OAuth
  async googleAuth(): Promise<GoogleAuthResponse> {
    return this.makeRequest<GoogleAuthResponse>('/auth/google', {
      method: 'POST',
    })
  }
}

// Export singleton instance
export const authApi = new AuthApiClient()

// Helper functions for common patterns
export const authHelpers = {
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await authApi.getMe()
      return response.success === true && !!response.user
    } catch {
      return false
    }
  },

  // Get current user or null
  async getCurrentUser(): Promise<ApiUser | null> {
    try {
      const response = await authApi.getMe()
      return response.user || null
    } catch {
      return null
    }
  },

  // Handle API errors and extract user-friendly messages
  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  },

  // Handle field-specific errors
  extractFieldErrors(error: unknown): Record<string, string> {
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message)
        if (parsed.field && parsed.error) {
          return { [parsed.field]: parsed.error }
        }
      } catch {
        // Not JSON, continue
      }
      
      // Check if error has field property directly attached
      if ((error as any).field) {
        return { [(error as any).field]: error.message }
      }
    }
    return {}
  },

  // Extract rate limit information from errors
  extractRateLimitInfo(error: unknown): { isRateLimit: boolean; retryAfter?: number } {
    if (error instanceof Error) {
      const isRateLimit = (error as any).isRateLimit === true
      const retryAfter = (error as any).retryAfter
      
      return {
        isRateLimit,
        retryAfter: typeof retryAfter === 'number' ? retryAfter : undefined
      }
    }
    return { isRateLimit: false }
  }
} 