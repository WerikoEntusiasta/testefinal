import React from 'react';

export function parseInlineStyles(text: string, isDarkMode: boolean): React.ReactNode[] {
  // Find all tags: **bold**, [color | text], [mark | text], [link | text], [fonte: | text]
  const regex = /(\*\*.*?\*\*|\[color\s+[^\]|]+\|\s*[^\]]+\]|\[mark\s+[^\]|]+\|\s*[^\]]+\]|\[link\s+[^\]|]+\|\s*[^\]]+\]|\[fonte:\s*[^\]|]+\|\s*[^\]]+\])/g;
  
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (!part) return null;
    
    // Check if it's bold
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className={`font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{boldText}</strong>;
    }
    
    // Check if it's color
    if (part.startsWith('[color ') && part.endsWith(']')) {
      const content = part.slice(7, -1);
      const pipeIndex = content.indexOf('|');
      if (pipeIndex !== -1) {
        const colorName = content.substring(0, pipeIndex).trim();
        const textVal = content.substring(pipeIndex + 1).trim();
        
        let colorClass = 'text-red-600 dark:text-red-400 font-bold';
        let customStyle = {};
        if (colorName === 'red' || colorName === 'vermelho') {
          colorClass = 'text-red-600 dark:text-red-400 font-bold';
        } else if (colorName === 'orange' || colorName === 'laranja') {
          colorClass = 'text-orange-500 dark:text-[#d48743] font-bold';
        } else if (colorName === 'green' || colorName === 'verde') {
          colorClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
        } else if (colorName === 'blue' || colorName === 'azul') {
          colorClass = 'text-blue-600 dark:text-blue-400 font-bold';
        } else if (colorName.startsWith('#')) {
          colorClass = '';
          customStyle = { color: colorName };
        }
        
        return (
          <span key={index} className={`${colorClass} font-sans`} style={customStyle}>
            {textVal}
          </span>
        );
      }
    }
    
    // Check if it's mark
    if (part.startsWith('[mark ') && part.endsWith(']')) {
      const content = part.slice(6, -1);
      const pipeIndex = content.indexOf('|');
      if (pipeIndex !== -1) {
        const markColor = content.substring(0, pipeIndex).trim();
        const textVal = content.substring(pipeIndex + 1).trim();
        
        let bgClass = 'bg-rose-100/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-b border-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded';
        if (markColor === 'yellow' || markColor === 'amarelo') {
          bgClass = 'bg-amber-100/90 dark:bg-amber-950/35 text-amber-950 dark:text-amber-100 border-b border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded';
        } else if (markColor === 'pink' || markColor === 'rosa') {
          bgClass = 'bg-rose-100/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-b border-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded';
        } else if (markColor === 'green' || markColor === 'verde') {
          bgClass = 'bg-emerald-100/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-b border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded';
        }
        
        return (
          <mark key={index} className={`${bgClass} font-medium mx-0.5 rounded`}>
            {textVal}
          </mark>
        );
      }
    }
    
    // Check if it's link or fonte
    if ((part.startsWith('[link ') || part.startsWith('[fonte: ')) && part.endsWith(']')) {
      const isFonte = part.startsWith('[fonte: ');
      const content = isFonte ? part.slice(8, -1) : part.slice(6, -1);
      const pipeIndex = content.indexOf('|');
      if (pipeIndex !== -1) {
        const linkText = content.substring(0, pipeIndex).trim();
        const linkUrl = content.substring(pipeIndex + 1).trim();
        
        return (
          <a 
            key={index} 
            href={linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#d48743] hover:text-[#c27a41] underline font-bold hover:opacity-90 transition-opacity inline-flex items-center"
          >
            {isFonte ? `Fonte: ${linkText}` : linkText}
          </a>
        );
      }
    }
    
    return part;
  }).filter(Boolean);
}

interface RichTextRendererProps {
  content: string;
  isDarkMode?: boolean;
}

export default function RichTextRenderer({ content, isDarkMode = false }: RichTextRendererProps) {
  if (!content) return null;

  // Split into lines/paragraphs
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list-${key}`} className={`list-disc pl-5 my-4 space-y-1.5 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
          {listItems.map((item, idx) => (
            <li key={idx} className="text-xs sm:text-sm font-sans">
              {parseInlineStyles(item, isDarkMode)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        inList = true;
      }
      listItems.push(trimmed.substring(2));
      return;
    } else {
      if (inList) {
        inList = false;
        flushList(index);
      }
    }

    if (!trimmed) {
      // Empty line, add a spacer or ignore
      return;
    }

    // Check for Section Titles (Heading 3 / Heading 4)
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.substring(4);
      blocks.push(
        <h3 key={index} className={`text-base sm:text-lg font-sans font-extrabold tracking-tight mt-6 mb-3 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          {parseInlineStyles(headingText, isDarkMode)}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      const headingText = trimmed.substring(3);
      blocks.push(
        <h2 key={index} className={`text-lg sm:text-xl font-sans font-extrabold tracking-tight mt-8 mb-4 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          {parseInlineStyles(headingText, isDarkMode)}
        </h2>
      );
    }
    // Check for Embedded Image: [img url | caption]
    else if (trimmed.startsWith('[img ') && trimmed.endsWith(']')) {
      const content = trimmed.slice(5, -1);
      const pipeIdx = content.indexOf('|');
      if (pipeIdx !== -1) {
        const imageUrl = content.substring(0, pipeIdx).trim();
        const caption = content.substring(pipeIdx + 1).trim();
        blocks.push(
          <div key={index} className="my-6 space-y-2">
            <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'} shadow-md`}>
              <img 
                src={imageUrl} 
                alt={caption} 
                referrerPolicy="no-referrer"
                className="w-full max-h-[420px] object-cover"
              />
            </div>
            {caption && (
              <p className={`text-[11px] sm:text-xs text-center italic leading-relaxed px-4 ${isDarkMode ? 'text-zinc-500 font-mono' : 'text-zinc-500 font-sans'}`}>
                {caption}
              </p>
            )}
          </div>
        );
      } else {
        blocks.push(
          <div key={index} className="my-6 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-md">
            <img 
              src={content} 
              alt="Artigo" 
              referrerPolicy="no-referrer"
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        );
      }
    }
    // Default: render as standard paragraph
    else {
      blocks.push(
        <p key={index} className={`text-xs sm:text-sm leading-relaxed font-sans my-3.5 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
          {parseInlineStyles(trimmed, isDarkMode)}
        </p>
      );
    }
  });

  // Flush any final list
  if (inList) {
    flushList(lines.length);
  }

  return <div className="space-y-1">{blocks}</div>;
}
