import { NextRequest, NextResponse } from 'next/server'

// Define allowed origins for CORS
const ALLOWED_ORIGINS = process.env.CORS_URL?.split(',') || []

// CORS configuration
const CORS_OPTIONS = {
  allowedMethods: ['GET', 'POST', 'PUT'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
}

export function corsHeaders(origin?: string | null): HeadersInit {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': CORS_OPTIONS.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': CORS_OPTIONS.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': CORS_OPTIONS.credentials.toString(),
    'Access-Control-Max-Age': CORS_OPTIONS.maxAge.toString(),
  }
}

export function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(origin),
    })
  }
  
  return null
}

export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get('origin')
    
    // Handle CORS preflight
    const corsResponse = handleCors(request)
    if (corsResponse) {
      return corsResponse
    }
    
    try {
      // Execute the actual handler
      const response = await handler(request)
      
      // Add CORS headers to the response
      const corsHeadersObj = corsHeaders(origin)
      Object.entries(corsHeadersObj).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error) {
      console.error('API Error:', error)
      
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin),
          },
        }
      )
    }
  }
} 