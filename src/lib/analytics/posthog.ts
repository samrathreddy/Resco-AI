import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // Disable automatic pageview capture, we'll do it manually
      persistence: 'localStorage',
    })
  }
}

export const PostHogProvider = PHProvider

// Analytics event helpers
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties)
  }
}

// Authentication specific events
export const authEvents = {
  signupStarted: () => trackEvent('signup_started'),
  signupCompleted: (method: 'email' | 'google') => 
    trackEvent('signup_completed', { method }),
  signupFailed: (error: string) => 
    trackEvent('signup_failed', { error }),
  
  loginStarted: () => trackEvent('login_started'),
  loginCompleted: (method: 'email' | 'google') => 
    trackEvent('login_completed', { method }),
  loginFailed: (error: string) => 
    trackEvent('login_failed', { error }),
  
  logout: () => trackEvent('user_logout'),
  
  passwordResetRequested: () => trackEvent('password_reset_requested'),
  passwordResetCompleted: () => trackEvent('password_reset_completed'),
}

// Page view tracking
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      $host: window.location.host,
      $pathname: window.location.pathname,
      page_name: pageName,
      ...properties,
    })
  }
} 