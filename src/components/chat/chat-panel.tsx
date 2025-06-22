"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Upload, 
  File, 
  MessageSquare, 
  Sparkles, 
  FileText,
  Edit3,
  Brain,
  Target
} from "lucide-react";
import { LatexFileUpload } from "@/components/ui/latex-file-upload";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'file-upload' | 'suggestion';
}

interface FileData {
  file: File;
  content: string | null;
  type: 'latex' | 'pdf';
}

interface ChatPanelProps {
  onFileUpload: (file: File, content: string | null, type: 'latex' | 'pdf') => void;
  hasContent: boolean;
  fileType: 'latex' | 'pdf' | null;
  className?: string;
}

export function ChatPanel({ onFileUpload, hasContent, fileType, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message based on current state
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: hasContent 
          ? `Great! I can see your ${fileType?.toUpperCase()} resume is loaded. What would you like me to help you improve?`
          : "Hello! I'm your AI resume assistant. Upload your resume (LaTeX or PDF) and I'll help you improve it with targeted suggestions.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [hasContent, fileType, messages.length]);

  const handleFileUpload = (file: File, content: string | null, type: 'latex' | 'pdf') => {
    // Add file upload message
    const fileMessage: Message = {
      id: `file-${Date.now()}`,
      content: `Uploaded ${type.toUpperCase()} file: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'file-upload'
    };

    setMessages(prev => [...prev, fileMessage]);
    setShowUploadDialog(false);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: type === 'pdf' 
          ? `Perfect! I've loaded your PDF resume. I can now help you edit specific sections while preserving your original formatting. Try asking me to "improve the work experience section" or "make the skills more impactful".`
          : `Excellent! Your LaTeX resume has been parsed successfully. I can see all your sections and content. What would you like me to help you improve? I can enhance descriptions, optimize for ATS, or update specific sections.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    // Call parent handler
    onFileUpload(file, content, type);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: hasContent 
          ? `I understand you want to "${inputMessage}". Let me analyze your ${fileType} resume and provide specific suggestions for improvement.`
          : "I'd be happy to help with that! First, please upload your resume so I can provide personalized suggestions.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const suggestions = hasContent 
    ? fileType === 'pdf'
      ? [
          "Edit the experience section",
          "Improve technical skills formatting", 
          "Update contact information",
          "Enhance project descriptions"
        ]
      : [
          "Make descriptions more quantified",
          "Optimize for ATS scanning",
          "Improve action verbs",
          "Add missing keywords"
        ]
    : [
        "Upload my resume",
        "Start with a template",
        "Help me choose the best format",
        "Show me resume best practices"
      ];

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Resume Assistant</h2>
              <p className="text-sm text-gray-600">
                {hasContent ? `Working with your ${fileType?.toUpperCase()} resume` : 'Ready to help improve your resume'}
              </p>
            </div>
          </div>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Resume</DialogTitle>
              </DialogHeader>
              <LatexFileUpload onFileUpload={handleFileUpload} />
            </DialogContent>
          </Dialog>
        </div>

        {hasContent && (
          <div className="mt-3 flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {fileType === 'pdf' ? 'PDF Editor Mode' : 'LaTeX Parser Mode'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {fileType === 'pdf' ? 'Direct Editing' : 'Code Generation'}
            </Badge>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'ai' && (
                  <Sparkles className="w-4 h-4 mt-0.5 text-blue-600" />
                )}
                <div className="flex-1">
                  {message.type === 'file-upload' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">File Upload</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {!isTyping && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={hasContent 
                ? `Ask me to improve your ${fileType} resume...`
                : "Upload your resume or ask me anything..."
              }
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
            className="h-11"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 