import { AuthForm } from '@/components/backend/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - Resco AI Resume Editor',
  description: 'Create your Resco account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      {/* Centered Form */}
      <div className="w-full max-w-lg p-4 relative z-10">
        <AuthForm mode="signup" />
      </div>
    </div>
  )
} 