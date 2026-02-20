
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // Provider info usually encoded here or strict state check

        // Simple heuristic: if URL path contains 'google', it's google
        // But better is to have the callback URL specific: /auth/callback/google
        // For now let's assume the router passes a prop or we infer from path if possible, 
        // OR we try both or expect 'state' to carry provider. 
        // Let's implement a generic handler that defaults to google if not specified, 
        // or check path. 
        // Actually, the best way in this simplified router is to make 2 routes or specific logic.
        // Let's assume window.location.pathname hints it.

        const path = window.location.pathname;
        const provider = path.includes('apple') ? 'apple' : 'google';

        if (code) {
            handleCallback(provider, code, state || undefined);
        } else {
            setError('No authorization code found.');
        }
    }, []);

    const handleCallback = async (provider: 'google' | 'apple', code: string, state?: string) => {
        try {
            const data = await authService.exchangeSocialCode(provider, code, state);
            login(data.access, data.refresh, {
                id: data.user_id,
                username: data.username,
                email: data.email || ''
            });

            // Pending action logic is handled by useFollow hook or global listener upon auth success
            // We just redirect to home or previous page
            toast.success(t('auth.success', 'Autenticado com sucesso!'));
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Falha na autenticação social. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center space-y-4 p-8 bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800">
                {error ? (
                    <>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Erro na Autenticação</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Voltar ao Início
                        </button>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white animate-pulse">
                            A finalizar autenticação...
                        </h2>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
