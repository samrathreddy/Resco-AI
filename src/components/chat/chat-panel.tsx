"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Sparkles, 
  FileText,
  Brain,
  Target
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'file-upload' | 'suggestion';
}

interface ChatPanelProps {
  onFileUpload: (file: File, content: string | null, type: 'pdf') => void;
  hasContent: boolean;
  fileType: 'pdf' | null;
  className?: string;
}

export function ChatPanel({ onFileUpload, hasContent, fileType, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
          ? `Great! I can see your PDF resume is loaded. What would you like me to help you improve?`
          : "Hello! I'm your AI resume assistant. Upload your PDF resume using the upload button in the preview panel, and I'll help you improve it with targeted suggestions.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [hasContent, fileType, messages.length]);

  const handleFileUpload = (file: File, content: string | null, type: 'pdf') => {
    // Add file upload message
    const fileMessage: Message = {
      id: `file-${Date.now()}`,
      content: `Uploaded PDF file: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'file-upload'
    };

    setMessages(prev => [...prev, fileMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: `Perfect! I've loaded your PDF resume in our beautiful viewer. I can now help you edit specific sections while preserving your original formatting. Try asking me to "improve the work experience section" or "make the skills more impactful".`,
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
          ? `I understand you want to "${inputMessage}". Let me analyze your PDF resume and provide specific suggestions for improvement.`
          : "I'd be happy to help with that! First, please upload your PDF resume using the upload button in the preview panel so I can provide personalized suggestions.",
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
    ? [
        "Edit the experience section",
        "Improve technical skills", 
        "Update contact information",
        "Enhance project descriptions"
      ]
    : [
        "Upload my resume",
        "Show me best practices",
        "Help me get started"
      ];

  return (
    <div className={`flex flex-col h-full bg-black ${className}`}>
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
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-[#2A2A2A] to-[#3A3A3A] text-white border border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'ai' && (
                  <Sparkles className="w-4 h-4 mt-0.5 text-indigo-400" />
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
                    message.sender === 'user' ? 'text-indigo-100' : 'text-[#B7B7B7]'
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
            <div className="bg-gradient-to-r from-[#2A2A2A] to-[#3A3A3A] rounded-lg px-4 py-2 border border-[#2A2A2A]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-[#B7B7B7]">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {!isTyping && (
        <div className="px-4 py-2 border-t border-[#2A2A2A]">
          <div className="mb-3">
            <h4 className="text-xs font-medium text-[#B7B7B7] mb-2 flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30 text-indigo-300 hover:from-indigo-600/40 hover:to-purple-600/40 hover:border-indigo-400 hover:text-white transition-all duration-200"
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
      <div className="p-4 border-t border-[#2A2A2A] bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A]">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={hasContent 
                ? "Ask me to improve your PDF resume..."
                : "Upload your resume or ask me anything..."
              }
              className="min-h-[44px] max-h-32 resize-none bg-black/50 border-[#2A2A2A] text-white placeholder:text-[#B7B7B7] focus:border-indigo-500 focus:ring-indigo-500/20"
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
            className="h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-[#B7B7B7] mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 