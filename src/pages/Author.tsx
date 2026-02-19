import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { AUTHOR_DATA } from '../constants';
import ArticleCard from '../components/features/ArticleCard';
import { useFollow } from '../hooks/useFollow';
import { useAuthorRealtime } from '../hooks/useAuthorRealtime';
import AuthModal from '../components/auth/AuthModal';
import {
  User, MapPin, Calendar, Award, BookOpen, Check, MessageSquare,
  X, Send, Loader2, Bell, Instagram, Linkedin
} from 'lucide-react';
import { Article } from '../types';

const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;
    const delta = Math.abs(value - startValueRef.current);
    const isSmallChange = delta < 10;
    const duration = isSmallChange ? 600 : 2500;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const newValue = startValueRef.current + (value - startValueRef.current) * ease;
      setDisplayValue(newValue);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  const format = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return Math.floor(n).toLocaleString();
  };

  return (
    <div className="flex flex-col items-center group cursor-default p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors w-full sm:w-32" title={`${Math.floor(displayValue)} ${label}`}>
      <span className="block text-2xl md:text-3xl font-black text-brand-blue dark:text-white transition-colors mb-1">{format(displayValue)}</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{label}</span>
    </div>
  );
};

const Author: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || '');

  // Mensagem Modal State
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgText, setMsgText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  const [authorArticles, setAuthorArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // State para o perfil
  const [profileData, setProfileData] = useState<any>(null);

  // Use new hook
  const { isFollowing, loading: isFollowLoading, handleFollow, isAuthModalOpen, closeAuthModal, onAuthSuccess } = useFollow(decodedName);

  // Auth Token (Simulado ou Real) -> Em app real viria de Context/Redux
  // Por simplicidade, assumimos que o user pode ter um token no localStorage se estiver logado
  const getAuthToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch artigos e perfil em paralelo
      const [articles, profile] = await Promise.all([
        apiService.getArticlesByAuthor(decodedName),
        apiService.getAuthorProfile(decodedName)
      ]);
      setAuthorArticles(articles);
      setProfileData(profile);

      setLoading(false);

    };
    fetchData();
  }, [decodedName]);

  // Fallback se não houver perfil no backend (usa dados básicos)
  const safeProfile = {
    name: profileData?.first_name ? `${profileData.first_name} ${profileData.last_name}`.trim() : decodedName,
    role: profileData?.profile?.scientific_area || 'Investigador',
    location: profileData?.profile?.institution || 'Instituição não informada',
    joinedDate: profileData?.date_joined ? `Membro desde ${new Date(profileData.date_joined).getFullYear()}` : 'Membro da Comunidade',
    bio: profileData?.profile?.bio || `Perfil de investigador de ${decodedName}.`,
    image: profileData?.profile?.photo || null,
    social: {
      instagram: profileData?.profile?.instagram_url, // Se houver no futuro
      linkedin: profileData?.profile?.linkedin_url,
      researchgate: profileData?.profile?.research_gate_url,
      orcid: profileData?.profile?.orcid_url
    },
    stats: {
      articles: authorArticles.length,
      reads: profileData?.stats?.reads || 0,
      followers: profileData?.stats?.followers || 0,
      karma: profileData?.stats?.karma || 0
    },
    badges: profileData?.profile?.badges || []
  };

  // Real-time Stats Hook
  const realtimeStats = useAuthorRealtime(decodedName, {
    views: safeProfile.stats.reads,
    followers: safeProfile.stats.followers,
    karma: safeProfile.stats.karma
  });

  const authorProfile = {
    ...safeProfile,
    stats: {
      ...safeProfile.stats,
      reads: realtimeStats.views ?? safeProfile.stats.reads,
      followers: realtimeStats.followers ?? safeProfile.stats.followers,
      karma: realtimeStats.karma ?? safeProfile.stats.karma
    }
  };

  const handleMessageOpen = () => { setShowMsgModal(true); setMsgSent(false); setMsgText(''); };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    setIsSending(true);
    try {
      // Enviar para API
      // Se user não logado, backend aceita mas precisamos de nome/email.
      // O formulário abaixo foi atualizado para pedir isso se não houver token? 
      // Para simplificar, vamos assumir que o modal pede ou pega do user logado.
      // Vamos adicionar campos ao modal na UI

      await apiService.sendMessageToAuthor(decodedName, {
        name: msgName || 'Leitor Anônimo', // Idealmente viria de input
        email: msgEmail || 'anonimo@leitor.com', // Idealmente viria de input
        message: msgText
      }, getAuthToken() || undefined);

      setMsgSent(true);
      setTimeout(() => { setShowMsgModal(false); }, 2000);
    } catch (error) {
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };
  if (!decodedName) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Autor não encontrado</div>;

  return (
    <div className="min-h-screen bg-brand-light/30 dark:bg-slate-950 transition-colors duration-300 relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
          <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-start">

            {/* NEW AVATAR STYLE - M-CIRCLE */}
            <div className="shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm relative overflow-hidden group">
                {authorProfile.image ? (
                  <img
                    src={authorProfile.image}
                    alt={authorProfile.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-4xl font-black text-brand-blue dark:text-blue-400">
                    {authorProfile.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-grow pt-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  {/* NAME WITH BLUE UNDERLINE AS PER IMAGE */}
                  <div className="flex items-center gap-3">
                    <h1 className="inline-block text-2xl md:text-3xl font-black text-brand-blue dark:text-white tracking-tight border-b-[3px] border-blue-100 dark:border-blue-900/50 pb-1 mb-2">
                      {authorProfile.name}
                    </h1>
                    {authorProfile.badges.map((badge: any, i: number) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${badge.type === 'verified' ? 'bg-blue-50 text-brand-blue border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`} title={badge.label}>
                        <Award size={10} /> {badge.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{authorProfile.role}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      console.log('[AuthorPage] Follow button clicked');
                      handleFollow();
                    }}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transform transition-all duration-300 ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-brand-blue dark:text-blue-400' : 'bg-brand-blue text-white hover:bg-brand-dark shadow-lg shadow-blue-500/10'}`}
                  >
                    {isFollowing ? <><Check size={14} /> Seguindo</> : <><Bell size={14} /> Seguir</>}
                  </button>
                  <button onClick={handleMessageOpen} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                    <MessageSquare size={14} /> Mensagem
                  </button>
                  <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={closeAuthModal}
                    onSuccess={onAuthSuccess}
                    intentText={`Para seguir ${authorProfile.name}, crie a sua conta em segundos.`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight mb-8">
                <div className="flex items-center gap-2"><MapPin size={14} /> {authorProfile.location}</div>
                <div className="flex items-center gap-2"><Calendar size={14} /> {authorProfile.joinedDate}</div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-8 font-serif italic text-lg">
                "{authorProfile.bio}"
              </p>

              <div className="flex items-center gap-3">
                {authorProfile.social.instagram && (
                  <a
                    href={authorProfile.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {authorProfile.social.linkedin && (
                  <a
                    href={authorProfile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 bg-slate-50 dark:bg-slate-800/30 rounded-[32px] p-2 flex flex-col sm:flex-row justify-around border border-slate-100 dark:border-slate-800">
            <AnimatedCounter value={authorProfile.stats.articles} label="Artigos" />
            <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700 my-4"></div>
            <AnimatedCounter value={authorProfile.stats.reads} label="Visualizações" />
            <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700 my-4"></div>
            <AnimatedCounter value={authorProfile.stats.followers} label="Seguidores" />
            <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700 my-4"></div>
            <AnimatedCounter value={authorProfile.stats.karma} label="Reconhecimento" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
            Repositório de Publicações
          </h2>
          <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>
        ) : authorArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
            {authorArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <BookOpen size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">Ainda não existem manuscritos indexados para "{decodedName}".</p>

            <Link to="/" className="inline-block mt-6 text-brand-blue font-black text-xs uppercase hover:underline">Explorar Portal</Link>
          </div>
        )}

      </div>



      {showMsgModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowMsgModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <MessageSquare size={20} className="text-brand-blue" /> Contactar Autor
              </h3>
              <button
                onClick={() => setShowMsgModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Fechar"
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              {msgSent ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-6"><Check size={32} /></div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase">Manuscrito Enviado</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">O autor receberá a sua comunicação em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-6">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Seu Nome</label>
                      <input
                        type="text"
                        value={msgName}
                        onChange={(e) => setMsgName(e.target.value)}
                        placeholder="Ex: João Silva"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none text-slate-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Seu Email</label>
                      <input
                        type="email"
                        value={msgEmail}
                        onChange={(e) => setMsgEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none text-slate-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Assunto ou Mensagem Académica</label>
                    <textarea
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder={`Prezado(a) ${authorProfile.name.split(' ')[0]}, gostaria de discutir...`}
                      className="w-full h-44 p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue transition-all outline-none text-slate-700 dark:text-white font-serif resize-none"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" disabled={isSending} className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10">
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Submeter Comunicação
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Author;
