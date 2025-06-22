"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/backend/user-menu";
import { 
  FileText, 
  Download, 
  Share2,
  Brain
} from "lucide-react";
import type { ApiUser } from '@/lib/api/auth-client';

interface AppHeaderProps {
  hasContent: boolean;
  fileType: 'pdf' | null;
  fileName?: string;
  user: ApiUser;
}

export function AppHeader({ 
  hasContent, 
  fileType, 
  fileName, 
  user
}: AppHeaderProps) {
  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Export clicked');
  };

  const handleShare = () => {
    // Share functionality would be implemented here  
    console.log('Share clicked');
  };

  return (
    <header className="h-16 border-b border-[#2A2A2A] bg-black/80 backdrop-blur-md relative z-20">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Logo and File Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-bold text-white">Resco</h1>
              <p className="text-xs text-[#B7B7B7]">AI Resume Editor</p>
            </div>
          </div>

          {hasContent && (
            <>
              <Separator orientation="vertical" className="h-6 bg-[#2A2A2A]" />
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {fileName || 'Untitled Resume'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="default"
                        className="text-xs bg-red-600 text-white"
                      >
                        PDF
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">

          <Separator orientation="vertical" className="h-6 bg-[#2A2A2A]" />
          
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
} 