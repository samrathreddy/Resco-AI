"use client";

import { useMemo } from "react";

interface ParsedResume {
  header: {
    name: string;
    contact: string[];
    links: string[];
  };
  sections: ResumeSection[];
}

interface ResumeSection {
  title: string;
  type: 'education' | 'experience' | 'projects' | 'skills' | 'certifications' | 'achievements' | 'volunteer' | 'other';
  items: ResumeItem[];
}

interface ResumeItem {
  type: 'heading' | 'subheading' | 'bullet' | 'text' | 'project' | 'skill-category' | 'education' | 'job' | 'certification' | 'achievement';
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  content?: string[];
  link?: string;
  company?: string;
  position?: string;
}

interface AdvancedResumeParserProps {
  content: string;
  className?: string;
}

// Helper functions defined outside component to avoid hoisting issues
const getSectionType = (title: string): ResumeSection['type'] => {
  const lower = title.toLowerCase();
  if (lower.includes('education')) return 'education';
  if (lower.includes('experience')) return 'experience';
  if (lower.includes('project')) return 'projects';
  if (lower.includes('skill')) return 'skills';
  if (lower.includes('certification') || lower.includes('course')) return 'certifications';
  if (lower.includes('achievement')) return 'achievements';
  if (lower.includes('volunteer')) return 'volunteer';
  return 'other';
};

const extractBracedContent = (text: string, command: string): string | null => {
  const startIndex = text.indexOf(command);
  if (startIndex === -1) return null;
  
  let braceCount = 0;
  let content = '';
  let started = false;
  
  for (let i = startIndex + command.length; i < text.length; i++) {
    const char = text[i];
    if (char === '{') {
      if (!started) {
        started = true;
      }
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0 && started) {
        break;
      }
    }
    
    if (started && braceCount > 0) {
      content += char;
    }
  }
  
  return content.trim();
};

const parseComplexSubheading = (lines: string[], startIndex: number) => {
  let nextIndex = startIndex;
  const data: any = {};
  
  // Look for the pattern in the current and next few lines
  for (let j = startIndex; j < Math.min(startIndex + 8, lines.length); j++) {
    const line = lines[j].trim();
    
    // Extract position and dates
    if (line.includes('{') && line.includes('}')) {
      if (!data.position && (line.includes('\\textbf{') || j === startIndex + 1)) {
        const positionMatch = line.match(/\\textbf\{([^}]+)\}/);
        if (positionMatch) {
          data.position = positionMatch[1];
        }
      }
      
      // Extract dates (usually at the end)
      if (line.includes('--') || line.includes('2025') || line.includes('Present')) {
        const dateMatch = line.match(/\{([^}]*(?:2025|2024|2023|2022|2021|Present)[^}]*)\}/);
        if (dateMatch) {
          data.date = dateMatch[1];
        }
      }
      
      // Extract company/institution
      if (!data.company && line.includes('\\textit{') && !line.includes('\\textbf{')) {
        const companyMatch = line.match(/\\textit\{([^}]+)\}/);
        if (companyMatch) {
          data.company = companyMatch[1];
        }
      }
      
      // Extract location (usually has uppercase abbreviations)
      if (!data.location && line.match(/[A-Z]{2,3},?\s*[A-Z]{2}/)) {
        const locationMatch = line.match(/\{([^}]*[A-Z]{2,3}[^}]*)\}/);
        if (locationMatch) {
          data.location = locationMatch[1];
        }
      }
    }
    
    if (line.includes('\\resumeItemListStart') || 
        line.includes('\\resumeSubHeadingListEnd') || 
        line.includes('\\section{')) {
      nextIndex = j - 1;
      break;
    }
    
    nextIndex = j;
  }
  
  const item: ResumeItem = {
    type: data.position ? 'job' as const : 'subheading' as const,
    title: data.position || 'Position',
    company: data.company,
    date: data.date,
    location: data.location,
    content: [] as string[]
  };
  
  return { item, nextIndex };
};

