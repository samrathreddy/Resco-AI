"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, ZoomIn, ZoomOut, Upload, ChevronLeft, ChevronRight, Maximize2, RotateCw } from 'lucide-react';
import { LatexFileUpload } from "@/components/ui/latex-file-upload";

interface ResumePreviewProps {
  content: string | null;
  fileType: 'pdf' | null;
  file: File | null;
  onFileUpload?: (file: File, content: string | null, type: 'pdf') => void;
  className?: string;
}

interface PDFPageInfo {
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  panX: number;
  panY: number;
}

interface DoubleTapState {
  lastTap: number;
  tapCount: number;
}

export function ResumePreview({ 
  content, 
  fileType, 
  file, 
  onFileUpload, 
  className 
}: ResumePreviewProps) {
  const [pdfInfo, setPdfInfo] = useState<PDFPageInfo>({
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    rotation: 0
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0
  });
  const [doubleTapState, setDoubleTapState] = useState<DoubleTapState>({
    lastTap: 0,
    tapCount: 0
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Zoom levels for double tap cycling
  const zoomLevels = [1.0, 1.5, 2.0, 2.5];
  const doubleClickDelay = 300; // milliseconds

  useEffect(() => {
    if (file && fileType === 'pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      loadPDFPages(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, fileType]);

  // Reset pan when page changes or zoom changes significantly
  useEffect(() => {
    setDragState(prev => ({ ...prev, panX: 0, panY: 0 }));
  }, [pdfInfo.currentPage]);

  const loadPDFPages = async (url: string) => {
    setIsLoading(true);
    try {
      // Dynamic import of pdf.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument(url).promise;
      setPdfInfo(prev => ({ ...prev, totalPages: pdf.numPages }));
      
      // Render all pages to images for smooth display
      const images: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to 10 pages for performance
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High DPI
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          images.push(canvas.toDataURL('image/png', 0.9));
        }
      }
      
      setPageImages(images);
    } catch (error) {
      console.error('PDF loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePage = (direction: number) => {
    setPdfInfo(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(prev.totalPages, prev.currentPage + direction))
    }));
  };

  const changeZoom = (delta: number) => {
    setPdfInfo(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2.5, prev.scale + delta))
    }));
  };

  // Double tap/click zoom functionality
  const handleDoubleClickZoom = () => {
    const currentScale = pdfInfo.scale;
    const currentIndex = zoomLevels.findIndex(level => Math.abs(level - currentScale) < 0.1);
    
    // If current scale doesn't match any predefined level, go to first zoom level
    let nextIndex = currentIndex === -1 ? 1 : (currentIndex + 1) % zoomLevels.length;
    
    setPdfInfo(prev => ({
      ...prev,
      scale: zoomLevels[nextIndex]
    }));

    // Reset pan position when zooming via double tap
    setDragState(prev => ({ ...prev, panX: 0, panY: 0 }));
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

  const handleFileUpload = (file: File, content: string | null, type: 'latex' | 'pdf') => {
    setShowUploadDialog(false);
    if (onFileUpload && type === 'pdf') {
      onFileUpload(file, content, 'pdf');
    }
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Handle double click detection
    const now = Date.now();
    if (now - doubleTapState.lastTap < doubleClickDelay) {
      handleDoubleClickZoom();
      setDoubleTapState({ lastTap: 0, tapCount: 0 });
      return;
    }
    
    setDoubleTapState({ lastTap: now, tapCount: 1 });
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      startX: e.clientX - prev.panX,
      startY: e.clientY - prev.panY
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    setDragState(prev => ({
      ...prev,
      panX: e.clientX - prev.startX,
      panY: e.clientY - prev.startY
    }));
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  // Touch functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    // Handle double tap detection
    const now = Date.now();
    if (now - doubleTapState.lastTap < doubleClickDelay && doubleTapState.tapCount === 1) {
      handleDoubleClickZoom();
      setDoubleTapState({ lastTap: 0, tapCount: 0 });
      return;
    }
    
    setDoubleTapState({ lastTap: now, tapCount: 1 });
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      startX: touch.clientX - prev.panX,
      startY: touch.clientY - prev.panY
    }));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging) return;
    
    const touch = e.touches[0];
    setDragState(prev => ({
      ...prev,
      panX: touch.clientX - prev.startX,
      panY: touch.clientY - prev.startY
    }));
  };

  const handleTouchEnd = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  // Reset pan position
  const resetPan = () => {
    setDragState(prev => ({ ...prev, panX: 0, panY: 0 }));
  };

  if (!content && !file) {
    return (
      <div className={`flex items-center justify-center h-full bg-black ${className}`}>
        <div className="text-center space-y-8">
          {/* Glassy upload area */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl shadow-indigo-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
              <FileText className="w-16 h-16 text-indigo-300 relative z-10" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-60 -z-10"></div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Upload Your Resume
            </h3>
            <p className="text-[#B7B7B7] max-w-md mx-auto leading-relaxed">
              Drop your PDF resume here and watch it come to life in our beautiful viewer. 
              Get ready to enhance it with AI-powered suggestions.
            </p>
          </div>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="relative group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:shadow-2xl hover:scale-105 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Upload className="w-5 h-5 mr-3 relative z-10" />
                <span className="relative z-10 font-semibold">Choose PDF File</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Upload Resume
                </DialogTitle>
              </DialogHeader>
              <LatexFileUpload onFileUpload={handleFileUpload} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const currentPageImage = pageImages[pdfInfo.currentPage - 1];

  return (
    <div className={`flex flex-col h-full bg-black ${className}`}>
      {/* Beautiful Floating Glassy Controls Header */}
      <div className="absolute top-4 right-22 z-20">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-3 shadow-2xl shadow-black/50">
          <div className="flex items-center space-x-4">
            {/* File Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="text-white font-medium">{file?.name || 'Resume.pdf'}</div>
                <div className="text-[#B7B7B7] text-xs">
                  Page {pdfInfo.currentPage} of {pdfInfo.totalPages}
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-white/20"></div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changePage(-1)}
                disabled={pdfInfo.currentPage <= 1}
                className="text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changePage(1)}
                disabled={pdfInfo.currentPage >= pdfInfo.totalPages}
                className="text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-white/20"></div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeZoom(-0.1)}
                disabled={pdfInfo.scale <= 0.5}
                className="text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0 rounded-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm min-w-[50px] text-center">
                {Math.round(pdfInfo.scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeZoom(0.1)}
                disabled={pdfInfo.scale >= 2.5}
                className="text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0 rounded-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-white/20"></div>

            {/* Reset Pan Button */}
            {(dragState.panX !== 0 || dragState.panY !== 0) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPan}
                  className="text-yellow-300 hover:bg-yellow-500/20 hover:text-yellow-200 h-8 px-3 rounded-lg"
                >
                  <Maximize2 className="w-4 h-4 mr-1" />
                  <span className="text-xs">Reset</span>
                </Button>
                <div className="w-px h-6 bg-white/20"></div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 h-8 px-3 rounded-lg"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    <span className="text-xs">New</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Upload Resume
                    </DialogTitle>
                  </DialogHeader>
                  <LatexFileUpload onFileUpload={handleFileUpload} />
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={downloadFile}
                className="text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 h-8 px-3 rounded-lg"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="text-xs">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main PDF Display Area */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-900 relative">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Processing Your Resume</h3>
                <p className="text-[#B7B7B7]">Creating beautiful preview...</p>
              </div>
            </div>
          </div>
        ) : currentPageImage ? (
          <div className="flex items-center justify-center h-full p-8 pt-24 relative z-10">
            {/* Glassy PDF Container */}
            <div className="relative max-w-4xl w-full">
              {/* Page container with glass effect */}
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
                
                {/* PDF Page */}
                <div className="relative z-10 p-6 overflow-hidden">
                  <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
                    <img
                      ref={imageRef}
                      src={currentPageImage}
                      alt={`Resume page ${pdfInfo.currentPage}`}
                      title="Double-click or double-tap to zoom"
                      className={`w-full h-auto max-w-full object-contain transition-transform duration-300 ease-out select-none ${
                        dragState.isDragging ? 'cursor-grabbing' : 'cursor-grab'
                      }`}
                      style={{
                        transform: `scale(${pdfInfo.scale}) rotate(${pdfInfo.rotation}deg) translate(${dragState.panX}px, ${dragState.panY}px)`,
                        transformOrigin: 'center',
                        maxHeight: 'calc(100vh - 200px)'
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      draggable={false}
                    />
                  </div>
                  
                  {/* Zoom Hint */}
                  {pdfInfo.scale === 1.0 && !dragState.isDragging && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/10 opacity-70 hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-xs">💡 Double-tap to zoom</span>
                    </div>
                  )}
                </div>

                {/* Floating page indicator */}
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
                  <span className="text-white text-sm font-medium">
                    {pdfInfo.currentPage} / {pdfInfo.totalPages}
                  </span>
                </div>
              </div>

              {/* Glow effects */}
              <div className="absolute -inset-8 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl opacity-60 -z-10 animate-pulse"></div>
            </div>

            {/* Navigation arrows */}
            {pdfInfo.currentPage > 1 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => changePage(-1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-xl text-white hover:bg-black/60 rounded-full w-12 h-12 p-0 border border-white/10 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            
            {pdfInfo.currentPage < pdfInfo.totalPages && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => changePage(1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-xl text-white hover:bg-black/60 rounded-full w-12 h-12 p-0 border border-white/10 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </div>
        ) : pdfUrl ? (
          <div className="flex items-center justify-center h-full p-8 pt-24 relative z-10">
            {/* Fallback iframe display with glassy design */}
            <div className="relative max-w-4xl w-full h-full">
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
                <div className="relative z-10 p-6 h-full">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full rounded-2xl shadow-2xl shadow-black/30"
                    title="PDF Document"
                  />
                </div>
              </div>
              <div className="absolute -inset-8 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl opacity-60 -z-10 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10">
                <FileText className="w-12 h-12 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Unable to display PDF</h3>
                <p className="text-sm text-[#B7B7B7]">The file might be corrupted or incompatible.</p>
              </div>
              <Button 
                onClick={downloadFile} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 