
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Menu, X, Brain, Book, Home, Mail, HelpCircle, ArrowRight, Lightbulb, Loader2, Bookmark, Sun, Moon, FileDown, Languages, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storageService';
import { Article } from '../../types';

interface NavbarProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const SuggestionItem: React.FC<{ article: Article; onClick: () => void }> = ({ article, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=40&w=800&auto=format&fit=crop";
  const thumbnailImage = article.imageUrl.includes('unsplash.com')
    ? article.imageUrl.replace(/w=\d+/, 'w=100').replace(/q=\d+/, 'q=40')
    : article.imageUrl;

  return (
    <Link to={`/article/${article.id}`} onClick={onClick} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0 group">
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
        <img src={imgError ? fallbackImage : thumbnailImage} alt="" onError={() => setImgError(true)} className="w-full h-full object-cover" loading="lazy" width="48" height="48" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">{article.title}</span>
        <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-blue/50"></span>{article.category}</span>
      </div>
    </Link>
  );
};

const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => { setIsOpen(!isOpen); if (isMobileSearchOpen) setIsMobileSearchOpen(false); };
  const toggleMobileSearch = () => { setIsMobileSearchOpen(!isMobileSearchOpen); if (isOpen) setIsOpen(false); if (!isMobileSearchOpen) setTimeout(() => mobileSearchRef.current?.focus(), 100); };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      setIsSearching(true);
      setShowSuggestions(true);
      try {
        const allArticles = await storageService.getArticles();
        const filtered = allArticles.filter(article =>
          article.title.toLowerCase().includes(term.toLowerCase()) ||
          article.category.toLowerCase().includes(term.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
      setIsMobileSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const categories = [
    { name: 'Ciência', path: '/?cat=Ciência' }, { name: 'Tecnologia', path: '/?cat=Tecnologia' },
    { name: 'Biologia', path: '/?cat=Biologia' }, { name: 'Astronomia', path: '/?cat=Astronomia' },
    { name: 'Saúde', path: '/?cat=Saúde e Bem-estar' }, { name: 'Psicologia', path: '/?cat=Psicologia' },
    { name: 'História', path: '/?cat=História' }, { name: 'Cultura', path: '/?cat=Cultura' },
    { name: 'Sustentabilidade', path: '/?cat=Sustentabilidade' }, { name: 'Entretenimento', path: '/?cat=Entretenimento' },
    { name: 'Curiosidades', path: '/?cat=Curiosidades' }, { name: 'Fatos Nerd', path: '/?cat=Fatos Nerd' },
  ];

  const SuggestionsList = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (!showSuggestions) return null;

    const desktopClasses = "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200";
    const mobileClasses = "mt-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200";

    return (
      <div className={isMobile ? mobileClasses : desktopClasses}>
        <div className="py-2">
          <h3 className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Sugestões</span>
            {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
          </h3>
          {!isSearching && suggestions.length === 0 && searchTerm.length > 1 && (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">Sem resultados para "{searchTerm}"</div>
          )}
          {suggestions.map((article) => (
            <SuggestionItem key={article.id} article={article} onClick={() => { setShowSuggestions(false); setIsOpen(false); setIsMobileSearchOpen(false); setSearchTerm(''); }} />
          ))}
          {suggestions.length > 0 && (
            <button onClick={handleSearchSubmit} className="w-full text-center py-3 text-xs font-bold text-brand-blue dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-1">Ver todos os resultados <ArrowRight className="w-3 h-3" /></button>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="flex flex-col w-full shadow-sm z-50 sticky top-0 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-900 py-2 md:py-3 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-12 md:h-14">
          <Link to="/" className="flex items-center gap-2 group z-50" onClick={() => { setIsOpen(false); setIsMobileSearchOpen(false); }}>
            <div className="flex items-center gap-2">
              {!logoError ? (
                <img
                  src="https://69697dc3356a14887c615411.imgix.net/logo.png"
                  alt="Logo"
                  className="h-8 md:h-12 w-auto object-contain rounded-lg transition-transform group-hover:scale-110 duration-300 dark:brightness-110"
                  onError={() => setLogoError(true)}
                  width="48"
                  height="48"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="text-brand-blue dark:text-blue-400 transition-transform group-hover:scale-110 duration-300">
                  <Brain className="w-7 h-7 md:w-10 md:h-10 stroke-[1.5]" />
                </div>
              )}
              <span className="font-sans text-xl md:text-2xl font-bold text-brand-blue dark:text-blue-400 tracking-tight group-hover:text-brand-dark dark:group-hover:text-blue-300 transition-colors whitespace-nowrap">
                Sussurros<span className="hidden md:inline"> do Saber</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-bold transition-colors hover:underline decoration-2 underline-offset-4 ${location.pathname === '/' ? 'text-brand-blue dark:text-blue-400 underline' : 'text-gray-700 dark:text-slate-300 hover:text-brand-blue'}`}>{t('nav.home')}</Link>
            <Link to="/about" className={`text-sm font-bold transition-colors hover:underline decoration-2 underline-offset-4 ${location.pathname === '/about' ? 'text-brand-blue dark:text-blue-400 underline' : 'text-gray-700 dark:text-slate-300 hover:text-brand-blue'}`}>{t('nav.about')}</Link>
            <Link to="/contact" className={`text-sm font-bold transition-colors hover:underline decoration-2 underline-offset-4 ${location.pathname === '/contact' ? 'text-brand-blue dark:text-blue-400 underline' : 'text-gray-700 dark:text-slate-300 hover:text-brand-blue'}`}>{t('nav.contact')}</Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center mr-1">
              <button
                onClick={() => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt')}
                className="p-2 flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors uppercase tracking-widest"
                title={i18n.language === 'pt' ? t('accessibility.switch_language_en') : t('accessibility.switch_language_pt')}
                aria-label={i18n.language === 'pt' ? t('accessibility.switch_language_en') : t('accessibility.switch_language_pt')}
              >
                <Languages size={18} />
                <span className="hidden sm:inline">{i18n.language}</span>
              </button>
            </div>
            <button onClick={onToggleTheme} className="p-2 rounded-full text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label={theme === 'dark' ? t('accessibility.switch_theme_light') : t('accessibility.switch_theme_dark')} title={theme === 'dark' ? t('accessibility.switch_theme_light') : t('accessibility.switch_theme_dark')}>
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button onClick={toggleMobileSearch} className={`p-2 rounded-full transition-all duration-300 md:hidden ${isMobileSearchOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100'}`} aria-label={t('accessibility.open_search')} title={t('accessibility.open_search')}><Search size={22} /></button>
            <button onClick={toggleMenu} className={`p-2 rounded-full transition-all duration-300 md:hidden ${isOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100'}`} aria-label={t('accessibility.open_menu')} title={t('accessibility.open_menu')}>{isOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </div>

      {/* Barra de Busca Mobile */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-900 shadow-lg transition-all duration-300 origin-top overflow-visible z-40 ${isMobileSearchOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0 overflow-hidden'}`}>
        <div className="px-4 pb-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input ref={mobileSearchRef} type="text" value={searchTerm} onChange={handleSearchChange} placeholder="O que deseja explorar?" className="w-full bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-500 rounded-xl py-3 pl-12 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue border border-transparent transition-all" autoComplete="off" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5" /></div>
            {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" aria-label={t('accessibility.clear_search')} title={t('accessibility.clear_search')}><X className="w-4 h-4" /></button>}
          </form>
          <div className="mt-2 relative"><SuggestionsList isMobile={true} /></div>
        </div>
      </div>

      <div className="hidden md:block bg-brand-blue dark:bg-slate-900 text-white z-40 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center overflow-visible">
          <div className="flex items-center h-full min-w-0">
            <button className="flex items-center gap-2 text-sm font-bold px-4 lg:px-5 h-full bg-brand-blue dark:bg-slate-900 hover:bg-[#003da0] dark:hover:bg-slate-800 transition-colors group relative focus:outline-none shrink-0">
              <span>{t('nav.subjects')}</span>
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
              <div className="absolute top-full left-0 w-[600px] bg-white dark:bg-slate-900 shadow-2xl rounded-b-xl py-4 hidden group-hover:block z-50 text-gray-800 dark:text-slate-200 border-t-4 border-brand-dark ring-1 ring-black/5">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {categories.map((cat, index) => (
                    <Link key={index} to={cat.path} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-all group/item">
                      <div className="bg-blue-50 dark:bg-slate-800 p-2 rounded-md group-hover/item:bg-white dark:group-hover/item:bg-slate-700 text-brand-blue dark:text-blue-400 transition-colors"><Book className="w-4 h-4" /></div>
                      <span className="font-bold text-gray-700 dark:text-slate-300 group-hover/item:text-brand-blue dark:group-hover/item:text-blue-400">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </button>
            <div className="h-8 w-px bg-blue-400/30 dark:bg-slate-700 mx-2 shrink-0"></div>
            <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar gap-1">
              <Link to="/quiz" className={`px-3 lg:px-4 py-2 text-sm font-bold hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap ${location.pathname === '/quiz' ? 'bg-white/10' : ''}`}>{t('nav.quiz')}</Link>
              <Link to="/educadicas" className={`px-3 lg:px-4 py-2 text-sm font-bold hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap ${location.pathname === '/educadicas' ? 'bg-white/10' : ''}`}>{t('nav.educadicas')}</Link>
              <Link to="/favorites" className={`px-3 lg:px-4 py-2 text-sm font-bold hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${location.pathname === '/favorites' ? 'bg-white/10' : ''}`}><Bookmark size={16} className={location.pathname === '/favorites' ? 'fill-current' : ''} /> {t('nav.favorites')}</Link>
              <Link to="/biblioteca" className={`px-3 lg:px-4 py-2 text-sm font-bold hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${location.pathname === '/biblioteca' ? 'bg-white/10' : ''}`}><Book size={16} /> Biblioteca</Link>
            </div>
          </div>
          <div className="flex items-center relative ml-4 shrink-0" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative block mt-1">
              <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Buscar conteúdos..." className="bg-[#003da0] dark:bg-slate-800 text-white placeholder-blue-300 text-sm rounded-full py-2 pl-4 pr-10 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:text-gray-900 dark:focus:text-white focus:placeholder-gray-500 transition-all w-44 lg:w-64 border border-transparent focus:border-brand-blue" autoComplete="off" />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-blue-300 hover:text-brand-blue transition-colors" aria-label={t('accessibility.search_submit')} title={t('accessibility.search_submit')}><Search className="w-4 h-4" /></button>
            </form>
            <div className="w-full absolute top-full mt-2"><SuggestionsList /></div>
          </div>
        </div>
      </div>

      {/* Menu Sidebar Mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] md:top-[72px] bg-white dark:bg-slate-950 z-40 overflow-y-auto animate-in slide-in-from-right-5 duration-300 ease-out h-[calc(100vh-60px)] pb-20">
          <div className="flex flex-col p-4 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-blue-50/50 dark:bg-slate-900 rounded-xl hover:bg-blue-50 active:scale-95 transition-all text-center"><div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2"><Home className="w-6 h-6 text-brand-blue dark:text-blue-400" /></div><span className="text-lg font-bold text-gray-800 dark:text-slate-200">Início</span></Link>
              <Link to="/quiz" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-purple-50/50 dark:bg-slate-900 rounded-xl hover:bg-purple-50 active:scale-95 transition-all text-center"><div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2"><HelpCircle className="w-6 h-6 text-purple-600" /></div><span className="text-lg font-bold text-gray-800 dark:text-slate-200">Quiz</span></Link>
              <Link to="/educadicas" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-green-50/50 dark:bg-slate-900 rounded-xl hover:bg-green-50 active:scale-95 transition-all text-center"><div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2"><Lightbulb className="w-6 h-6 text-green-600" /></div><span className="text-lg font-bold text-gray-800 dark:text-slate-200">Dicas</span></Link>
              <Link to="/favorites" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-amber-50/50 dark:bg-slate-900 rounded-xl hover:bg-amber-50 active:scale-95 transition-all text-center"><div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2"><Bookmark className="w-6 h-6 text-amber-600 fill-current" /></div><span className="text-lg font-bold text-gray-800 dark:text-slate-200">Favoritos</span></Link>
              <Link to="/biblioteca" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-blue-50/50 dark:bg-slate-900 rounded-xl hover:bg-blue-50 active:scale-95 transition-all text-center"><div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2"><BookOpen className="w-6 h-6 text-brand-blue" /></div><span className="text-lg font-bold text-gray-800 dark:text-slate-200">Biblioteca</span></Link>
            </div>
            <div className="border-t border-gray-100 dark:border-slate-900 pt-4">
              <button onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)} className="w-full flex items-center justify-between py-2 mb-3 px-1"><div className="flex items-center gap-2"><span className="text-xl font-bold text-gray-900 dark:text-slate-100">Explorar Assuntos</span></div><ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} /></button>
              <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isMobileCategoriesOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {categories.map((cat, index) => (
                    <Link key={index} to={cat.path} onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-4 text-base text-gray-700 dark:text-slate-300 font-bold bg-gray-50 dark:bg-slate-900 rounded-xl border border-transparent hover:border-brand-blue/30 hover:bg-white dark:hover:bg-slate-800 hover:text-brand-blue dark:hover:text-blue-400 transition-all text-center shadow-sm active:scale-95">{cat.name}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-900 pb-12">
              <Link to="/contact" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-brand-blue text-white hover:bg-brand-dark transition-colors font-bold text-lg shadow-md active:scale-95"><Mail className="w-6 h-6" /> Fale Conosco</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