const parseProjectHeading = (lines: string[], startIndex: number) => {
  const line = lines[startIndex];
  
  // Handle href project links
  const hrefMatch = line.match(/\\resumeProjectHeading\{\\href\{([^}]*)\}\{([^}]*)\}\}\{([^}]*)\}/);
  if (hrefMatch) {
    return {
      item: {
        type: 'project' as const,
        title: hrefMatch[2],
        subtitle: hrefMatch[3],
        link: hrefMatch[1],
        content: [] as string[]
      } as ResumeItem,
      nextIndex: startIndex
    };
  }
  
  // Handle simple project headings
  const simpleMatch = line.match(/\\resumeProjectHeading\{([^}]*)\}\{([^}]*)\}/);
  if (simpleMatch) {
    return {
      item: {
        type: 'project' as const,
        title: simpleMatch[1],
        subtitle: simpleMatch[2],
        content: [] as string[]
      } as ResumeItem,
      nextIndex: startIndex
    };
  }
  
  return { item: null, nextIndex: startIndex };
};

const parseSkillsFromLine = (line: string) => {
  // Handle skills with multiple categories in one line separated by \\
  const skillsText = line
    .replace(/\\item\s*\{/, '')
    .replace(/\}\s*$/, '')
    .replace(/\\small\s*\{/, '')
    .trim();

  const skillCategories: Array<{ title: string; content: string }> = [];
  
  // Split by \\ to get individual skill lines
  const skillLines = skillsText.split('\\\\').map(s => s.trim()).filter(Boolean);
  
  for (const skillLine of skillLines) {
    const match = skillLine.match(/\\textbf\{([^}]+)\}\{:\s*([^}]+)\}/);
    if (match) {
      skillCategories.push({
        title: match[1],
        content: match[2]
      });
    }
  }
  
  return skillCategories;
};

const parseOtherProjects = (line: string) => {
  // Handle format: \other{Other Projects:} {\href{url1}{name1}, \href{url2}{name2}, \href{url3}{name3}}
  const match = line.match(/\\other\{([^}]+)\}\s*\{([^}]*)\}/);
  if (!match) return null;
  
  const title = match[1];
  const projectsText = match[2];
  
  // Extract individual href links
  const hrefPattern = /\\href\{([^}]*)\}\{([^}]*)\}/g;
  const projects: Array<{ name: string; url: string }> = [];
  let hrefMatch;
  
  while ((hrefMatch = hrefPattern.exec(projectsText)) !== null) {
    projects.push({
      name: hrefMatch[2],
      url: hrefMatch[1]
    });
  }
  
  return {
    title,
    projects
  };
};

const cleanLatexText = (text: string): string => {
  return text
    .replace(/\\href\{([^}]*)\}\{\\underline\{([^}]*)\}\}/g, '$2')
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2')
    .replace(/\\underline\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\small/g, '')
    .replace(/[{}\\]/g, '')
    .trim();
};

