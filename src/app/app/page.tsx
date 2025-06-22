"use client";

import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ResumePreview } from '@/components/resume/resume-preview';
import { AppHeader } from '@/components/layout/app-header';

export default function AppPage() {
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'latex' | 'pdf' | null>(null);
  const [viewMode, setViewMode] = useState<'compiled' | 'source'>('compiled');

  const handleFileUpload = (file: File, content: string | null, type: 'latex' | 'pdf') => {
    setCurrentFile(file);
    setResumeContent(content);
    setFileType(type);
    
    // Auto-switch to appropriate view mode
    if (type === 'pdf') {
      setViewMode('compiled'); // PDFs are always shown as compiled
    } else {
      setViewMode('compiled'); // Start with compiled view for LaTeX
    }
  };

  const handleViewModeChange = (mode: 'compiled' | 'source') => {
    setViewMode(mode);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader 
        hasContent={!!resumeContent || !!currentFile}
        fileType={fileType}
        fileName={currentFile?.name}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <ChatPanel
              onFileUpload={handleFileUpload}
              hasContent={!!resumeContent || !!currentFile}
              fileType={fileType}
              className="h-full"
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            <ResumePreview
              content={resumeContent}
              fileType={fileType}
              file={currentFile}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              className="h-full"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 