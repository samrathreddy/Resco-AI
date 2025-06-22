"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File, content: string | null, type: 'latex' | 'pdf') => void;
  className?: string;
}

interface UploadedFile {
  file: File;
  content: string | null;
  type: 'latex' | 'pdf';
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function LatexFileUpload({ onFileUpload, className }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'tex') {
      // Handle LaTeX files
      try {
        const content = await file.text();
        return {
          file,
          content,
          type: 'latex',
          status: 'success'
        };
      } catch (error) {
        return {
          file,
          content: null,
          type: 'latex',
          status: 'error',
          error: 'Failed to read LaTeX file'
        };
      }
    } else if (fileExtension === 'pdf') {
      // Handle PDF files
      try {
        return {
          file,
          content: null, // PDF content will be processed differently
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
        type: 'latex',
        status: 'error',
        error: 'Only .tex and .pdf files are supported'
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
      'text/x-tex': ['.tex'],
      'application/pdf': ['.pdf'],
      'application/x-latex': ['.tex'],
      'text/plain': ['.tex']
    },
    multiple: true,
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
    <div className={cn("w-full space-y-4", className)}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out",
          isDragActive 
            ? "border-blue-400 bg-blue-50 scale-105" 
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "p-4 rounded-full transition-all duration-200",
            isDragActive ? "bg-blue-100" : "bg-gray-100"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors duration-200",
              isDragActive ? "text-blue-600" : "text-gray-600"
            )} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isDragActive ? "Drop your files here" : "Upload Resume Files"}
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              {isDragActive 
                ? "Release to upload your resume files"
                : "Drag & drop your LaTeX (.tex) or PDF resume files here, or click to browse"
              }
            </p>
            <p className="text-xs text-gray-500">
              Supports .tex and .pdf files up to 10MB
            </p>
          </div>
          
          {!isDragActive && (
            <Button 
              variant="outline" 
              className="mt-4"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Choose Files"}
            </Button>
          )}
        </div>
        
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">Processing files...</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  uploadedFile.status === 'success' && "border-green-200 bg-green-50",
                  uploadedFile.status === 'error' && "border-red-200 bg-red-50",
                  uploadedFile.status === 'uploading' && "border-blue-200 bg-blue-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded",
                    uploadedFile.type === 'latex' ? "bg-blue-100" : "bg-red-100"
                  )}>
                    {uploadedFile.type === 'latex' ? (
                      <FileText className="h-4 w-4 text-blue-600" />
                    ) : (
                      <File className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)} • {uploadedFile.type.toUpperCase()}
                    </p>
                    {uploadedFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
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