export function AdvancedResumeParser({ content, className }: AdvancedResumeParserProps) {
  const parsedResume = useMemo((): ParsedResume => {
    if (!content) return { header: { name: '', contact: [], links: [] }, sections: [] };
    
    const lines = content.split('\n');
    let inDocument = false;
    let currentSection: ResumeSection | null = null;
    const sections: ResumeSection[] = [];
    const header = { name: '', contact: [], links: [] };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('\\begin{document}')) {
        inDocument = true;
        continue;
      }
      
      if (line.includes('\\end{document}')) break;
      if (!inDocument) continue;
      
      // Parse header name
      if (line.includes('\\textbf{\\Huge') || line.includes('\\textbf{\\LARGE')) {
        const nameMatch = line.match(/\\textbf\{\\(?:Huge|LARGE)\\s*\\scshape\s*([^}]+)\}/);
        if (nameMatch) {
          header.name = nameMatch[1].trim();
        }
      }
      
      // Parse main contact info (first center block)
      if (line.includes('\\small') && line.includes('$|$')) {
        const contactText = cleanLatexText(line.replace(/\$\|\$/g, '|'));
        header.contact = contactText.split('|').map(item => item.trim()).filter(Boolean);
      }
      
      // Parse additional links (second center block)
      if (line.includes('\\href') && !line.includes('\\small') && (line.includes('\\,|\\,') || line.includes('} \\,|\\,'))) {
        const linksText = cleanLatexText(line.replace(/\\,\|\\,/g, '|').replace(/\} \\,\|\\, /g, '|'));
        header.links = linksText.split('|').map(item => item.trim()).filter(Boolean);
      }
      
      // Parse sections
      if (line.startsWith('\\section{')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const titleMatch = line.match(/\\section\{([^}]+)\}/);
        const title = titleMatch ? titleMatch[1] : 'Unknown Section';
        
        currentSection = {
          title,
          type: getSectionType(title),
          items: []
        };
        continue;
      }
      
      // Parse resume subheadings - complex multi-line parsing
      if (line.includes('\\resumeSubheading') && currentSection) {
        const parsed = parseComplexSubheading(lines, i);
        if (parsed.item) {
          currentSection.items.push(parsed.item);
          i = parsed.nextIndex;
        }
        continue;
      }
      
      // Parse project headings
      if (line.includes('\\resumeProjectHeading') && currentSection) {
        const parsed = parseProjectHeading(lines, i);
        if (parsed.item) {
          currentSection.items.push(parsed.item);
          i = parsed.nextIndex;
        }
        continue;
      }
      
      // Parse skills section with multiple categories
      if (line.includes('\\item{') && line.includes('\\textbf{') && line.includes('}{:') && currentSection && currentSection.type === 'skills') {
        const skillCategories = parseSkillsFromLine(line);
        for (const skill of skillCategories) {
          currentSection.items.push({
            type: 'skill-category' as const,
            title: skill.title,
            content: [skill.content] as string[]
          } as ResumeItem);
        }
        continue;
      }
      
      // Parse other projects
      if (line.includes('\\other{') && currentSection) {
        const otherData = parseOtherProjects(line);
        if (otherData) {
          const projectLinks = otherData.projects.map(p => p.name).join(', ');
          currentSection.items.push({
            type: 'text',
            title: otherData.title,
            content: [projectLinks] as string[]
          } as ResumeItem);
        }
        continue;
      }
      
      // Parse resume items (bullets and certifications)
      if (line.includes('\\resumeItem{') && currentSection) {
        const itemText = extractBracedContent(line, '\\resumeItem{');
        if (itemText) {
          // Check if it's a certification with link
          const hrefMatch = itemText.match(/\\href\{([^}]*)\}\{([^}]*)\}/);
          if (hrefMatch && (currentSection.type === 'certifications' || currentSection.type === 'achievements')) {
                         currentSection.items.push({
               type: currentSection.type === 'certifications' ? 'certification' as const : 'achievement' as const,
               title: cleanLatexText(hrefMatch[2]),
               link: hrefMatch[1],
               content: [cleanLatexText(itemText)] as string[]
             } as ResumeItem);
          } else if (currentSection.items.length > 0) {
            // Regular bullet point for existing item
            const lastItem = currentSection.items[currentSection.items.length - 1];
            if (!lastItem.content) lastItem.content = [];
            lastItem.content.push(cleanLatexText(itemText));
          } else {
                         // Standalone item (like achievement)
             currentSection.items.push({
               type: currentSection.type === 'achievements' ? 'achievement' as const : 'bullet' as const,
               content: [cleanLatexText(itemText)] as string[]
             } as ResumeItem);
          }
        }
        continue;
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return { header, sections };
  }, [content]);

  const renderHeader = () => (
    <div className="text-center" style={{ marginBottom: '12pt' }}>
      <h1 
        style={{ 
          fontSize: '22pt',
          fontFamily: '"Computer Modern", "Times New Roman", serif',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '6pt',
          lineHeight: '1.1',
          textTransform: 'uppercase',
          letterSpacing: '0.5pt'
        }}
      >
        {parsedResume.header.name || 'Your Name'}
      </h1>
      <div 
        style={{ 
          fontSize: '10pt',
          color: '#000000',
          lineHeight: '1.2',
          fontFamily: '"Computer Modern", "Times New Roman", serif'
        }}
      >
        {parsedResume.header.contact.length > 0 && (
          <div style={{ marginBottom: '3pt' }}>
            {parsedResume.header.contact.join(' | ')}
          </div>
        )}
        {parsedResume.header.links.length > 0 && (
          <div style={{ marginBottom: '0pt' }}>
            {parsedResume.header.links.map((link, idx) => (
              <span key={idx} style={{ 
                color: '#000000',
                textDecoration: 'underline',
                marginRight: idx < parsedResume.header.links.length - 1 ? '6pt' : '0pt'
              }}>
                {link}
              </span>
            )).reduce((prev, curr, idx) => idx === 0 ? [curr] : [...prev, ' | ', curr], [] as React.ReactNode[])}
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = (section: ResumeSection, index: number) => (
    <div key={index} style={{ marginBottom: '12pt' }}>
      <h2 
        style={{ 
          fontSize: '11pt',
          fontFamily: '"Computer Modern", "Times New Roman", serif',
          fontWeight: 'bold',
          color: '#000000',
          textTransform: 'uppercase',
          letterSpacing: '1pt',
          marginBottom: '6pt',
          paddingBottom: '1pt',
          borderBottom: '0.6pt solid #000000',
          fontVariant: 'small-caps'
        }}
      >
        {section.title}
      </h2>
      <div style={{ marginLeft: '0pt' }}>
        {section.items.map((item, idx) => renderItem(item, idx))}
      </div>
    </div>
  );

  const renderItem = (item: ResumeItem, index: number) => {
    const baseTextStyle = {
      fontFamily: '"Computer Modern", "Times New Roman", serif',
      color: '#000000',
      lineHeight: '1.3'
    };

    switch (item.type) {
      case 'job':
        return (
          <div key={index} style={{ marginBottom: '8pt' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'baseline',
              marginBottom: '2pt' 
            }}>
              <div style={{ flex: '1' }}>
                <span 
                  style={{ 
                    ...baseTextStyle,
                    fontSize: '10pt',
                    fontWeight: 'bold'
                  }}
                >
                  {item.company || 'Company'}
                </span>
              </div>
              <span 
                style={{ 
                  ...baseTextStyle,
                  fontSize: '10pt',
                  marginLeft: '12pt',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.date}
              </span>
            </div>
            <div style={{ marginBottom: '3pt' }}>
              <span 
                style={{ 
                  ...baseTextStyle,
                  fontSize: '10pt',
                  fontStyle: 'italic'
                }}
              >
                {item.title}
                {item.location && (
                  <span style={{ marginLeft: '8pt', fontStyle: 'italic' }}>
                    {item.location}
                  </span>
                )}
              </span>
            </div>
            {item.content && item.content.length > 0 && (
              <ul style={{ 
                marginLeft: '12pt',
                paddingLeft: '0pt',
                marginTop: '2pt',
                marginBottom: '0pt',
                listStyleType: 'disc'
              }}>
                {item.content.map((content, idx) => (
                  <li 
                    key={idx} 
                    style={{ 
                      ...baseTextStyle,
                      fontSize: '10pt',
                      marginBottom: '1pt',
                      lineHeight: '1.2'
                    }}
                  >
                    {content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        
      case 'project':
        return (
          <div key={index} style={{ marginBottom: '8pt' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'baseline',
              marginBottom: '2pt' 
            }}>
              <span 
                style={{ 
                  ...baseTextStyle,
                  fontSize: '10pt',
                  fontWeight: 'bold',
                  color: item.link ? '#000000' : '#000000',
                  textDecoration: item.link ? 'underline' : 'none'
                }}
              >
                {item.title}
              </span>
              <span 
                style={{ 
                  ...baseTextStyle,
                  fontSize: '10pt',
                  fontStyle: 'italic',
                  marginLeft: '12pt'
                }}
              >
                {item.subtitle}
              </span>
            </div>
            {item.content && item.content.length > 0 && (
              <ul style={{ 
                marginLeft: '12pt',
                paddingLeft: '0pt',
                marginTop: '2pt',
                marginBottom: '0pt',
                listStyleType: 'disc'
              }}>
                {item.content.map((content, idx) => (
                  <li 
                    key={idx} 
                    style={{ 
                      ...baseTextStyle,
                      fontSize: '10pt',
                      marginBottom: '1pt',
                      lineHeight: '1.2'
                    }}
                  >
                    {content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        
      case 'skill-category':
        return (
          <div key={index} style={{ marginBottom: '3pt' }}>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt',
                fontWeight: 'bold'
              }}
            >
              {item.title}:{' '}
            </span>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt'
              }}
            >
              {item.content?.[0]}
            </span>
          </div>
        );
        
      case 'certification':
        return (
          <div key={index} style={{ marginBottom: '3pt' }}>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt',
                color: item.link ? '#000000' : '#000000',
                textDecoration: item.link ? 'underline' : 'none'
              }}
            >
              {item.content?.[0]}
            </span>
          </div>
        );
        
      case 'achievement':
        return (
          <div key={index} style={{ marginBottom: '3pt' }}>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt'
              }}
            >
              {item.content?.[0]}
            </span>
          </div>
        );
        
      case 'text':
        return (
          <div key={index} style={{ marginBottom: '4pt' }}>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt',
                fontWeight: 'bold'
              }}
            >
              {item.title}{' '}
            </span>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt'
              }}
            >
              {item.content?.[0]}
            </span>
          </div>
        );
        
      case 'subheading':
        return (
          <div key={index} style={{ marginBottom: '8pt' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'baseline',
              marginBottom: '2pt' 
            }}>
              <div>
                <span 
                  style={{ 
                    ...baseTextStyle,
                    fontSize: '10pt',
                    fontWeight: 'bold'
                  }}
                >
                  {item.title}
                </span>
                {item.company && (
                  <div style={{ marginTop: '1pt' }}>
                    <span 
                      style={{ 
                        ...baseTextStyle,
                        fontSize: '10pt',
                        fontStyle: 'italic'
                      }}
                    >
                      {item.company}
                    </span>
                  </div>
                )}
              </div>
              {item.date && (
                <span 
                  style={{ 
                    ...baseTextStyle,
                    fontSize: '10pt',
                    marginLeft: '12pt'
                  }}
                >
                  {item.date}
                </span>
              )}
            </div>
            {item.content && item.content.length > 0 && (
              <ul style={{ 
                marginLeft: '12pt',
                paddingLeft: '0pt',
                marginTop: '2pt',
                marginBottom: '0pt',
                listStyleType: 'disc'
              }}>
                {item.content.map((content, idx) => (
                  <li 
                    key={idx} 
                    style={{ 
                      ...baseTextStyle,
                      fontSize: '10pt',
                      marginBottom: '1pt',
                      lineHeight: '1.2'
                    }}
                  >
                    {content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        
      default:
        return (
          <div key={index} style={{ marginBottom: '3pt' }}>
            <span 
              style={{ 
                ...baseTextStyle,
                fontSize: '10pt'
              }}
            >
              {item.content?.[0]}
            </span>
          </div>
        );
    }
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg">No resume content to display</p>
          <p className="text-sm">Upload a LaTeX file or start with a template</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white text-black mx-auto shadow-lg ${className}`}
      style={{ 
        fontFamily: '"Computer Modern", "Times New Roman", serif',
        fontSize: '10pt',
        lineHeight: '1.3',
        color: '#000000',
        padding: '36pt 36pt 36pt 36pt', // Tighter margins
        maxWidth: '8.5in',
        minHeight: '11in',
        backgroundColor: '#ffffff'
      }}
    >
      {renderHeader()}
      <div>
        {parsedResume.sections.map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
} 