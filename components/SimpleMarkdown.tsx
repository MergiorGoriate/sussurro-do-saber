
import React from 'react';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const parseFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    const italicParts = part.split(/(\*[^*]+?\*)/g);
    return (
      <React.Fragment key={i}>
        {italicParts.map((subPart, j) => {
          if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
            return <em key={j} className="italic text-slate-800 dark:text-slate-200">{subPart.slice(1, -1)}</em>;
          }
          return subPart;
        })}
      </React.Fragment>
    );
  });
};

interface SimpleMarkdownProps {
  content: string;
}

const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-base md:text-lg">
      {content.split('\n').map((line, index) => {
        const key = `line-${index}`;
        const trimmed = line.trim();
        
        if (trimmed.startsWith('### ')) {
          const text = trimmed.replace('### ', '');
          return <h3 key={key} id={slugify(text)} className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-8 mb-3 scroll-mt-32">{parseFormatting(text)}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          const text = trimmed.replace('## ', '');
          return <h2 key={key} id={slugify(text)} className="text-xl md:text-2xl font-black text-brand-blue dark:text-blue-400 mt-10 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3 scroll-mt-32 uppercase tracking-tight">{parseFormatting(text)}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          const text = trimmed.replace('# ', '');
          return <h1 key={key} id={slugify(text)} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-12 mb-6 scroll-mt-32 tracking-tighter">{parseFormatting(text)}</h1>;
        }
        
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return (
            <div key={key} className="flex gap-3 ml-3 mb-2.5">
              <span className="text-brand-blue dark:text-blue-400 font-black mt-0.5 text-xl">•</span>
              <span className="text-slate-700 dark:text-slate-300 font-serif text-sm md:text-base">{parseFormatting(trimmed.substring(2))}</span>
            </div>
          );
        if (trimmed.startsWith('> ')) return (
            <blockquote key={key} className="border-l-4 border-brand-blue dark:border-blue-500 pl-6 py-4 my-8 bg-slate-50 dark:bg-slate-900/40 italic text-slate-800 dark:text-slate-200 text-lg md:text-xl font-serif rounded-r-2xl leading-relaxed">
              {parseFormatting(trimmed.replace('> ', ''))}
            </blockquote>
          );
        
        if (trimmed === '') return <div key={key} className="h-3" />;
        
        return <p key={key} className="text-slate-700 dark:text-slate-300 mb-5 font-serif leading-relaxed text-justify hyphens-auto text-sm md:text-base">{parseFormatting(trimmed)}</p>;
      })}
    </div>
  );
};

export default SimpleMarkdown;
