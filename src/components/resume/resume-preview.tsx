"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Download, ZoomIn, ZoomOut, RotateCw, Edit3, AlertTriangle } from 'lucide-react';
import { AdvancedResumeParser } from './advanced-resume-parser';

// Dynamically import PDF components to avoid SSR issues
const Document = dynamic(
  () => import('react-pdf').then(mod => mod.Document),
  { ssr: false, loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div> }
);

const Page = dynamic(
  () => import('react-pdf').then(mod => mod.Page),
  { ssr: false }
);

// Skip PDF.js worker configuration to avoid CDN issues
// The component will default to simple viewer which is more reliable

interface ResumePreviewProps {
  content: string | null;
  fileType: 'latex' | 'pdf' | null;
  file: File | null;
  viewMode: 'compiled' | 'source';
  onViewModeChange: (mode: 'compiled' | 'source') => void;
  className?: string;
}

interface PDFPageInfo {
  pageNumber: number;
  numPages: number;
  scale: number;
  rotation: number;
}

export function ResumePreview({ 
  content, 
  fileType, 
  file, 
  viewMode, 
  onViewModeChange, 
  className 
}: ResumePreviewProps) {
  const [pdfPageInfo, setPdfPageInfo] = useState<PDFPageInfo>({
    pageNumber: 1,
    numPages: 0,
    scale: 1.0,
    rotation: 0
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [useSimpleViewer, setUseSimpleViewer] = useState(true); // Start with simple viewer to avoid worker issues

  useEffect(() => {
    if (file && fileType === 'pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, fileType]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPdfPageInfo(prev => ({ ...prev, numPages }));
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    setPdfError('Failed to load PDF. The file might be corrupted or incompatible.');
    // Auto-switch to simple viewer after a few seconds
    setTimeout(() => setUseSimpleViewer(true), 3000);
  };

  const handleUseSimpleViewer = () => {
    setUseSimpleViewer(true);
    setPdfError(null);
  };

  const changePage = (offset: number) => {
    setPdfPageInfo(prev => ({
      ...prev,
      pageNumber: Math.max(1, Math.min(prev.numPages, prev.pageNumber + offset))
    }));
  };

  const changeScale = (scaleDelta: number) => {
    setPdfPageInfo(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3.0, prev.scale + scaleDelta))
    }));
  };

  const rotate = () => {
    setPdfPageInfo(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const handlePageClick = async (pageNumber: number) => {
    if (!file || fileType !== 'pdf') return;
    
    try {
      // This would extract text from the clicked page for editing
      // Implementation would depend on the PDF structure
      setIsEditMode(true);
    } catch (error) {
      console.error('Error extracting text from PDF page:', error);
    }
  };

  const downloadFile = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!content && !file) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">No resume loaded</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Upload a LaTeX (.tex) file to see the compiled preview, or upload a PDF to view and edit it directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant={fileType === 'pdf' ? 'default' : 'secondary'}>
              {fileType?.toUpperCase() || 'UNKNOWN'}
            </Badge>
            {file && (
              <span className="text-sm text-gray-600">{file.name}</span>
            )}
          </div>
          
          {fileType === 'latex' && (
                         <Tabs value={viewMode} onValueChange={(value: string) => onViewModeChange(value as 'compiled' | 'source')}>
               <TabsList>
                 <TabsTrigger value="compiled" className="flex items-center space-x-2">
                   <Eye className="w-4 h-4" />
                   <span>Compiled</span>
                 </TabsTrigger>
                 <TabsTrigger value="source" className="flex items-center space-x-2">
                   <FileText className="w-4 h-4" />
                   <span>Source</span>
                 </TabsTrigger>
               </TabsList>
             </Tabs>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {fileType === 'pdf' && (
            <>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Page {pdfPageInfo.pageNumber} of {pdfPageInfo.numPages}</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(-1)}
                disabled={pdfPageInfo.pageNumber <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(1)}
                disabled={pdfPageInfo.pageNumber >= pdfPageInfo.numPages}
              >
                Next
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeScale(-0.1)}
                disabled={pdfPageInfo.scale <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(pdfPageInfo.scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeScale(0.1)}
                disabled={pdfPageInfo.scale >= 3.0}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rotate}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit3 className="w-4 h-4" />
                <span className="ml-2">{isEditMode ? "Exit Edit" : "Edit"}</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                onClick={() => setUseSimpleViewer(!useSimpleViewer)} 
                variant={useSimpleViewer ? "default" : "outline"} 
                size="sm"
                title={useSimpleViewer ? "Switch to Advanced Viewer" : "Switch to Simple Viewer"}
              >
                <Eye className="w-4 h-4" />
                <span className="ml-2">{useSimpleViewer ? "Advanced" : "Simple"}</span>
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadFile}
            disabled={!file}
          >
            <Download className="w-4 h-4" />
            <span className="ml-2">Download</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {fileType === 'latex' && content && (
          <Tabs value={viewMode} className="h-full">
            <TabsContent value="compiled" className="h-full m-0">
              <div className="h-full bg-white">
                <AdvancedResumeParser content={content} className="h-full" />
              </div>
            </TabsContent>
            <TabsContent value="source" className="h-full m-0">
              <div className="h-full bg-gray-900 text-green-400 font-mono text-sm">
                <pre className="p-6 whitespace-pre-wrap h-full overflow-auto">
                  {content}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {fileType === 'pdf' && pdfUrl && (
          <div className="h-full flex items-center justify-center bg-gray-100 p-4">
            {useSimpleViewer ? (
              // Simple PDF viewer fallback
              <div className="w-full h-full bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">PDF Document</span>
                      <Badge variant="secondary">Simple Viewer</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={downloadFile} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="h-full">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="PDF Document"
                  />
                </div>
              </div>
            ) : pdfError ? (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">PDF Viewer Error</h3>
                  <p className="text-sm text-gray-600 max-w-md">{pdfError}</p>
                  <p className="text-xs text-gray-500">
                    You can try the simple viewer or download the PDF to view externally.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Button onClick={handleUseSimpleViewer} variant="default">
                    <Eye className="w-4 h-4 mr-2" />
                    Try Simple Viewer
                  </Button>
                  <Button onClick={downloadFile} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {isEditMode && (
                  <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg z-10 flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg border">
                      <p className="text-sm font-medium text-gray-900">Edit Mode Active</p>
                      <p className="text-xs text-gray-600">Click on text areas to edit</p>
                    </div>
                  </div>
                )}
                
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  className="shadow-lg"
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading PDF...</p>
                      </div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Error loading PDF</p>
                        <p className="text-red-500 text-sm">Please try uploading the file again</p>
                      </div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pdfPageInfo.pageNumber}
                    scale={pdfPageInfo.scale}
                    rotate={pdfPageInfo.rotation}
                    className="shadow-lg border border-gray-200"
                    onClick={() => handlePageClick(pdfPageInfo.pageNumber)}
                    loading={
                      <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                      </div>
                    }
                  />
                </Document>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 