# Authentication Setup Guide

This guide will help you set up the complete authentication system for Resco, including Supabase authentication, PostHog analytics, and secure user management.

## 🚀 Quick Setup

### 1. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then update `.env.local` with your actual values:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PostHog Analytics (Optional but recommended)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. Supabase Setup

#### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings → API to get your URL and anon key

#### Step 2: Configure Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. Enable the authentication providers you want:
   - **Email** (enabled by default)
   - **Google OAuth** (recommended)

#### Step 3: Google OAuth Setup (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google OAuth2 API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret
6. In Supabase → Authentication → Settings → OAuth:
   - Enable Google provider
   - Add your Client ID and Client Secret

#### Step 4: Database Schema

Run this SQL in your Supabase SQL editor to create the profiles table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. PostHog Setup (Optional)

1. Go to [PostHog](https://posthog.com) and create an account
2. Create a new project
3. Copy your Project API Key from Project Settings
4. Add the key to your `.env.local` file

## 🔧 Features Implemented

### ✅ Authentication Features

- **Email/Password Authentication** with strong validation
- **Google OAuth** integration
- **Secure password requirements** (8+ chars, uppercase, lowercase, number, special char)
- **Form validation** with Zod schemas
- **Error handling** with user-friendly messages
- **Route protection** via middleware
- **Session management** with automatic redirects

### ✅ Security Features

- **Server-side validation** for all auth operations
- **Row Level Security (RLS)** in Supabase
- **Secure error messages** (no information leakage)
- **CSRF protection** via Supabase
- **Secure cookie handling**
- **Input sanitization** and validation

### ✅ User Experience

- **Responsive auth forms** with loading states
- **Password visibility toggle**
- **Social login** with Google
- **Auto-redirect** after authentication
- **Remember login state** across sessions
- **User dropdown menu** with profile info

### ✅ Analytics & Monitoring

- **PostHog integration** for user behavior tracking
- **Authentication event tracking**:
  - Signup started/completed/failed
  - Login started/completed/failed
  - Logout events
  - Page view tracking
- **Privacy-focused** analytics (no PII)

## 🔐 Security Best Practices Implemented

### 1. Password Security

- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Server-side validation with Zod
- No password storage in frontend state

### 2. Error Handling

- Generic error messages to prevent information disclosure
- Detailed logging for debugging (server-side only)
- No exposure of Supabase internal errors

### 3. Route Protection

- Middleware-based authentication checks
- Automatic redirects for protected routes
- Session validation on each request

### 4. Database Security

- Row Level Security (RLS) enabled
- User-specific data access policies
- Secure function execution context

## 🚦 Authentication Flow

### Registration Flow

1. User fills signup form (name, email, password, confirm password)
2. **Frontend validation** with Zod schema
3. **Server action** validates and creates user in Supabase
4. **Profile creation** via database trigger
5. **Analytics tracking** for signup events
6. **Auto-redirect** to app dashboard

### Login Flow

1. User enters email and password
2. **Frontend validation** with Zod schema
3. **Server action** authenticates with Supabase
4. **Session creation** and cookie management
5. **Analytics tracking** for login events
6. **Auto-redirect** to app dashboard

### Google OAuth Flow

1. User clicks "Continue with Google"
2. **Redirect to Google** OAuth consent screen
3. **Callback handling** via `/auth/callback`
4. **Session creation** and profile setup
5. **Analytics tracking** for OAuth events
6. **Auto-redirect** to app dashboard

## 🛠 File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   └── callback/route.ts       # OAuth callback handler
│   └── app/
│       ├── page.tsx                # Protected app route
│       └── app-content.tsx         # Main app content
├── components/
│   ├── backend/
│   │   ├── auth-actions.ts         # Server actions for auth
│   │   ├── auth-form.tsx           # Reusable auth form
│   │   ├── providers.tsx           # Client providers (PostHog)
│   │   └── user-menu.tsx           # User dropdown menu
│   └── ui/
│       ├── dropdown-menu.tsx       # Dropdown UI component
│       └── card.tsx                # Card UI component
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase
│   │   └── server.ts               # Server-side Supabase
│   ├── schemas/
│   │   └── auth.ts                 # Zod validation schemas
│   └── analytics/
│       └── posthog.ts              # PostHog configuration
└── middleware.ts                   # Route protection middleware
```

## 🧪 Testing the Implementation

### Manual Testing Checklist

#### Registration

- [ ] Valid email and strong password → Success
- [ ] Weak password → Validation error
- [ ] Mismatched passwords → Validation error
- [ ] Existing email → Appropriate error
- [ ] Google OAuth → Success

#### Login

- [ ] Valid credentials → Success
- [ ] Invalid credentials → Generic error
- [ ] Google OAuth → Success

#### Route Protection

- [ ] `/app` without auth → Redirect to login
- [ ] `/auth/login` while authenticated → Redirect to app
- [ ] Logout → Redirect to home

#### User Experience

- [ ] Form validation works in real-time
- [ ] Loading states show during auth operations
- [ ] Error messages are user-friendly
- [ ] User menu shows correct information

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

- Check your `.env.local` file has correct Supabase credentials
- Ensure the file is in the project root
- Restart your development server after adding env vars

#### 2. Google OAuth Not Working

- Verify redirect URI in Google Cloud Console matches Supabase
- Check that Google OAuth is enabled in Supabase settings
- Ensure Client ID and Secret are correctly configured

#### 3. Database Permission Errors

- Run the SQL schema creation script in Supabase
- Verify RLS policies are created correctly
- Check that the trigger function exists

#### 4. PostHog Not Tracking

- Verify PostHog key is correct in `.env.local`
- Check browser console for PostHog errors
- Ensure PostHog domain is not blocked by ad blockers

### Development Tips

1. **Use Supabase local development** for faster iteration
2. **Check browser network tab** for auth request failures
3. **Monitor Supabase logs** for server-side errors
4. **Use PostHog debug mode** during development

## 📈 Next Steps

After basic setup, consider these enhancements:

1. **Email verification** for new signups
2. **Password reset** functionality
3. **Social logins** (GitHub, LinkedIn)
4. **Multi-factor authentication** (MFA)
5. **User profile management** pages
6. **Advanced analytics** with custom events
7. **Rate limiting** for auth endpoints
8. **Session management** dashboard

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check PostHog integration guides
4. Verify environment variables are correct
5. Test with a fresh browser session

Remember: Never commit your `.env.local` file to version control!
