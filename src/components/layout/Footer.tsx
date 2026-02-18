
import React, { useState, useEffect } from 'react';
/* Importing Link from react-router-dom to fix missing exported member error */
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { BlogSettings } from '../../types';
import { Brain, Facebook, Twitter, Instagram, Youtube, Linkedin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState<BlogSettings | null>(null);

  const fetchSettings = async () => {
    const data = await storageService.getSettings();
    setSettings(data);
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener('settings-update', fetchSettings);
    return () => window.removeEventListener('settings-update', fetchSettings);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const success = await storageService.addSubscriber(email);
      if (success) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setErrorMsg('Este email já está subscrito.');
        setTimeout(() => { setStatus('idle'); setErrorMsg(''); }, 3000);
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Erro de conexão. Tente novamente.');
      setTimeout(() => { setStatus('idle'); setErrorMsg(''); }, 3000);
    }
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white mt-auto py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">

          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img src="https://69697dc3356a14887c615411.imgix.net/logo.png" alt="" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="font-bold text-xl tracking-tight">Sussurros<span className="text-brand-blue">.</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">{t('footer.explore')}</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/?cat=Ciência" className="hover:text-brand-blue transition-colors">Ciência</Link></li>
              <li><Link to="/?cat=Tecnologia" className="hover:text-brand-blue transition-colors">Tecnologia</Link></li>
              <li><Link to="/quiz" className="hover:text-brand-blue transition-colors">Quizzes</Link></li>
              <li><Link to="/educadicas" className="hover:text-brand-blue transition-colors">Guia de Estudo</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">{t('footer.institutional')}</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-brand-blue transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-brand-blue transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-blue transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-brand-blue transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/admin" className="hover:text-brand-blue transition-colors">{t('footer.admin')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-6">Receba doses semanais de curiosidade científica.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="O seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 dark:bg-slate-900 text-white px-5 py-3 rounded-2xl border border-slate-700 dark:border-slate-800 focus:outline-none focus:border-brand-blue transition-all text-sm"
                required
              />
              <button
                type="submit"
                className="bg-brand-blue text-white font-bold py-3 rounded-2xl hover:bg-brand-dark transition-all text-sm shadow-xl shadow-blue-500/10"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Subscrever Agora'}
              </button>
              {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 dark:border-slate-950 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">&copy; {new Date().getFullYear()} Sussurros do Saber. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href={settings?.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-blue transition-colors" aria-label="Facebook"><Facebook size={20} /></a>
            <a href={settings?.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-blue transition-colors" aria-label="Twitter"><Twitter size={20} /></a>
            <a href={settings?.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-blue transition-colors" aria-label="Instagram"><Instagram size={20} /></a>
            <a href={settings?.youtubeUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-blue transition-colors" aria-label="YouTube"><Youtube size={20} /></a>
            <a href={settings?.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-blue transition-colors" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
