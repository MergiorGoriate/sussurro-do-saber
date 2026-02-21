
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';
import { Article } from '../../types';

// Simple memory cache to avoid redundant fetches if multiple instances of this component mount (mobile & desktop)
let trendingCache: Article[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute

const TrendingArticles: React.FC = () => {
    const { t } = useTranslation();
    const [trending, setTrending] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            const now = Date.now();
            if (trendingCache && (now - lastFetchTime < CACHE_DURATION)) {
                console.log("TrendingArticles: Using cached data");
                setTrending(trendingCache);
                setIsLoading(false);
                return;
            }

            console.log("TrendingArticles: Starting fetch...");
            try {
                // 1. Try weekly trending (best for "Most Read")
                let data = await apiService.fetchTrending('week', 5);
                console.log("TrendingArticles: Weekly data fetched:", data.length);

                // 2. Fallback to daily trending if weekly is empty (common in dev/new sites)
                if (data.length === 0) {
                    console.log("TrendingArticles: Falling back to daily trending...");
                    data = await apiService.fetchTrending('today', 5);
                }

                // 3. Fallback to general articles if still empty (ensures UI is always visible)
                if (data.length === 0) {
                    console.log("TrendingArticles: Falling back to latest articles...");
                    const all = await apiService.getArticles();
                    data = all.slice(0, 5);
                }

                trendingCache = data;
                lastFetchTime = Date.now();
                setTrending(data);
            } catch (error) {
                console.error('TrendingArticles: Failed to fetch:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-6 text-brand-blue dark:text-blue-400">
                    <TrendingUp size={20} />
                    <h2 className="text-sm font-black uppercase tracking-widest">{t('home.most_read')}</h2>
                </div>
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
            </div>
        );
    }

    // Always render something to help the user identify where the section is
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-brand-blue dark:text-blue-400">
                <TrendingUp size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">{t('home.most_read')}</h2>
            </div>

            {trending.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('home.no_articles')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {trending.map((article, index) => (
                        <Link
                            key={article.id}
                            to={`/article/${article.slug}`}
                            className="group flex gap-4 items-start"
                        >
                            <span className="text-2xl font-black text-slate-100 dark:text-slate-800 group-hover:text-brand-blue/20 transition-colors leading-none pt-1 shrink-0">
                                0{index + 1}
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors mb-1.5">
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <span className="text-brand-blue dark:text-blue-400/70">{article.category}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {article.readTime} min
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Link
                to="/?tab=popular"
                className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors group"
            >
                <span>Ver ranking completo</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default TrendingArticles;
