
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import ArticleCard from '../components/features/ArticleCard';
import NewsletterSection from '../components/features/NewsletterSection';
import {
  Search, Loader2, Database, Globe, TrendingUp,
  Filter, BookOpen, Dna,
  Cpu, FlaskConical, Microscope, HeartPulse,
  Leaf, Sparkles, RefreshCw, Brain, X, Hash, Zap,
  ChevronDown
} from 'lucide-react';
import { Article } from '../types';

const JOURNAL_CATEGORIES = [
  { name: 'Ciência', icon: FlaskConical, textColor: 'text-purple-600' },
  { name: 'Tecnologia', icon: Cpu, textColor: 'text-blue-500' },
  { name: 'Big Data', icon: Database, textColor: 'text-blue-700', isSpecial: true },
  { name: 'Biologia', icon: Dna, textColor: 'text-green-600' },
  { name: 'Astronomia', icon: Microscope, textColor: 'text-indigo-600' },
  { name: 'Saúde e Bem-estar', icon: HeartPulse, textColor: 'text-red-500' },
  { name: 'Sustentabilidade', icon: Leaf, textColor: 'text-emerald-600' },
  { name: 'Psicologia', icon: Brain, textColor: 'text-pink-500' },
  { name: 'Inovação', icon: Zap, textColor: 'text-amber-500' },
];

