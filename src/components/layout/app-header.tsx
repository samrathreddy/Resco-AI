"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  FileText, 
  Eye, 
  Code, 
  Download, 
  Share2, 
  Settings,
  File,
  Brain
} from "lucide-react";

interface AppHeaderProps {
  hasContent: boolean;
  fileType: 'latex' | 'pdf' | null;
  fileName?: string;
  viewMode: 'compiled' | 'source';
  onViewModeChange: (mode: 'compiled' | 'source') => void;
}

export function AppHeader({ 
  hasContent, 
  fileType, 
  fileName, 
  viewMode, 
  onViewModeChange 
}: AppHeaderProps) {
  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Export clicked');
  };

  const handleShare = () => {
    // Share functionality would be implemented here  
    console.log('Share clicked');
  };

  const handleSettings = () => {
    // Settings functionality would be implemented here
    console.log('Settings clicked');
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Logo and Branding */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Resco</h1>
              <p className="text-xs text-muted-foreground">AI Resume Editor</p>
            </div>
          </div>

          {hasContent && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {fileType === 'pdf' ? (
                    <File className="w-4 h-4 text-red-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {fileName || 'Untitled Resume'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={fileType === 'pdf' ? 'default' : 'secondary'} className="text-xs">
                        {fileType?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {fileType === 'pdf' ? 'Direct Edit' : 'LaTeX Compilation'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: View Mode Controls (only for LaTeX) */}
        {hasContent && fileType === 'latex' && (
          <div className="flex items-center space-x-4">
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value: string) => {
                if (value) onViewModeChange(value as 'compiled' | 'source');
              }}
              className="border border-border rounded-lg"
            >
              <ToggleGroupItem 
                value="compiled" 
                className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground gap-2"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Compiled</span>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="source"
                className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground gap-2"
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Source</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          {hasContent ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Upload a resume to get started
            </div>
          )}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettings}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
} 