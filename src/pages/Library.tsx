import React, { useState, useEffect } from 'react';
import {
    Search, Filter, GraduationCap,
    BookOpen, Layers, Globe,
    Calendar, Map,
    CheckCircle2, Info, Loader2,
    Sparkles, FileText, Newspaper, Scroll
} from 'lucide-react';
import libraryService, { Publication } from '../services/libraryService';
import PublicationCard from '../components/library/PublicationCard';
import { useNavigate } from 'react-router-dom';

const Library: React.FC = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    // Filters
    const [filters, setFilters] = useState({
        year: '',
        country: '',
        language: '',
        is_verified: ''
    });

    const navigate = useNavigate();

    const tabs = [
        { id: 'ALL', label: 'Tudo', icon: <Layers size={14} /> },
        { id: 'BOOK', label: 'Livros', icon: <BookOpen size={14} /> },
        { id: 'ARTICLE', label: 'Artigos', icon: <FileText size={14} /> },
        { id: 'JOURNAL', label: 'Revistas', icon: <Newspaper size={14} /> },
        { id: 'THESIS', label: 'Teses', icon: <GraduationCap size={14} /> },
        { id: 'TFC', label: 'TFC', icon: <Scroll size={14} /> },
        { id: 'AFRICAN_CONTEXT', label: 'Contexto Africano', icon: <Globe size={14} /> },
    ];

    useEffect(() => {
        fetchPublications();
    }, [activeTab, filters]);

    const fetchPublications = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (activeTab !== 'ALL') params.type = activeTab;
            if (filters.year) params.year = filters.year;
            if (filters.country) params.country = filters.country;
            if (filters.language) params.language = filters.language;
            if (filters.is_verified) params.is_verified = filters.is_verified === 'true';
            if (search) params.search = search;

            const data = await libraryService.getPublications(params);
            setPublications(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Error fetching publications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPublications();
    };

    const handleView = (pub: Publication) => {
        navigate(`/biblioteca/${pub.slug}`);
    };

    const handleDownload = async (pub: Publication) => {
        try {
            const { download_url } = await libraryService.recordDownload(pub.slug);
            window.open(download_url, '_blank');
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            {/* Hero Section - Academic & Modern */}
            <section className="bg-brand-blue pt-24 pb-32 md:pb-40 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Biblioteca Digital Académica Africana</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter animate-in fade-in slide-in-from-top-6 duration-1000">
                        Sussurros do <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 italic">Saber</span>
                    </h1>

                    <p className="text-blue-100/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 font-serif leading-relaxed animate-in fade-in slide-in-from-top-8 duration-1000">
                        Repositório de conhecimento africano: Livros, revistas, teses e monografias contextualizadas à nossa realidade.
                    </p>

                    {/* Search Bar - Large & Premium */}
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group animate-in fade-in zoom-in duration-1000 delay-300">
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-95 group-focus-within:scale-105 transition-transform duration-500"></div>
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={24} />
                            <input
                                type="text"
                                placeholder="Pesquisar por título, autor ou DOI..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-16 pr-32 py-5 md:py-6 bg-white dark:bg-slate-900 border-none rounded-full outline-none text-slate-900 dark:text-white transition-all text-lg shadow-2xl focus:ring-4 focus:ring-amber-400/20"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 md:px-8 py-3 bg-brand-blue text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg active:scale-95"
                            >
                                Pesquisar
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800 sticky top-32">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Filter size={18} className="text-brand-blue" /> Filtros
                                </h3>
                                <button
                                    onClick={() => setFilters({ year: '', country: '', language: '', is_verified: '' })}
                                    className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline"
                                >
                                    Limpar
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Year */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ano de Publicação</label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters(f => ({ ...f, year: e.target.value }))}
                                        title="Filtrar por ano de publicação"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="">Todos os anos</option>
                                        {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">País de Origem</label>
                                    <select
                                        value={filters.country}
                                        onChange={(e) => setFilters(f => ({ ...f, country: e.target.value }))}
                                        title="Filtrar por país de origem"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="">Todos os países</option>
                                        <option value="Angola">Angola</option>
                                        <option value="Moçambique">Moçambique</option>
                                        <option value="Cabo Verde">Cabo Verde</option>
                                        <option value="Guiné-Bissau">Guiné-Bissau</option>
                                        <option value="São Tomé e Príncipe">São Tomé e Príncipe</option>
                                    </select>
                                </div>

                                {/* Verified */}
                                <div className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                                    <input
                                        type="checkbox"
                                        id="verified"
                                        checked={filters.is_verified === 'true'}
                                        onChange={(e) => setFilters(f => ({ ...f, is_verified: e.target.checked ? 'true' : '' }))}
                                        className="w-5 h-5 rounded-md text-emerald-500 bg-white border-emerald-200 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="verified" className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tight cursor-pointer">
                                        Apenas Verificados
                                    </label>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[24px] border border-blue-100 dark:border-blue-900/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <Info size={16} className="text-brand-blue" />
                                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Ajuda</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-serif">
                                    Não encontra o que procura? <br />
                                    <a href="/#/contact" className="text-brand-blue font-bold hover:underline">Solicite um recurso</a> à nossa equipa editorial.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Listing Area */}
                    <main className="flex-grow">
                        {/* Tabs - Modern & Scrollable */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-2 mb-8 shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto hide-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-3.5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === tab.id
                                        ? 'bg-brand-blue text-white shadow-xl shadow-blue-500/20 active:scale-95'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
                                <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">A carregar biblioteca...</p>
                            </div>
                        ) : publications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {publications.map(pub => (
                                    <PublicationCard
                                        key={pub.id}
                                        publication={pub}
                                        onView={handleView}
                                        onDownload={handleDownload}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 text-center border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sem resultados</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-serif max-w-sm mx-auto mb-8">
                                    Não encontramos nenhuma publicação com estes critérios. Tente limpar os filtros ou usar outros termos de pesquisa.
                                </p>
                                <button
                                    onClick={() => { setSearch(''); setFilters({ year: '', country: '', language: '', is_verified: '' }); setActiveTab('ALL'); }}
                                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Limpar tudo
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Library;
