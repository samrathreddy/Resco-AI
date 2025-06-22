"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navigation() {
  return (
    <nav className="fixed left-[50%] z-50 w-full max-w-4xl translate-x-[-50%] items-center justify-center px-4 pt-6 flex">
      <div className="flex w-full max-w-4xl items-center justify-between gap-2 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] p-2 px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-lg font-bold text-white">Resco</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center justify-center gap-4 lg:gap-8">
          <Link href="#features" className="text-xs lg:text-sm font-bold text-white hover:text-white/80 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-xs lg:text-sm font-bold text-white hover:text-white/80 transition-colors">
            How it works
          </Link>
          <Link href="#templates" className="text-xs lg:text-sm font-bold text-white hover:text-white/80 transition-colors">
            Templates
          </Link>
        </div>
        
        <div className="flex gap-3">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs md:text-sm h-8 px-3 md:px-4">
            Talk with Resume
          </Button>
        </div>
      </div>
    </nav>
  );
} 