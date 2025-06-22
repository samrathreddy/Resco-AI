'use client'

import { useEffect } from 'react'
import { initPostHog, PostHogProvider } from '@/lib/analytics/posthog'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics/posthog'
import posthog from 'posthog-js'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize PostHog
  useEffect(() => {
    initPostHog()
  }, [])

  // Track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      // Get page name from pathname
      let pageName = 'Unknown Page'
      
      if (pathname === '/') {
        pageName = 'Home'
      } else if (pathname === '/app') {
        pageName = 'App Dashboard'
      } else if (pathname.startsWith('/auth/login')) {
        pageName = 'Login'
      } else if (pathname.startsWith('/auth/signup')) {
        pageName = 'Signup'
      } else {
        // Clean up pathname for page name
        pageName = pathname
          .split('/')
          .filter(Boolean)
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(' - ')
      }

      trackPageView(pageName, {
        path: pathname,
        search: searchParams.toString(),
        referrer: document.referrer,
      })
    }
  }, [pathname, searchParams])

  // Only wrap in PostHogProvider if we have a key
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
    return (
      <PostHogProvider client={posthog}>
        {children}
      </PostHogProvider>
    )
  }

  return <>{children}</>
} 