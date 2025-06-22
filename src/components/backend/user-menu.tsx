'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'
import { authEvents } from '@/lib/analytics/posthog'
import { authApi, authHelpers } from '@/lib/api/auth-client'
import { useRouter } from 'next/navigation'

import type { ApiUser } from '@/lib/api/auth-client'

interface UserMenuProps {
  user: ApiUser
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const displayName = user.name || user.email?.split('@')[0] || 'User'
  const email = user.email || ''
  
  const handleLogout = async () => {
    setIsLoggingOut(true)
    authEvents.logout()
    
    try {
      await authApi.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, redirect to home
      router.push('/')
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 hover:from-indigo-600/40 hover:to-purple-600/40 hover:text-white transition-all duration-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline-block max-w-[150px] truncate">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#2A2A2A] text-white">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{displayName}</p>
            <p className="text-xs leading-none text-[#B7B7B7]">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        <DropdownMenuItem onClick={() => router.push('/settings')} className="text-[#B7B7B7] hover:text-white hover:bg-indigo-600/20 focus:bg-indigo-600/20 focus:text-white">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/help')} className="text-[#B7B7B7] hover:text-white hover:bg-indigo-600/20 focus:bg-indigo-600/20 focus:text-white">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-600/20 focus:bg-red-600/20 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 