import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat');
  const searchParam = searchParams.get('search');
  const tagParam = searchParams.get('tag');
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [indexerInsights, setIndexerInsights] = useState<any>(null);
  const [searchInput, setSearchInput] = useState(searchParam || '');
  const [feedTab, setFeedTab] = useState<'recent' | 'popular'>('recent');
  const [visibleCount, setVisibleCount] = useState(6);
  const [fact, setFact] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        // Fetch insights for the loader
        apiService.getIndexerInsights().then(setIndexerInsights).catch(() => { });

        let data = await storageService.getArticles(undefined, categoryParam || undefined);

        if (tagParam) {
          data = data.filter(a => a.tags?.includes(tagParam));
        }

        if (searchParam) {
          const filtered = await apiService.semanticSearch(searchParam, data);
          setArticles(filtered);
        } else {
          setArticles(data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
        setVisibleCount(6); // Reset pagination on filter change
      }
    };
    fetchArticles();
    apiService.getRandomScienceFact().then(setFact);
  }, [categoryParam, searchParam, tagParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput)}`);
    } else {
      navigate('/');
    }
  };

  const sortedArticles = useMemo(() => {
    if (feedTab === 'popular') {
      return [...articles].sort((a, b) => (b.metrics?.viewCount || 0) - (a.metrics?.viewCount || 0));
    }
    return articles;
  }, [articles, feedTab]);

  const displayedArticles = useMemo(() => {
    return sortedArticles.slice(0, visibleCount);
  }, [sortedArticles, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      <section className="bg-brand-blue text-white pt-16 pb-24 md:pt-20 md:pb-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
        <div className="max-w-[1536px] mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent text-white rounded-sm text-[10px] font-black uppercase mb-6 tracking-[0.2em] shadow-lg shadow-green-500/20">
              <Globe size={12} /> Jornal de Partilha Livre
            </div>
            <h1 className="text-3xl md:text-6xl font-black mb-5 tracking-tighter leading-none drop-shadow-sm">
              {t('home.hero_title')}<span className="text-brand-accent">.</span>
            </h1>
            <p className="text-blue-100/80 text-lg md:text-xl font-light mb-10 leading-relaxed max-w-2xl font-serif italic">
              {t('home.hero_subtitle')}
            </p>

            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t('home.search_placeholder')}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-4 px-8 pr-20 rounded-2xl shadow-xl outline-none text-base font-medium border-2 border-transparent focus:border-brand-accent transition-all placeholder:text-slate-400"
              />
              <button type="submit" title="Executar Pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-brand-blue rounded-xl text-white hover:bg-slate-900 transition-colors">
                <Search size={24} />
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-[1536px] mx-auto px-6 py-10">
        {tagParam && (
          <div className="mb-8 p-5 bg-white dark:bg-slate-900 border border-brand-blue/20 rounded-[24px] flex items-center justify-between animate-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-brand-blue"><Hash size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('home.filtered_repo')}</p>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">{t('home.exploring_themes')} <span className="text-brand-blue underline decoration-brand-accent/30 decoration-4">#{tagParam}</span></h3>
              </div>
            </div>
            <button onClick={() => navigate('/')} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase"><X size={18} /> {t('home.clear_filters')}</button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-2 space-y-6 hidden lg:block">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[24px] shadow-sm sticky top-24">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Filter size={12} /> {t('home.study_areas')}
              </h3>
              <nav className="space-y-1">
                {JOURNAL_CATEGORIES.map(cat => (
                  <Link
                    key={cat.name}
                    to={`/?cat=${cat.name}`}
                    className={`group flex items-center justify-between p-2.5 rounded-xl transition-all relative ${categoryParam === cat.name
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-400 font-black'
                      : (cat as any).isSpecial
                        ? 'text-blue-700 bg-blue-50/40 border border-blue-200 hover:bg-blue-50 font-black ring-1 ring-blue-400/20'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg transition-colors ${categoryParam === cat.name
                        ? 'bg-white dark:bg-slate-800 shadow-sm'
                        : (cat as any).isSpecial
                          ? 'bg-white dark:bg-slate-800'
                          : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white'
                        }`}>
                        <cat.icon size={14} className={cat.textColor} />
                      </div>
                      <span className="text-[10px] truncate uppercase tracking-tight">{cat.name}</span>
                    </div>
                    {(cat as any).isSpecial && (
                      <span className="absolute -top-1.5 -right-1 bg-blue-600 text-white text-[6px] font-black px-1 rounded-sm uppercase animate-pulse">Hot</span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between shadow-sm">
              <div className="flex gap-1">
                <button onClick={() => setFeedTab('recent')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${feedTab === 'recent' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>{t('home.recent')}</button>
                <button onClick={() => setFeedTab('popular')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${feedTab === 'popular' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>{t('home.highlights')}</button>
              </div>
              <div className="px-4 text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase flex items-center gap-2 tracking-widest">
                <Database size={12} /> {articles.length} {t('home.articles_count')}
              </div>
            </div>

            <div className="space-y-5">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-700">
                  <div className="relative">
                    <Loader2 className="animate-spin text-brand-blue" size={48} />
                    <Brain className="absolute inset-0 m-auto text-brand-accent animate-pulse" size={20} />
                  </div>
                  <div className="text-center space-y-2">
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] block">Sincronizando Indexador Semântico</span>
                    {indexerInsights && (
                      <div className="max-w-md mx-auto px-10 animate-in slide-in-from-bottom-2 duration-1000">
                        <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest mb-1">Tendências Actuais:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {indexerInsights.trending_topics?.slice(0, 3).map((topic: string) => (
                            <span key={topic} className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : articles.length > 0 ? (
                <>
                  {displayedArticles.map(art => <ArticleCard key={art.id} article={art} />)}

                  {visibleCount < articles.length && (
                    <div className="pt-10 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="bg-brand-blue text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3 group"
                      >
                        {t('home.load_more')}
                        <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-28 text-center bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <BookOpen size={48} className="mx-auto text-slate-100 mb-6" />
                  <h3 className="text-slate-400 text-sm font-black uppercase tracking-widest">{t('home.no_articles')}</h3>
                  <Link to="/" className="text-brand-blue text-xs font-black uppercase hover:underline mt-4 inline-block">{t('home.clear_filters')}</Link>
                </div>
              )}
            </div>
          </main>

          <aside className="lg:col-span-3 space-y-6 hidden xl:block">
            <div className="bg-gradient-to-br from-indigo-700 to-brand-blue p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group border border-white/10">
              <Sparkles className="absolute -top-6 -right-6 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform duration-700" />
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2 text-blue-200">
                <Brain size={14} /> Science Insight
              </h4>
              <p className="text-base font-serif italic leading-relaxed opacity-95">"{fact || 'O conhecimento científico duplica em média a cada 13 anos.'}"</p>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">{t('home.random_fact_source')}</span>
                <button onClick={async () => setFact(await apiService.getRandomScienceFact())} title="Actualizar Insight" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><RefreshCw size={14} /></button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <NewsletterSection />
    </div>
  );
};

export default Home;
