"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File, content: string | null, type: 'pdf') => void;
  className?: string;
}

interface UploadedFile {
  file: File;
  content: string | null;
  type: 'pdf';
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function LatexFileUpload({ onFileUpload, className }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      // Handle PDF files
      try {
        return {
          file,
          content: null, // PDF content will be processed by the viewer
          type: 'pdf',
          status: 'success'
        };
      } catch (error) {
        return {
          file,
          content: null,
          type: 'pdf',
          status: 'error',
          error: 'Failed to process PDF file'
        };
      }
    } else {
      return {
        file,
        content: null,
        type: 'pdf',
        status: 'error',
        error: 'Only PDF files are supported'
      };
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    try {
      const processedFiles = await Promise.all(
        acceptedFiles.map(file => processFile(file))
      );
      
      setUploadedFiles(prev => [...prev, ...processedFiles]);
      
      // Notify parent component of successful uploads
      processedFiles.forEach(processedFile => {
        if (processedFile.status === 'success') {
          onFileUpload(processedFile.file, processedFile.content, processedFile.type);
        }
      });
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [processFile, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false, // Only single PDF file
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Beautiful Glassy Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ease-in-out group",
          isDragActive 
            ? "border-indigo-400/60 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl scale-105 shadow-2xl shadow-indigo-500/25" 
            : "border-white/20 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl hover:border-indigo-400/40 hover:bg-gradient-to-br hover:from-indigo-600/10 hover:to-purple-600/10",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Glass overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
        
        <div className="flex flex-col items-center space-y-6 relative z-10">
          <div className={cn(
            "relative p-6 rounded-3xl transition-all duration-300",
            isDragActive 
              ? "bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-xl scale-110" 
              : "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl group-hover:scale-105"
          )}>
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <Upload className={cn(
              "h-12 w-12 transition-all duration-300 relative z-10",
              isDragActive ? "text-indigo-300 scale-110" : "text-indigo-400 group-hover:text-indigo-300"
            )} />
          </div>
          
          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-bold text-white">
              {isDragActive ? (
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Drop your PDF here
                </span>
              ) : (
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Upload Your Resume
                </span>
              )}
            </h3>
            <p className="text-[#B7B7B7] leading-relaxed">
              {isDragActive 
                ? "Release to upload your PDF resume and experience our beautiful viewer"
                : "Drag & drop your PDF resume here, or click to browse and discover our stunning display experience"
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-[#8A8A8A]">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              <span>PDF files only</span>
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              <span>Up to 10MB</span>
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            </div>
          </div>
          
          {!isDragActive && (
            <Button 
              variant="ghost" 
              className="relative group/btn bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-white border border-white/20 hover:border-white/30 rounded-2xl px-8 py-3 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-black/20"
              disabled={isProcessing}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 font-semibold">
                {isProcessing ? "Processing..." : "Choose PDF File"}
              </span>
            </Button>
          )}
        </div>
        
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-indigo-400 border-r-purple-400"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
              </div>
              <span className="text-white font-medium">Processing your resume...</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Uploaded Files
          </h4>
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300",
                  uploadedFile.status === 'success' && "border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 to-green-600/10 shadow-lg shadow-emerald-500/10",
                  uploadedFile.status === 'error' && "border-red-500/30 bg-gradient-to-r from-red-600/10 to-rose-600/10 shadow-lg shadow-red-500/10",
                  uploadedFile.status === 'uploading' && "border-indigo-500/30 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 shadow-lg shadow-indigo-500/10"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "p-3 rounded-2xl backdrop-blur-xl",
                    uploadedFile.status === 'success' && "bg-gradient-to-br from-emerald-600/30 to-green-600/30",
                    uploadedFile.status === 'error' && "bg-gradient-to-br from-red-600/30 to-rose-600/30",
                    uploadedFile.status === 'uploading' && "bg-gradient-to-br from-indigo-600/30 to-purple-600/30"
                  )}>
                    <FileText className={cn(
                      "h-5 w-5",
                      uploadedFile.status === 'success' && "text-emerald-400",
                      uploadedFile.status === 'error' && "text-red-400",
                      uploadedFile.status === 'uploading' && "text-indigo-400"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-[#B7B7B7] text-sm">
                      {formatFileSize(uploadedFile.file.size)} • PDF
                    </p>
                    {uploadedFile.error && (
                      <p className="text-red-400 text-sm mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-transparent border-t-indigo-400 border-r-purple-400"></div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 hover:bg-white/10 text-[#B7B7B7] hover:text-white rounded-lg transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 