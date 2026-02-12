
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
    Bold, Italic, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Code, Link as LinkIcon,
    Image as ImageIcon, Table as TableIcon, Eye,
    Edit3, Maximize2, Minimize2, Save, RotateCcw,
    RotateCw, Sigma, FileText, Info, Check, Download
} from 'lucide-react';

interface ArticleEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
    onSave?: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ initialContent, onChange, onSave }) => {
    const [content, setContent] = useState(initialContent);
    const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Sync with prop
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    // Autosave simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('cms_autosave_content', content);
            setLastSaved(new Date());
        }, 2000);
        return () => clearTimeout(timer);
    }, [content]);

    const handleContentChange = (val: string) => {
        setContent(val);
        onChange(val);
    };

    const insertMarkdown = (prefix: string, suffix: string = '') => {
        const textarea = textAreaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);

        const newContent = `${before}${prefix}${selected}${suffix}${after}`;
        handleContentChange(newContent);

        // Focus back and set selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            );
        }, 10);
    };

    const toolbarButtons = [
        { icon: Heading1, action: () => insertMarkdown('# ', ''), label: 'H1' },
        { icon: Heading2, action: () => insertMarkdown('## ', ''), label: 'H2' },
        { icon: Heading3, action: () => insertMarkdown('### ', ''), label: 'H3' },
        { type: 'divider' },
        { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Negrito' },
        { icon: Italic, action: () => insertMarkdown('*', '*'), label: 'Itálico' },
        { type: 'divider' },
        { icon: List, action: () => insertMarkdown('- ', ''), label: 'Lista' },
        { icon: ListOrdered, action: () => insertMarkdown('1. ', ''), label: 'Lista Ord.' },
        { icon: Quote, action: () => insertMarkdown('> ', ''), label: 'Citação' },
        { type: 'divider' },
        { icon: Code, action: () => insertMarkdown('```\n', '\n```'), label: 'Código' },
        { icon: Sigma, action: () => insertMarkdown('$$ ', ' $$'), label: 'LaTeX' },
        { type: 'divider' },
        { icon: LinkIcon, action: () => insertMarkdown('[', '](url)'), label: 'Link' },
        { icon: ImageIcon, action: () => insertMarkdown('![alt](', ')'), label: 'Imagem' },
        { icon: TableIcon, action: () => insertMarkdown('\n| Col1 | Col2 |\n|------|------|\n| Item | Valor |\n', ''), label: 'Tabela' },
        { type: 'divider' },
        { icon: FileText, action: () => insertMarkdown('\n> **Citação APA:** Autor, A. A. (Ano). *Título do artigo*. Título do Periódico, Volume(Número), páginas. https://doi.org/xx.xxx/xxxx\n', ''), label: 'Citação APA' },
        { icon: RotateCw, action: () => insertMarkdown('\n`video: https://www.youtube.com/watch?v=xxxx`\n', ''), label: 'Embed Vídeo' },
    ];

    const exportToMarkdown = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manuscrito-${new Date().getTime()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[200] shadow-2xl' : 'h-[600px] shadow-sm'}`}>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {toolbarButtons.map((btn, i) => (
                        btn.type === 'divider' ? (
                            <div key={i} className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
                        ) : (
                            <button
                                key={i}
                                type="button"
                                onClick={btn.action}
                                title={btn.label}
                                className="p-2 text-slate-500 hover:text-brand-blue dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                            >
                                {/* @ts-ignore */}
                                <btn.icon size={18} />
                            </button>
                        )
                    ))}
                </div>

                <div className="flex items-center gap-2 pr-2">
                    <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mr-4">
                        <button
                            type="button"
                            onClick={() => setViewMode('edit')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-slate-700 text-brand-blue shadow-sm' : 'text-slate-400'}`}
                        >
                            <Edit3 size={14} className="inline mr-1" /> Escrita
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-brand-blue shadow-sm' : 'text-slate-400'}`}
                        >
                            <Eye size={14} className="inline mr-1" /> Preview
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'split' ? 'bg-white dark:bg-slate-700 text-brand-blue shadow-sm' : 'text-slate-400'}`}
                        >
                            Split
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={exportToMarkdown}
                        title="Exportar para Markdown"
                        className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
                    >
                        <Download size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Editor Main Area */}
            <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                {/* Input Area */}
                {(viewMode === 'edit' || viewMode === 'split') && (
                    <div className={`h-full flex flex-col ${viewMode === 'split' ? 'w-1/2 border-r border-slate-100 dark:border-slate-800' : 'w-full'}`}>
                        <textarea
                            ref={textAreaRef}
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Inicie o seu manuscrito científico aqui..."
                            className="flex-1 p-8 bg-transparent text-slate-700 dark:text-slate-300 font-serif text-lg leading-relaxed focus:outline-none resize-none custom-scrollbar"
                        />
                    </div>
                )}

                {/* Preview Area */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                    <div className={`h-full overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                        <div className="prose prose-slate dark:prose-invert max-w-none academic-preview">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {content || '*Nenhum conteúdo para pré-visualizar.*'}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] bg-white dark:bg-slate-900">
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-wider">
                    <span>{content.length} caracteres</span>
                    <span>{content.trim().split(/\s+/).length} palavras</span>
                    {lastSaved && <span className="flex items-center gap-1 text-green-500"><Check size={10} /> Auto-guardado: {lastSaved.toLocaleTimeString()}</span>}
                </div>
                <div className="flex items-center gap-2 text-brand-blue/60 group cursor-help">
                    <Info size={12} />
                    <span className="font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Suporte LaTeX & GFM Ativo</span>
                </div>
            </div>
        </div>
    );
};

export default ArticleEditor;
