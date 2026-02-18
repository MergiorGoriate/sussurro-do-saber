
import React from 'react';
import { HelpCircle } from 'lucide-react';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const GlossaryTooltip: React.FC<{ term: string; definition: string; children: React.ReactNode }> = ({ term, definition, children }) => {
  return (
    <span className="group relative inline-block cursor-help border-b border-dotted border-brand-blue dark:border-blue-400">
      <span className="text-brand-blue dark:text-blue-300 font-medium">{children}</span>
      <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none">
        <span className="font-bold block mb-1 text-blue-200">{term}</span>
        {definition}
        <svg className="absolute text-slate-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
      </span>
    </span>
  );
};

interface SimpleMarkdownProps {
  content: string;
  glossaryTerms?: { term: string; definition: string }[];
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartRenderer: React.FC<{ type: string; data: any; options?: any }> = ({ type, data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { weight: 'bold', size: 10 },
          usePointStyle: true,
        }
      },
    },
    ...options
  };

  return (
    <div className="w-full h-80 my-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      {type === 'line' && <Line data={data} options={defaultOptions} />}
      {type === 'bar' && <Bar data={data} options={defaultOptions} />}
      {type === 'pie' && <Pie data={data} options={defaultOptions} />}
      {type === 'doughnut' && <Doughnut data={data} options={defaultOptions} />}
    </div>
  );
};

const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content, glossaryTerms = [] }) => {
  if (!content) return null;

  const parseWithGlossary = (text: string) => {
    if (!glossaryTerms || glossaryTerms.length === 0) return parseFormatting(text);

    let parts: (string | React.ReactNode)[] = [text];

    glossaryTerms.forEach((item) => {
      const newParts: (string | React.ReactNode)[] = [];
      const regex = new RegExp(`\\b(${item.term})\\b`, 'gi');

      parts.forEach((part) => {
        if (typeof part === 'string') {
          const split = part.split(regex);
          if (split.length > 1) {
            split.forEach((str, i) => {
              if (i % 2 === 1) {
                newParts.push(
                  <GlossaryTooltip key={`${item.term}-${i}`} term={item.term} definition={item.definition}>
                    {str}
                  </GlossaryTooltip>
                );
              } else {
                newParts.push(str);
              }
            });
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts.map((part, i) => {
      if (typeof part === 'string') {
        return <React.Fragment key={i}>{parseFormatting(part)}</React.Fragment>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
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

  // Track if we are inside a chart block
  let inChart = false;
  let chartType = '';
  let chartDataStr = '';

  const processedLines: React.ReactNode[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const key = `line-${i}`;

    // Chart detection: [chart:type] ... [/chart]
    if (trimmed.startsWith('[chart:')) {
      inChart = true;
      chartType = trimmed.substring(7, trimmed.length - 1);
      chartDataStr = '';
      continue;
    }

    if (inChart) {
      if (trimmed === '[/chart]') {
        inChart = false;
        try {
          const config = JSON.parse(chartDataStr);
          processedLines.push(
            <ChartRenderer key={key} type={chartType} data={config.data} options={config.options} />
          );
        } catch (e) {
          processedLines.push(<div key={key} className="text-red-500 text-xs italic">Erro ao renderizar gráfico: JSON inválido</div>);
        }
        continue;
      }
      chartDataStr += line;
      continue;
    }

    // Existing Markdown parsers
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace('### ', '');
      processedLines.push(<h3 key={key} id={slugify(text)} className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-8 mb-3 scroll-mt-32 uppercase tracking-tight leading-none">{parseFormatting(text)}</h3>);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace('## ', '');
      processedLines.push(<h2 key={key} id={slugify(text)} className="text-xl md:text-2xl font-black text-brand-blue dark:text-blue-400 mt-10 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3 scroll-mt-32 uppercase tracking-tight">{parseFormatting(text)}</h2>);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      const text = trimmed.replace('# ', '');
      processedLines.push(<h1 key={key} id={slugify(text)} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-12 mb-6 scroll-mt-32 tracking-tighter">{parseFormatting(text)}</h1>);
      continue;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      processedLines.push(
        <div key={key} className="flex gap-3 ml-3 mb-2.5">
          <span className="text-brand-blue dark:text-blue-400 font-black mt-0.5 text-xl">•</span>
          <span className="text-slate-700 dark:text-slate-300 font-serif text-sm md:text-base">{parseWithGlossary(trimmed.substring(2))}</span>
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      processedLines.push(
        <blockquote key={key} className="border-l-4 border-brand-blue dark:border-blue-500 pl-6 py-4 my-8 bg-slate-50 dark:bg-slate-900/40 italic text-slate-800 dark:text-slate-200 text-lg md:text-xl font-serif rounded-r-2xl leading-relaxed">
          {parseWithGlossary(trimmed.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    if (trimmed === '') {
      processedLines.push(<div key={key} className="h-3" />);
      continue;
    }

    processedLines.push(<p key={key} className="text-slate-700 dark:text-slate-300 mb-5 font-serif leading-relaxed text-justify hyphens-auto text-sm md:text-base">{parseWithGlossary(trimmed)}</p>);
  }

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-base md:text-lg">
      {processedLines}
    </div>
  );
};

export default SimpleMarkdown;
