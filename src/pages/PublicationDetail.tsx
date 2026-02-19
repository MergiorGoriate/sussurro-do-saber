import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Download, Eye, Quote,
    Calendar, Globe, MapPin, Building,
    CheckCircle2, Share2, Loader2,
    ChevronRight, Info, BookOpen,
    FileText, Newspaper, GraduationCap,
    Scroll
} from 'lucide-react';
import libraryService, { Publication } from '../services/libraryService';
import { toast } from 'sonner';

const PublicationDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [publication, setPublication] = useState<Publication | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchPublication();
            libraryService.recordView(slug);
        }
    }, [slug]);

    const fetchPublication = async () => {
        setLoading(true);
        try {
            if (slug) {
                const data = await libraryService.getPublication(slug);
                setPublication(data);
            }
        } catch (error) {
            console.error('Error fetching publication:', error);
            toast.error('Erro ao carregar publicação.');
        } finally {
            setLoading(false);
        }
    };

    const handleCitar = () => {
        if (!publication) return;
        const authorsStr = publication.authors.map(a => a.name).join(', ');
        const citation = `${authorsStr} (${publication.year}). ${publication.title}. ${publication.institution?.name || ''}. DOI: ${publication.doi_internal}`;
        navigator.clipboard.writeText(citation);
        toast.success('Citação APA copiada!');
    };

    const handleDownload = async () => {
        if (!publication) return;
        try {
            const { download_url } = await libraryService.recordDownload(publication.slug);
            window.open(download_url, '_blank');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Erro ao processar download.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">A abrir documento...</p>
            </div>
        );
    }

    if (!publication) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Info size={32} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Documento não encontrado</h2>
                <button onClick={() => navigate('/biblioteca')} className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                    Voltar à Biblioteca
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Header / Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                <button
                    onClick={() => navigate('/biblioteca')}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-blue transition-colors font-black text-[10px] uppercase tracking-widest mb-12"
                >
                    <ArrowLeft size={14} /> Voltar à Biblioteca
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Info */}
                    <div className="flex-grow space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-blue/20">
                                    {publication.type}
                                </span>
                                {publication.is_verified && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                                        <CheckCircle2 size={12} /> Verificado
                                    </span>
                                )}
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {publication.year} • {publication.language}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                {publication.title}
                            </h1>
                        </div>

                        {/* Abstract */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Resumo Académico</h3>
                            <p className="text-lg text-slate-700 dark:text-slate-300 font-serif leading-relaxed text-justify">
                                {publication.abstract}
                            </p>
                        </div>

                        {/* Keywords */}
                        <div className="flex flex-wrap gap-2">
                            {publication.keywords.map(tag => (
                                <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* PDF Viewer - Premium Embet */}
                        <div className="bg-slate-200 dark:bg-slate-800 rounded-[32px] overflow-hidden aspect-[4/5] md:aspect-video shadow-2xl relative group border-4 border-white dark:border-slate-900">
                            <iframe
                                src={`${publication.pdf_file}#toolbar=0`}
                                className="w-full h-full"
                                title={publication.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Sidebar Actions & Metadata */}
                    <aside className="lg:w-96 shrink-0 space-y-8">
                        {/* Quick Actions Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6 sticky top-32">
                            <div className="space-y-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                >
                                    <Download size={18} /> Baixar PDF
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleCitar}
                                        className="flex items-center justify-center gap-2 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all"
                                    >
                                        <Quote size={14} /> Citar
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all">
                                        <Share2 size={14} /> Partilhar
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                <div className="text-center border-r border-slate-200 dark:border-slate-700">
                                    <span className="block text-2xl font-black text-slate-900 dark:text-white">{publication.views_count}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leituras</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-slate-900 dark:text-white">{publication.downloads_count}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Downloads</span>
                                </div>
                            </div>

                            {/* Metadata List */}
                            <div className="space-y-6 pt-4">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 text-brand-blue rounded-xl h-fit">
                                        <Building size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instituição</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{publication.institution?.name || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-xl h-fit">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Geografia</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{publication.province ? `${publication.province}, ` : ''}{publication.country}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-xl h-fit">
                                        <Globe size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identificador DOI</span>
                                        <span className="text-[11px] font-mono font-bold text-brand-blue">{publication.doi_internal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PublicationDetail;
