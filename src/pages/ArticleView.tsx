
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import {
  ArrowLeft, Calendar, User, Clock, Share2,
  Bookmark, Heart, ArrowUp, ListTodo, Loader2,
  Check, Hash, ChevronRight, X, MessageSquare, Send,
  Copy, MessageCircle, Facebook, Twitter, Linkedin,
  FileText, PlusCircle, ExternalLink, AlertCircle, Sparkles
} from 'lucide-react';
import { Article, Comment, Footnote, FootnoteType } from '../types';
import SimpleMarkdown from '../components/ui/SimpleMarkdown';

const ArticleView: React.FC = () => {
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

  // Sumário AI
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

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

        const recs = await apiService.getRecommendedArticles(id);
        setRecommendations(recs);

        const artComments = await storageService.getArticleComments(id);
        setComments(artComments);

        const artFootnotes = await storageService.getArticleFootnotes(id);
        setFootnotes(artFootnotes);

        const interactions = storageService.getUserInteractions();
        setIsLiked(interactions.likedArticles.includes(id));
        setIsBookmarked(interactions.bookmarkedArticles.includes(id));

        // Gerar Sumário AI automaticamente
        if (fetchedArticle.content) {
          setIsSummaryLoading(true);
          apiService.getArticleSummary(fetchedArticle.content).then(summary => {
            setAiSummary(summary);
            setIsSummaryLoading(false);
          });
        }
      }
      setIsLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      if (progressBarRef.current) {
        progressBarRef.current.style.setProperty('--scroll-width', `${progress}%`);
      }
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
    if (!id) return;
    const bookmarked = await storageService.toggleBookmark(id);
    setIsBookmarked(bookmarked);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentName.trim() || !commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await storageService.addComment(id, commentName, commentText);
      setCommentName('');
      setCommentText('');
      const updated = await storageService.getComments();
      const articleComments = updated.filter(c => c.articleId === id);
      setComments(articleComments);
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
  if (!article) return <div className="min-h-screen flex items-center justify-center">Manuscrito não encontrado.</div>;

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
            <ArrowLeft size={14} /> Portal do Saber
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <article className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12 relative">
          <div className="p-8 md:p-12 lg:p-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="open-access-badge">Open Access</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{article.category}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-brand-blue dark:text-white leading-[1.1] mb-8 tracking-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
              <Link to={`/author/${encodeURIComponent(article.author)}`} className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 hover:text-brand-blue transition-colors">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                  {article.authorAvatarUrl ? (
                    <img src={article.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} />
                  )}
                </div>
                {article.author}
              </Link>
              <div className="flex items-center gap-2.5"><Calendar size={14} /> {article.date}</div>
              <div className="flex items-center gap-2.5"><Clock size={14} /> {article.readTime} min read</div>
              <div className="hidden md:block ml-auto font-mono text-[10px] opacity-40">DOI: 10.3390/ss{article.id}</div>
            </div>

            {/* AI SUMMARY SECTION */}
            {(isSummaryLoading || aiSummary) && (
              <div className="mb-10 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-brand-blue dark:text-blue-400" size={16} />
                  <span className="text-[10px] font-black text-brand-blue dark:text-blue-400 uppercase tracking-widest">Resumo Executivo AI</span>
                  {isSummaryLoading && <Loader2 className="animate-spin text-brand-blue ml-auto" size={12} />}
                </div>
                {isSummaryLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-blue-100 dark:bg-blue-800/30 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-blue-100 dark:bg-blue-800/30 rounded-full w-full animate-pulse"></div>
                    <div className="h-3 bg-blue-100 dark:bg-blue-800/30 rounded-full w-5/6 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-sm font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed custom-markdown-summary">
                    <SimpleMarkdown content={aiSummary} />
                  </div>
                )}
              </div>
            )}

            <div className={`prose prose-slate dark:prose-invert max-w-none ${isGlossaryActive ? 'glossary-active' : ''}`}>
              <SimpleMarkdown content={article.content} glossaryTerms={glossaryTerms} />
            </div>

            <div className="mt-6 mb-8 flex justify-end">
              {!isGlossaryActive ? (
                <button
                  onClick={handleActivateGlossary}
                  disabled={isGlossaryLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  {isGlossaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Ativar Glossário AI
                </button>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  <Check size={14} /> Glossário Ativo
                </span>
              )}
            </div>

            {footnotes.length > 0 && (
              <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-brand-blue">
                <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={14} /> Notas de Rodapé Colaborativas
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
                <PlusCircle size={14} /> Sugerir Correção ou Nota
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
        </article>

        <section ref={commentSectionRef} className="mb-16 scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
              <MessageSquare size={20} className="text-brand-blue" /> Espaço de Debate ({comments.length})
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
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Inicie o debate partilhando a sua opinião.</p>
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
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Leituras Sugeridas</h2>
            <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <Link key={rec.id} to={`/article/${rec.id}`} className="group bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all flex flex-col h-full">
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

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] no-print">
        <div className="bg-[#020617]/95 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-8">

          <button
            onClick={handleLike}
            className={`group relative transition-all hover:scale-110 active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-300 hover:text-white'}`}
            title="Gostar"
          >
            <Heart size={22} className={isLiked ? 'fill-current animate-in zoom-in-50' : ''} />
          </button>

          <button
            onClick={() => commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="text-slate-300 hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
            title="Ir para os Comentários"
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
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Navegação Rápida</span>
                  <button onClick={() => setIsToCOpen(false)} title="Fechar sumário" className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  <button
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsToCOpen(false); }}
                    className="w-full text-left text-[9px] font-black uppercase text-brand-blue hover:text-brand-dark transition-colors tracking-tighter"
                  >
                    Topo do Manuscrito
                  </button>
                  {headings.length > 0 ? headings.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSection(h)}
                      className="w-full text-left text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors line-clamp-2 border-l-2 border-transparent hover:border-brand-blue pl-3 py-1"
                    >
                      {h}
                    </button>
                  )) : <p className="text-[10px] text-slate-400 italic">Nenhuma secção disponível.</p>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBookmark}
            className={`transition-all hover:scale-110 active:scale-95 ${isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-white'}`}
            title="Guardar como Favorito"
          >
            <Bookmark size={22} className={isBookmarked ? 'fill-current animate-in zoom-in-50' : ''} />
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-slate-300 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Partilhar Manuscrito"
          >
            <Share2 size={22} />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-slate-300 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Voltar ao Topo"
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

          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-2">
                <Share2 size={14} className="text-brand-blue" /> Disseminar Conhecimento
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                title="Fechar partilha"
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
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

      {/* Footnote Modal */}
      {isFootnoteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFootnoteModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-black text-brand-blue dark:text-blue-400 uppercase tracking-tight text-xs flex items-center gap-2">
                <PlusCircle size={16} /> Debate Académico: Sugerir Nota
              </h3>
              <button onClick={() => setIsFootnoteModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors" title="Fechar modal"><X size={20} /></button>
            </div>

            <div className="p-8">
              {footnoteFeedback ? (
                <div className="text-center py-10 animate-in zoom-in">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Sugestão Enviada!</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-serif lowercase italic">Sua contribuição será analisada pela equipa editorial e aparecerá no manuscrito após aprovação.</p>
                </div>
              ) : (
                <form onSubmit={handleFootnoteSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Contribuição</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['correction', 'supplementary_link', 'insight'] as FootnoteType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFootnoteType(t)}
                          className={`px-3 py-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${footnoteType === t ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-brand-blue'}`}
                          title={`Selecionar tipo: ${t}`}
                        >
                          {t === 'correction' ? 'Correção' : t === 'supplementary_link' ? 'Link Extra' : 'Insight'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trecho de Referência (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: No segundo parágrafo sobre..."
                      value={footnoteRefText}
                      onChange={e => setFootnoteRefText(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all text-sm font-serif"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo da Nota</label>
                    <textarea
                      required
                      placeholder="Descreva a sua sugestão ou forneça o link complementar..."
                      value={footnoteContent}
                      onChange={e => setFootnoteContent(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all h-32 resize-none text-sm font-serif"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFootnote}
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSubmittingFootnote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Submeter para Revisão
                  </button>
                </form>
              )}
            </div>

            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertCircle size={12} /> Apenas contribuições académicas serão aceites
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleView;
