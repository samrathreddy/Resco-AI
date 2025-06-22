# API Authentication System Documentation

This document covers the new API-based authentication system with proper CORS restrictions and RESTful endpoints.

## 🏗️ Architecture Overview

The authentication system has been restructured to use proper API endpoints instead of server actions:

```
Frontend (React) ←→ API Routes (/api/v1/auth/*) ←→ Supabase
```

### Key Components

1. **API Routes** (`/api/v1/auth/*`) - RESTful authentication endpoints
2. **CORS middleware** - Controls cross-origin requests
3. **API Client** - Frontend service for API communication
4. **Zod Validation** - Input validation on API routes
5. **Error Handling** - Consistent error responses

## 📂 API Endpoints

### Base URL

```
/api/v1/auth
```

### Available Endpoints

| Method    | Endpoint    | Description             | Request Body                                 | Response            |
| --------- | ----------- | ----------------------- | -------------------------------------------- | ------------------- |
| `POST`    | `/login`    | User login              | `{ email, password }`                        | User data + session |
| `POST`    | `/register` | User registration       | `{ name, email, password, confirmPassword }` | User data + session |
| `POST`    | `/logout`   | User logout             | None                                         | Success message     |
| `POST`    | `/google`   | Google OAuth initiation | None                                         | Redirect URL        |
| `GET`     | `/me`       | Get current user        | None                                         | User data + session |
| `OPTIONS` | `/*`        | CORS preflight          | None                                         | CORS headers        |

## 🔒 CORS Configuration

### Allowed Origins

```typescript
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://yourdomain.com", // Replace with your production domain
];
```

### CORS Headers

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization, X-Requested-With, Accept, Origin
- `Access-Control-Allow-Credentials`: true
- `Access-Control-Max-Age`: 86400 (24 hours)

### Customizing CORS

Update the CORS configuration in `src/lib/api/cors.ts`:

```typescript
// Add your production domains
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://yourdomain.com",
  "https://www.yourdomain.com",
];
```

## 🛠️ API Route Implementation

### Route Structure

```
src/app/api/v1/auth/
├── login/route.ts
├── register/route.ts
├── logout/route.ts
├── google/route.ts
└── me/route.ts
```

### Example Route Implementation

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/api/cors";
import { createClient } from "@/lib/supabase/server";

async function handler(request: NextRequest): Promise<NextResponse> {
  // Your route logic here
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST = withCors(handler);
export const OPTIONS = withCors(
  async () => new NextResponse(null, { status: 200 })
);
```

## 📡 Frontend API Client

### Usage

```typescript
import { authApi, authHelpers } from "@/lib/api/auth-client";

// Login
const result = await authApi.login({ email, password });

// Register
const result = await authApi.register({
  name,
  email,
  password,
  confirmPassword,
});

// Logout
await authApi.logout();

// Get current user
const user = await authHelpers.getCurrentUser();

// Check authentication status
const isAuth = await authHelpers.isAuthenticated();
```

### Error Handling

```typescript
try {
  const result = await authApi.login(credentials);
  if (!result.success) {
    // Handle API error
    console.error(result.error);
  }
} catch (error) {
  // Handle network/validation error
  const message = authHelpers.extractErrorMessage(error);
  const fieldErrors = authHelpers.extractFieldErrors(error);
}
```

## 🔐 Security Features

### Input Validation

- **Zod schemas** validate all input data
- **Server-side validation** prevents malicious requests
- **Type safety** with TypeScript

### Error Handling

- **Generic error messages** prevent information disclosure
- **Detailed logging** for debugging (server-side only)
- **Consistent error format** across all endpoints

### Authentication

- **HTTP-only cookies** for session management
- **Automatic session refresh** via Supabase
- **CSRF protection** built into Supabase

### Rate Limiting

Consider adding rate limiting for production:

```typescript
// Example with next-ratelimit
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute
});
```

## 📝 Request/Response Examples

### Login Request

```typescript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Login Response (Success)

```typescript
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890
  }
}
```

### Error Response

```typescript
{
  "error": "Invalid email or password",
  "field": "credentials"
}
```

### Register Request

```typescript
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

### Google OAuth Request/Response

```typescript
// Request
POST /api/v1/auth/google

// Response
{
  "success": true,
  "redirectUrl": "https://accounts.google.com/oauth/authorize?...",
  "message": "Redirecting to Google OAuth..."
}
```

## 🧪 Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (with session cookie)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  --cookie cookies.txt
```

### Using Postman

1. Set base URL: `http://localhost:3000/api/v1/auth`
2. Enable cookies in Postman settings
3. Set Content-Type header: `application/json`
4. Test each endpoint with appropriate request bodies

### Frontend Integration Testing

```typescript
// Test authentication flow
describe("Authentication API", () => {
  test("login with valid credentials", async () => {
    const result = await authApi.login({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  test("register new user", async () => {
    const result = await authApi.register({
      name: "Test User",
      email: "new@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    });
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Deployment Considerations

### Environment Variables

Ensure these are set in production:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
NEXT_PUBLIC_POSTHOG_KEY=your_production_posthog_key
```

### CORS Configuration

Update allowed origins for production:

```typescript
const ALLOWED_ORIGINS = [
  "https://yourdomain.com",
  "https://www.yourdomain.com",
  "https://app.yourdomain.com",
];
```

### Error Monitoring

Add error monitoring service:

```typescript
import * as Sentry from "@sentry/nextjs";

// In error handlers
Sentry.captureException(error);
```

### Performance

- Enable HTTP/2 on your server
- Use CDN for static assets
- Implement proper caching headers
- Consider API response compression

## 🔧 Customization

### Adding New Endpoints

1. Create route file: `src/app/api/v1/auth/new-endpoint/route.ts`
2. Implement handler with CORS wrapper
3. Add to API client: `src/lib/api/auth-client.ts`
4. Update types and documentation

### Custom Validation

```typescript
import { z } from "zod";

const customSchema = z.object({
  field: z.string().min(1, "Field is required"),
  // Add custom validation rules
});
```

### Custom Error Responses

```typescript
const errorResponse = (message: string, status: number, field?: string) => {
  return new NextResponse(
    JSON.stringify({
      error: message,
      field,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
};
```

## 📊 Analytics Integration

The API routes integrate with PostHog for tracking:

- Authentication events (login, register, logout)
- Error tracking and debugging
- User behavior analytics
- Performance monitoring

Events are tracked automatically in the frontend components that use the API client.

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Check allowed origins in `cors.ts`
   - Verify request headers
   - Ensure credentials are included

2. **Authentication Failures**

   - Verify Supabase configuration
   - Check environment variables
   - Review server logs

3. **Session Issues**
   - Clear cookies and retry
   - Check session expiration
   - Verify Supabase auth settings

### Debug Mode

Enable debug logging:

```typescript
// In development
if (process.env.NODE_ENV === "development") {
  console.log("API Request:", { method, url, body });
  console.log("API Response:", response);
}
```

This API-based architecture provides better security, scalability, and maintainability compared to server actions, while maintaining full compatibility with the existing frontend components.
