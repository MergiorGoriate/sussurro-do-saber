
import React, { useState } from 'react';
/* Importing Link from react-router-dom to fix missing exported member error */
import { Link } from 'react-router-dom';
import {
  Clock, LockOpen, Quote, Share2, Check, BarChart3,
  ChevronRight, X, Copy, MessageCircle, Facebook,
  Twitter, Send, Linkedin, Bookmark
} from 'lucide-react';
import { Article } from '../../types';
import { storageService } from '../../services/storageService';
import { useTranslation } from 'react-i18next';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { t } = useTranslation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  React.useEffect(() => {
    const checkStatus = () => {
      const interactions = storageService.getUserInteractions();
      const bookmarked = interactions.bookmarkedArticles.includes(String(article.id));
      setIsBookmarked(bookmarked);
    };
    checkStatus();
    window.addEventListener('storage-update', checkStatus);
    return () => window.removeEventListener('storage-update', checkStatus);
  }, [article.id]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await storageService.toggleBookmark(String(article.id));
    setIsBookmarked(result);
  };

  // Fallback image in case the specific Unsplash URL fails
  const fallbackImage = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=60&w=800&auto=format&fit=crop";

  const baseUrl = window.location.href.split('#')[0];
  const shareUrl = `${baseUrl}#/article/${article.slug}`;
  const shareTitle = encodeURIComponent(article.title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      url: `https://api.whatsapp.com/send?text=${shareTitle}%20${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-[#000000]',
      url: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc]',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${shareTitle}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
  ];

  return (
    <>
      <article className="p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-500 group relative">
        <div className="flex flex-col md:flex-row gap-6">

          <div className="md:w-40 shrink-0">
            <Link to={`/article/${article.slug}`} className="block aspect-[4/3] md:aspect-square rounded-[20px] overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={imgError ? fallbackImage : article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </Link>
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="open-access-badge flex items-center gap-1 shadow-sm !py-0.5 !px-2 !text-[8px]">
                <LockOpen size={8} /> Acesso Livre
              </span>
              <Link to={`/?cat=${encodeURIComponent(article.category)}`} className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                {article.category}
              </Link>
            </div>

            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
              <Link to={`/article/${article.slug}`}>
                {article.title}
              </Link>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-serif italic">
              {article.excerpt}
            </p>

            <Link to={`/author/${encodeURIComponent(article.author_username || article.author)}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                {article.authorAvatarUrl ? (
                  <img src={article.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[8px] font-black text-slate-400 uppercase">{article.author.charAt(0)}</div>
                )}
              </div>
              <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{article.author}</span>
            </Link>


            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                <div className="flex items-center gap-1.5" title="Visualizações"><BarChart3 size={12} className="text-blue-500" /> {article.metrics?.viewCount || 0}</div>
                <div className="flex items-center gap-1.5" title="Citações"><Quote size={12} className="text-green-500" /> {article.metrics?.citations || 0}</div>
                <div className="flex items-center gap-1.5"><Clock size={12} className="text-orange-500" /> {article.readTime} min</div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-1.5 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                  title={isBookmarked ? t('article.remove_bookmark') : t('article.add_bookmark')}
                >
                  <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsShareModalOpen(true); }}
                  className="p-1.5 text-slate-400 hover:text-brand-blue transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-slate-800"
                  title="Partilhar"
                >
                  <Share2 size={16} />
                </button>
                <Link to={`/article/${article.slug}`} className="flex items-center gap-1 text-[9px] font-black text-brand-blue dark:text-blue-400 uppercase tracking-widest hover:translate-x-1 transition-transform">
                  Ler <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsShareModalOpen(false)}
          ></div>

          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[24px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-[10px] flex items-center gap-2">
                <Share2 size={14} className="text-brand-blue" /> Disseminar Conhecimento
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                title="Fechar partilha"
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-5 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group/icon"
                    title={social.name}
                  >
                    <div className={`w-12 h-12 ${social.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/icon:scale-110 active:scale-90`}>
                      <social.icon size={22} />
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter group-hover/icon:text-brand-blue transition-colors">{social.name}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Link do Manuscrito</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`shrink-0 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${copyFeedback ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-brand-blue text-white hover:bg-brand-dark shadow-blue-500/20'} shadow-lg`}
                  >
                    {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                    {copyFeedback ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                "O saber só é pleno quando partilhado."
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleCard;
