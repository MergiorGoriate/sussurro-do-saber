import React, { useState } from 'react';
import { X, Mail, ArrowRight, Loader2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';


interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    intentText?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, intentText }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const [debugToken, setDebugToken] = useState<string | null>(null);
    const { login } = useAuth(); // Need to import this hook

    if (!isOpen) return null;


    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMsg('');
        setDebugToken(null);

        try {

            const data = await authService.requestMagicLink(email);
            setStatus('sent');
            if (data.debug_token) {

                setDebugToken(data.debug_token);
            }
        } catch (err) {
            console.error('[AuthModal] Magic link error:', err);
            setStatus('error');
            setErrorMsg('Erro ao enviar link. Tente novamente.');
        }
    };

    const handleDebugVerify = async () => {
        if (!debugToken) return;

        try {
            const data = await authService.verifyMagicLink(debugToken);

            login(data.access, data.refresh, { id: data.user_id, username: data.username, email });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('[AuthModal] Debug verify error:', err);
            setErrorMsg('Falha na verificação automática.');
        }
    };

    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingApple, setLoadingApple] = useState(false);

    const handleSocialLogin = async (provider: 'google' | 'apple') => {

        setErrorMsg('');
        if (provider === 'google') setLoadingGoogle(true);
        else setLoadingApple(true);

        try {
            const url = await authService.getSocialLoginUrl(provider);

            window.location.href = url;
        } catch (err) {
            console.error(`[AuthModal] ${provider} login error:`, err);
            setErrorMsg('Erro ao iniciar conexão com provedor.');
            setLoadingGoogle(false);
            setLoadingApple(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-2">
                        Entrar / Registar
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95"
                        title="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {intentText && (
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                            <p className="text-xs font-bold text-center text-brand-blue dark:text-blue-400 leading-relaxed">
                                {intentText}
                            </p>
                        </div>
                    )}

                    {status === 'sent' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                                <Check size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verifique o seu Email</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                Enviamos um link mágico de acesso para <strong>{email}</strong>. Clique no link para entrar instantaneamente.
                            </p>
                            <button onClick={() => setStatus('idle')} className="text-xs font-bold text-brand-blue hover:underline">
                                Usar outro email
                            </button>

                            {debugToken && (
                                <button
                                    onClick={handleDebugVerify}
                                    className="mt-6 w-full py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-xl text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all animate-pulse flex items-center justify-center gap-2"
                                >
                                    Login Instantâneo (Dev) <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={loadingGoogle || loadingApple}
                                    className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loadingGoogle ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />}
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                                        {loadingGoogle ? 'A ligar ao Google...' : 'Continuar com Google'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleSocialLogin('apple')}
                                    disabled={loadingGoogle || loadingApple}
                                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-xl hover:bg-slate-900 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loadingApple ? <Loader2 size={16} className="animate-spin text-white/50" /> : <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.84 3.67-.84 1.54.12 2.7.75 3.37 1.48-3.06 1.78-2.5 5.51.5 6.78-.92 2.67-2.17 4.55-2.62 4.81zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.39-2.02 4.47-3.74 4.25z" /></svg>}
                                    <span className="text-xs font-bold text-white/90 group-hover:text-white">
                                        {loadingApple ? 'A ligar à Apple...' : 'Continuar com Apple'}
                                    </span>
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white dark:bg-slate-900 px-2 tracking-widest">Ou email</span></div>
                            </div>

                            <form onSubmit={handleMagicLink} className="space-y-3">
                                <div>
                                    <label className="sr-only">Email</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                        />
                                    </div>
                                </div>

                                {errorMsg && <p className="text-[10px] text-red-500 font-bold">{errorMsg}</p>}

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <>Receber Link Mágico <ArrowRight size={14} /></>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
