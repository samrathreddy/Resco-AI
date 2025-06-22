"use client";

import { useMemo } from "react";

interface ResumeRendererProps {
  content: string;
  className?: string;
}

interface ParsedSection {
  type: 'header' | 'section' | 'education' | 'experience' | 'project' | 'skills' | 'other';
  title?: string;
  content: string[];
}

export function ResumeRenderer({ content, className }: ResumeRendererProps) {
  const parsedResume = useMemo(() => {
    if (!content) return [];
    
    const sections: ParsedSection[] = [];
    const lines = content.split('\n');
    
    let currentSection: ParsedSection | null = null;
    let inDocument = false;
    let headerInfo: any = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('\\begin{document}')) {
        inDocument = true;
        continue;
      }
      
      if (line.includes('\\end{document}')) {
        break;
      }
      
      if (!inDocument) continue;
      
      // Parse header information
      if (line.includes('\\textbf{\\Huge') || line.includes('\\textbf{\\LARGE')) {
        const nameMatch = line.match(/\\textbf\{\\(?:Huge|LARGE)\\s*\\scshape\s*([^}]+)\}/);
        if (nameMatch) {
          headerInfo.name = nameMatch[1].trim();
        }
      }
      
      if (line.includes('\\small') && (line.includes('$|$') || line.includes('|'))) {
        headerInfo.contact = line.replace(/\\small|\$\|\$|\||\\href\{[^}]*\}\{\\underline\{[^}]*\}\}/g, '')
          .replace(/\\underline\{[^}]*\}/g, '')
          .replace(/[{}\\]/g, '')
          .trim();
      }
      
      // Parse sections
      if (line.startsWith('\\section')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const titleMatch = line.match(/\\section\*?\{([^}]+)\}/);
        const title = titleMatch ? titleMatch[1] : 'Unknown Section';
        
        currentSection = {
          type: getSectionType(title),
          title,
          content: []
        };
        continue;
      }
      
      // Parse content within sections
      if (currentSection && line && !line.startsWith('%') && !line.startsWith('\\')) {
        currentSection.content.push(line);
      }
      
      // Parse specific patterns
      if (line.includes('\\resumeSubheading') || line.includes('\\resumeProjectHeading')) {
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('\\resumeSubheading') && !lines[j].includes('\\section')) {
          if (lines[j].trim() && currentSection) {
            currentSection.content.push(lines[j].trim());
          }
          j++;
        }
        i = j - 1;
      }
      
      if (line.includes('\\resumeItem') && currentSection) {
        const itemMatch = line.match(/\\resumeItem\{([^}]+)\}/);
        if (itemMatch) {
          currentSection.content.push('• ' + itemMatch[1]);
        }
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Add header as first section
    if (headerInfo.name) {
      sections.unshift({
        type: 'header',
        content: [headerInfo.name, headerInfo.contact].filter(Boolean)
      });
    }
    
    return sections;
  }, [content]);

  const getSectionType = (title: string): ParsedSection['type'] => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('education')) return 'education';
    if (lowerTitle.includes('experience')) return 'experience';
    if (lowerTitle.includes('project')) return 'project';
    if (lowerTitle.includes('skill')) return 'skills';
    return 'section';
  };

  const renderHeader = (section: ParsedSection) => (
    <div className="text-center mb-6 pb-4 border-b border-border">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {section.content[0] || 'Your Name'}
      </h1>
      <div className="text-sm text-muted-foreground">
        {section.content[1] && (
          <div className="flex flex-wrap justify-center gap-1 text-xs">
            {section.content[1].split(/[|,]/).map((item, idx) => (
              <span key={idx} className="mx-1">
                {item.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = (section: ParsedSection, index: number) => (
    <div key={index} className="mb-6">
      {section.title && (
        <h2 className="text-lg font-semibold text-foreground mb-3 pb-1 border-b border-border">
          {section.title}
        </h2>
      )}
      <div className="space-y-2">
        {section.content.map((item, idx) => {
          if (item.startsWith('•')) {
            return (
              <div key={idx} className="text-sm text-muted-foreground ml-4">
                {item}
              </div>
            );
          }
          
          // Check if it's a job title or project heading
          if (item.includes('{') && (item.includes('\\textbf') || item.includes('\\item'))) {
            const cleanItem = item.replace(/\\textbf\{([^}]+)\}/g, '$1')
              .replace(/\\item/g, '')
              .replace(/[{}\\]/g, '')
              .trim();
            
            return (
              <div key={idx} className="text-sm font-medium text-foreground">
                {cleanItem}
              </div>
            );
          }
          
          return (
            <div key={idx} className="text-sm text-muted-foreground">
              {item.replace(/[{}\\]/g, '')}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No resume content to display</p>
          <p className="text-sm">Upload a LaTeX file or start with a template</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white text-black p-8 max-w-4xl mx-auto shadow-lg ${className}`}>
      <div className="space-y-4">
        {parsedResume.map((section, index) => {
          if (section.type === 'header') {
            return renderHeader(section);
          }
          return renderSection(section, index);
        })}
      </div>
    </div>
  );
} 