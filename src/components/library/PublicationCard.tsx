import React, { useState } from 'react';
import {
    BookOpen, Download, Eye, Quote,
    MapPin, CheckCircle2, GraduationCap,
    FileText, Book, Newspaper, Scroll,
    Loader2
} from 'lucide-react';
import { Publication } from '../../services/libraryService';
import { toast } from 'sonner';

interface PublicationCardProps {
    publication: Publication;
    onView: (publication: Publication) => void;
    onDownload: (publication: Publication) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ publication, onView, onDownload }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const getTypeIcon = () => {
        switch (publication.type) {
            case 'BOOK': return <Book className="text-blue-500" />;
            case 'ARTICLE': return <FileText className="text-emerald-500" />;
            case 'JOURNAL': return <Newspaper className="text-amber-500" />;
            case 'THESIS': case 'TFC': case 'MONOGRAPH': return <GraduationCap className="text-purple-500" />;
            case 'MANUAL': return <Scroll className="text-orange-500" />;
            case 'AFRICAN_CONTEXT': return <MapPin className="text-red-500" />;
            default: return <FileText className="text-slate-500" />;
        }
    };

    const getTypeText = () => {
        switch (publication.type) {
            case 'BOOK': return 'Livro';
            case 'ARTICLE': return 'Artigo';
            case 'JOURNAL': return 'Revista';
            case 'THESIS': return 'Tese';
            case 'TFC': return 'TFC';
            case 'MONOGRAPH': return 'Monografia';
            case 'MANUAL': return 'Manual';
            case 'AFRICAN_CONTEXT': return 'Contexto Africano';
            default: return 'Publicação';
        }
    };

    const handleCitar = () => {
        const authorsStr = publication.authors.map(a => a.name).join(', ');
        const citation = `${authorsStr} (${publication.year}). ${publication.title}. ${publication.institution?.name || ''}. DOI: ${publication.doi_internal}`;
        navigator.clipboard.writeText(citation);
        toast.success('Citação APA copiada para a área de transferência!');
    };

    const handleDownloadClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDownloading(true);
        try {
            await onDownload(publication);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div
            onClick={() => onView(publication)}
            className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-full shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden"
        >
            {/* Type Badge */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-all duration-500">
                    {getTypeIcon()}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                        {getTypeText()}
                    </span>
                    {publication.is_verified && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle2 size={10} /> Verificado
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                {publication.title}
            </h3>

            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                {publication.authors.map(a => a.name).join(', ')} • {publication.year}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow leading-relaxed line-clamp-3 font-serif italic">
                {publication.abstract}
            </p>

            {/* Footer Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-50 dark:border-slate-800">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Visualizações</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{publication.views_count}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Downloads</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{publication.downloads_count}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                <button
                    onClick={(e) => { e.stopPropagation(); onView(publication); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50"
                >
                    <Eye size={14} /> Ver
                </button>
                <button
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                >
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Baixar
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleCitar(); }}
                    className="p-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-brand-blue rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-brand-blue/30"
                    title="Citar (APA)"
                >
                    <Quote size={14} />
                </button>
            </div>
        </div>
    );
};

export default PublicationCard;
