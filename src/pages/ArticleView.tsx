
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import {
  ArrowLeft, Calendar, User, Clock, Share2, Award,
  Bookmark, Heart, ArrowUp, ListTodo, Loader2,
  Check, Hash, ChevronRight, X, MessageSquare, Send,
  Copy, MessageCircle, Facebook, Twitter, Linkedin,
  FileText, PlusCircle, ExternalLink, AlertCircle, Sparkles
} from 'lucide-react';
import { Article, Comment, Footnote, FootnoteType } from '../types';
import SimpleMarkdown from '../components/ui/SimpleMarkdown';
import { useTranslation } from 'react-i18next';

const ArticleView: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const [article, setArticle] = useState<Article | undefined>(location.state as Article);
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(!location.state);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isToCOpen, setIsToCOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const lastScrollY = useRef(0);

  // Notas de Rodapé
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [isFootnoteModalOpen, setIsFootnoteModalOpen] = useState(false);
  const [footnoteType, setFootnoteType] = useState<FootnoteType>('correction');
  const [footnoteContent, setFootnoteContent] = useState('');
  const [footnoteRefText, setFootnoteRefText] = useState('');
  const [isSubmittingFootnote, setIsSubmittingFootnote] = useState(false);
  const [footnoteFeedback, setFootnoteFeedback] = useState(false);

  // Glossário Interativo
  const [glossaryTerms, setGlossaryTerms] = useState<{ term: string; definition: string }[]>([]);
  const [isGlossaryLoading, setIsGlossaryLoading] = useState(false);
  const [isGlossaryActive, setIsGlossaryActive] = useState(false);


  // Form de comentários
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Dados para partilha
  const baseUrl = window.location.href.split('#')[0];
  const shareUrl = `${baseUrl}#/article/${id}`;
  const shareTitle = article ? encodeURIComponent(article.title) : '';
  const encodedUrl = encodeURIComponent(shareUrl);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  // Mapear cabeçalhos para o Sumário Dinâmico
  const headings = useMemo(() => {
    if (!article?.content) return [];
    return article.content.split('\n')
      .filter(line => line.trim().startsWith('## '))
      .map(line => line.replace('## ', '').trim());
  }, [article?.content]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      const fetchedArticle = await storageService.getArticleById(id);
      if (fetchedArticle) {
        setArticle(fetchedArticle);
        setIsLoading(false); // Show article as soon as it's available

        // Fetch secondary data in parallel
        Promise.all([
          apiService.getRecommendedArticles(id),
          storageService.getArticleComments(id),
          storageService.getArticleFootnotes(id)
        ]).then(([recs, artComments, artFootnotes]) => {
          setRecommendations(recs);
          setComments(artComments);
          setFootnotes(artFootnotes);
        }).catch(err => console.error("Error fetching secondary data:", err));

        const interactions = storageService.getUserInteractions();
        setIsLiked(interactions.likedArticles.includes(String(id)));

        // Robust check: Check if either the current ID (param) or the Article's official Slug/ID is bookmarked
        const isBookmarkedByID = interactions.bookmarkedArticles.includes(String(id));
        const isBookmarkedBySlug = fetchedArticle.slug ? interactions.bookmarkedArticles.includes(fetchedArticle.slug) : false;
        const isBookmarkedByArticleID = interactions.bookmarkedArticles.includes(String(fetchedArticle.id));

        setIsBookmarked(isBookmarkedByID || isBookmarkedBySlug || isBookmarkedByArticleID);
      } else {
        setIsLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.setProperty('--scroll-width', `${progress}%`);
      }

      const currentScrollY = window.scrollY;

      // Smart Scroll Logic:
      // 1. Hide if at the very top (< 100px)
      // 2. Hide if scrolling DOWN (reading mode)
      // 3. Show if scrolling UP (navigation mode) AND we are not at the top

      if (currentScrollY < 100) {
        setShowFloatingBar(false);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling DOWN
        setShowFloatingBar(false);
      } else {
        // Scrolling UP
        setShowFloatingBar(true);
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    const liked = await storageService.toggleLike(id);
    setIsLiked(liked);
  };

  const handleBookmark = async () => {
    // Prefer using the official slug/ID from the loaded article to ensure consistency
    const targetId = article?.slug || id;
    if (!targetId) return;

    const bookmarked = await storageService.toggleBookmark(targetId);
    setIsBookmarked(bookmarked);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentName.trim() || !commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await storageService.addComment(id, commentName, commentText);
      setCommentName('');
      setCommentText('');
      setComments(prev => [newComment, ...prev]);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFootnoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !footnoteContent.trim()) return;
    setIsSubmittingFootnote(true);
    try {
      await storageService.submitFootnoteSuggestion(
        id,
        commentName || 'Leitor Anónimo',
        footnoteContent,
        footnoteType,
        footnoteRefText
      );
      setFootnoteContent('');
      setFootnoteRefText('');
      setFootnoteFeedback(true);
      setTimeout(() => {
        setFootnoteFeedback(false);
        setIsFootnoteModalOpen(false);
      }, 3000);
    } catch (err) {
      console.error('Erro ao sugerir nota:', err);
    } finally {
      setIsSubmittingFootnote(false);
    }
  };

  const handleActivateGlossary = async () => {
    if (!article?.content || isGlossaryActive) return;
    setIsGlossaryLoading(true);
    try {
      const terms = await apiService.getGlossaryTerms(article.content);
      setGlossaryTerms(terms);
      setIsGlossaryActive(true);
    } catch (error) {
      console.error("Failed to load glossary:", error);
    } finally {
      setIsGlossaryLoading(false);
    }
  };

  const scrollToSection = (title: string) => {
    const slug = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    const element = document.getElementById(slug);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setIsToCOpen(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>;
  if (!article) return <div className="min-h-screen flex items-center justify-center">{t('common.manuscript_not_found')}</div>;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-40 transition-colors duration-300">

      <div className="fixed top-0 left-0 w-full h-1 z-[110] pointer-events-none shadow-sm">
        <div
          ref={progressBarRef}
          className="scroll-progress-bar bg-brand-accent dark:bg-green-400"
        />
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2.5 px-6 sticky top-0 z-40 no-print">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-brand-blue dark:text-blue-400 font-black text-[10px] uppercase tracking-tight hover:underline">
            <ArrowLeft size={14} /> {t('article.portal_link')}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <article className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12 relative">
          <div className="p-8 md:p-12 lg:p-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="open-access-badge">Acesso Livre</span>
                <Link to={`/?cat=${encodeURIComponent(article.category)}`} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-brand-blue transition-colors">
                  {article.category}
                </Link>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-brand-blue dark:text-white leading-[1.1] mb-8 tracking-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
              <Link to={`/author/${encodeURIComponent(article.author_username || article.author)}`} className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 hover:text-brand-blue transition-colors">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                  {article.authorAvatarUrl ? (
                    <img src={article.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} />
                  )}
                </div>
                {article.author}
              </Link>
              {article.author_badges && article.author_badges.map((badge: any, i: number) => (
                <span key={i} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${badge.type === 'verified' ? 'bg-blue-50 text-brand-blue border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`} title={badge.label}>
                  <Award size={10} /> {badge.label}
                </span>
              ))}
              <div className="flex items-center gap-2.5"><Calendar size={14} /> {article.date}</div>
              <div className="flex items-center gap-2.5"><Clock size={14} /> {article.readTime} min de leitura</div>
              <div className="hidden md:block ml-auto font-mono text-[10px] opacity-40">DOI: 10.3390/ss{article.id}</div>
            </div>


            <div className={`prose prose-slate dark:prose-invert max-w-none ${isGlossaryActive ? 'glossary-active' : ''}`}>
              <SimpleMarkdown content={article.content || ''} glossaryTerms={glossaryTerms} />
            </div>

            <div className="mt-6 mb-8 flex justify-end">
              {!isGlossaryActive ? (
                <button
                  onClick={handleActivateGlossary}
                  disabled={isGlossaryLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  {isGlossaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {t('article.activate_glossary')}
                </button>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  <Check size={14} /> {t('article.glossary_active')}
                </span>
              )}
            </div>

            {footnotes.length > 0 && (
              <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-brand-blue">
                <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={14} /> {t('article.footnotes_title')}
                </h4>
                <div className="space-y-4">
                  {footnotes.map((fn, idx) => (
                    <div key={fn.id} className="text-sm">
                      <span className="font-bold text-brand-blue mr-2">[{idx + 1}]</span>
                      <span className="text-slate-600 dark:text-slate-300 font-serif leading-relaxed italic">
                        {fn.content}
                      </span>
                      {fn.referenceText && (
                        <p className="text-[10px] text-slate-400 mt-1">Ref: "{fn.referenceText}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setIsFootnoteModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue hover:border-brand-blue transition-all shadow-sm"
              >
                <PlusCircle size={14} /> {t('article.suggest_footnote')}
              </button>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <Hash size={12} className="text-brand-blue" /> Indexação de Temas
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.tags?.map(tag => (
                  <Link
                    key={tag}
                    to={`/?tag=${encodeURIComponent(tag)}`}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-brand-blue hover:text-white text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Scientific SEO: ScholarlyArticle JSON-LD */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ScholarlyArticle",
              "headline": article.title,
              "abstract": article.excerpt,
              "image": article.imageUrl,
              "author": {
                "@type": "Person",
                "name": article.author
              },
              "publisher": {
                "@type": "Organization",
                "name": "Sussurros do Saber",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://sussurrosdosaber.pt/logo.png"
                }
              },
              "datePublished": article.date,
              "identifier": `10.3390/ss${article.id}`
            })}
          </script>
        </article>

        <section ref={commentSectionRef} className="mb-16 scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
              <MessageSquare size={20} className="text-brand-blue" /> {t('article.debate_space')} ({comments.length})
            </h2>
            <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <form onSubmit={handleCommentSubmit} className="space-y-5">
              <input
                required
                type="text"
                placeholder="Seu Nome ou Nome da Organização"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-sm"
              />
              <textarea
                required
                placeholder="Contribute com a sua reflexão crítica ou comentário sobre o manuscrito..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all h-28 resize-none font-serif text-base leading-relaxed"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95"
              >
                {isSubmittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Publicar Reflexão
              </button>
            </form>
          </div>

          <div className="space-y-5">
            {comments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px]">
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">{t('article.no_comments')}</p>
              </div>
            ) : comments.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-black text-brand-blue dark:text-blue-400 text-xs">
                    {c.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{c.author}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(c.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic text-base">"{c.content}"</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('article.suggested_readings')}</h2>
            <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <Link key={rec.id} to={`/article/${rec.slug}`} className="group bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all flex flex-col h-full">
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-slate-100 relative">
                  <img src={rec.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-brand-blue transition-colors line-clamp-2 mb-3">
                  {rec.title}
                </h3>
                <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    {rec.category}
                  </span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className={`fixed bottom-10 right-6 md:right-12 z-[100] no-print transition-all duration-500 ease-in-out ${showFloatingBar ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#020617]/95 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-8">

          <button
            onClick={handleLike}
            className={`group relative transition-all hover:scale-110 active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-300 hover:text-white'}`}
            title={t('article.like')}
          >
            <Heart size={22} className={isLiked ? 'fill-current animate-in zoom-in-50' : ''} />
          </button>

          <button
            onClick={() => commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="text-slate-300 hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
            title={t('article.go_to_comments')}
          >
            <MessageSquare size={22} />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsToCOpen(!isToCOpen)}
              className={`transition-all hover:scale-110 active:scale-95 ${isToCOpen ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}
              title="Sumário de Navegação"
            >
              <ListTodo size={22} />
            </button>

            {isToCOpen && (
              <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-5 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-4 border-b dark:border-slate-800 pb-2.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{t('article.quick_nav')}</span>
                  <button onClick={() => setIsToCOpen(false)} title="Fechar sumário" className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  <button
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsToCOpen(false); }}
                    className="w-full text-left text-[9px] font-black uppercase text-brand-blue hover:text-brand-dark transition-colors tracking-tighter"
                  >
                    {t('article.top_of_manuscript')}
                  </button>
                  {headings.length > 0 ? headings.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSection(h)}
                      className="w-full text-left text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors line-clamp-2 border-l-2 border-transparent hover:border-brand-blue pl-3 py-1"
                    >
                      {h}
                    </button>
                  )) : <p className="text-[10px] text-slate-400 italic">{t('article.no_sections')}</p>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBookmark}
            className={`transition-all hover:scale-110 active:scale-95 ${isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-white'}`}
            title={t('nav.favorites')}
          >
            <Bookmark size={22} className={isBookmarked ? 'fill-current animate-in zoom-in-50' : ''} />
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-slate-300 hover:text-white transition-all hover:scale-110 active:scale-95"
            title={t('article.share_manuscript')}
          >
            <Share2 size={22} />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-slate-300 hover:text-white transition-all hover:scale-110 active:scale-95"
            title={t('article.back_to_top')}
          >
            <ArrowUp size={22} />
          </button>
        </div>
      </div>

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
                <Share2 size={14} className="text-brand-blue" /> {t('article.share_title')}
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                title="Fechar partilha"
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95"
              >
                <X size={18} />
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
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter group-hover/icon:text-brand-blue transition-colors text-center">{social.name}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('article.copy_link')}</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`shrink-0 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${copyFeedback ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-brand-blue text-white hover:bg-brand-dark shadow-blue-500/20'} shadow-lg`}
                  >
                    {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                    {copyFeedback ? t('article.copied') : t('article.copy_link')}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                "{t('article.share_quote')}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footnote Modal */}
      {isFootnoteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFootnoteModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[24px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 sticky top-0 z-20 backdrop-blur-md">
              <h3 className="font-black text-brand-blue dark:text-blue-400 uppercase tracking-tight text-[10px] flex items-center gap-2">
                <PlusCircle size={14} /> {t('article.footnote_modal_title')}
              </h3>
              <button
                onClick={() => setIsFootnoteModalOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95"
                title="Fechar modal"
              >
                <X size={18} />
              </button>            </div>

            <div className="p-4">
              {footnoteFeedback ? (
                <div className="text-center py-6 animate-in zoom-in">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={24} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t('article.footnote_sent')}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-serif lowercase italic">{t('article.footnote_sent_desc')}</p>
                </div>
              ) : (
                <form onSubmit={handleFootnoteSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('article.contribution_type')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['correction', 'supplementary_link', 'insight'] as FootnoteType[]).map(fType => (
                        <button
                          key={fType}
                          type="button"
                          onClick={() => setFootnoteType(fType)}
                          className={`px-1 py-2 rounded-lg border text-[7px] font-black uppercase tracking-tighter transition-all ${footnoteType === fType ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-brand-blue'}`}
                          title={`Selecionar tipo: ${fType}`}
                        >
                          {fType === 'correction' ? t('article.correction') : fType === 'supplementary_link' ? t('article.extra_link') : t('article.insight')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('article.reference_text')}</label>
                    <input
                      type="text"
                      placeholder="Ex: No segundo parágrafo sobre..."
                      value={footnoteRefText}
                      onChange={e => setFootnoteRefText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all text-[11px] font-serif"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('article.note_content')}</label>
                    <textarea
                      required
                      placeholder="Descreva a sua sugestão ou forneça o link complementar..."
                      value={footnoteContent}
                      onChange={e => setFootnoteContent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all h-20 resize-none text-[11px] font-serif"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFootnote}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSubmittingFootnote ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    {t('article.submit_review')}
                  </button>
                </form>
              )}
            </div>

            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800">
              <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertCircle size={9} /> {t('article.academic_only')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleView;
