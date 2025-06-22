'use client';

import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ResumePreview } from '@/components/resume/resume-preview';
import { AppHeader } from '@/components/layout/app-header';
import type { ApiUser } from '@/lib/api/auth-client';

interface AppContentProps {
  user: ApiUser;
}

export function AppContent({ user }: AppContentProps) {
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | null>(null);

  const handleFileUpload = (file: File, content: string | null, type: 'pdf') => {
    setCurrentFile(file);
    setResumeContent(content);
    setFileType(type);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/3 to-transparent"></div>
      
      <AppHeader 
        hasContent={!!resumeContent} 
        fileType={fileType}
        fileName={currentFile?.name}
        user={user}
      />
      
      <ResizablePanelGroup 
        direction="horizontal" 
        className="h-full flex-1 relative z-10"
      >
        <ResizablePanel 
          defaultSize={35} 
          minSize={25} 
          maxSize={50}
          className="border-r border-[#2A2A2A]"
        >
          <ChatPanel 
            onFileUpload={handleFileUpload} 
            hasContent={!!resumeContent}
            fileType={fileType}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors" />
        
        <ResizablePanel defaultSize={65}>
          <ResumePreview 
            content={resumeContent} 
            fileType={fileType}
            file={currentFile}
            onFileUpload={handleFileUpload}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 