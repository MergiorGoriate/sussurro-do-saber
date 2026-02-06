
import React, { useState, useEffect } from 'react';
import {
    BarChart3, FileText, MessageSquare, Users, Settings,
    LogOut, Plus, Search, Edit2, Trash2, Check, X,
    ArrowLeft, LayoutDashboard, Globe, Shield,
    Bell, Mail, Eye, Heart, Download, Loader2, Send, Brain
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Article, Comment, BlogUser, Category, CommentStatus, BlogSettings, Footnote, FootnoteStatus } from '../types';
import ArticleEditor from '../components/ArticleEditor';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'comments' | 'footnotes' | 'subscribers' | 'settings' | 'profile'>('dashboard');
    const [user, setUser] = useState<BlogUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Data states
    const [articles, setArticles] = useState<Article[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [subscribers, setSubscribers] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<BlogUser[]>([]);
    const [settings, setSettings] = useState<BlogSettings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [commentFilter, setCommentFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('all');
    const [footnotes, setFootnotes] = useState<Footnote[]>([]);
    const [footnoteFilter, setFootnoteFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Taxonomy suggestions
    const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

    // Article Modal states
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

    // User Modal states
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' as const });
    const [profileData, setProfileData] = useState({ name: '', email: '', avatarUrl: '', password: '' });

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('sussurros_auth_token');
            const storedUser = storageService.getCurrentUser();
            if (token && storedUser) {
                setUser(storedUser);
                setProfileData({ name: storedUser.name, email: storedUser.email, avatarUrl: storedUser.avatarUrl || '', password: '' });
                setIsLoggedIn(true);
                loadData();
            } else if (token) {
                // If we have a token but no user data, logout for safety
                handleLogout();
            }
        };
        checkAuth();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [
                allArticles,
                allComments,
                allSubscribers,
                currentSettings,
                usersList,
                allFootnotes,
                cats,
                tgs
            ] = await Promise.all([
                storageService.getArticles(),
                storageService.getComments(),
                storageService.getSubscribers(),
                storageService.getSettings(),
                storageService.getUsers(),
                storageService.getAllFootnotes(),
                storageService.getCategories(),
                storageService.getTags()
            ]);
            setArticles(allArticles);
            setComments(allComments);
            setSubscribers(allSubscribers);
            setSettings(currentSettings);
            setAllUsers(usersList);
            setFootnotes(allFootnotes);
            setSuggestedCategories(cats);
            setSuggestedTags(tgs);
        } catch (err) {
            console.error('Error loading admin data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('sussurros_auth_token');
        if (!token) {
            alert('Sessão expirada. Autentique-se novamente.');
            return;
        }

        setIsLoading(true);
        try {
            const { url } = await storageService.uploadImage(file, token);
            setEditingArticle(prev => ({ ...prev, imageUrl: url }));
            alert('Imagem carregada com sucesso!');
        } catch (err) {
            console.error('Upload error:', err);
            alert('Erro ao carregar imagem.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsLoading(true);
        try {
            await storageService.updateSettings(settings);
            alert('Configurações actualizadas com sucesso!');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Falha ao actualizar configurações.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        if (!user || !window.confirm('Deseja eliminar definitivamente esta participação?')) return;
        try {
            await storageService.deleteComment(id, user);
            loadData();
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const loggedUser = await storageService.login(email, password);
        if (loggedUser && loggedUser.role === 'admin') {
            setUser(loggedUser);
            setIsLoggedIn(true);
            loadData();
        } else {
            setError('Credenciais inválidas ou acesso não autorizado.');
        }
    };

    const handleLogout = () => {
        storageService.logout();
        setIsLoggedIn(false);
        setUser(null);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storageService.createUser(newUser);
            setIsUserModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'admin' });
            loadData();
            alert('Novo administrador adicionado com sucesso!');
        } catch (err: any) {
            alert(err.message || 'Erro ao adicionar utilizador.');
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedUser = await storageService.updateProfile(profileData);
            setUser(updatedUser);
            setProfileData({ ...profileData, password: '' });
            alert('Perfil actualizado com sucesso!');
        } catch (err) {
            alert('Erro ao actualizar perfil.');
        }
    };

    const handleDeleteArticle = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este manuscrito?')) {
            try {
                await storageService.deleteArticle(id);
                loadData(); // Reload the articles list
            } catch (error) {
                console.error('Error deleting article:', error);
                alert('Erro ao excluir o artigo. Verifique as permissões.');
            }
        }
    };

    const handleUpdateCommentStatus = async (id: string, status: CommentStatus) => {
        if (!user) return;
        await storageService.updateCommentStatus(id, status, user);
        loadData();
    };

    const handleUpdateFootnoteStatus = async (id: string, status: FootnoteStatus) => {
        try {
            await storageService.updateFootnoteStatus(id, status);
            loadData();
        } catch (err) {
            console.error('Error updating footnote:', err);
        }
    };

    const handleDeleteFootnote = async (id: string) => {
        if (!window.confirm('Deseja eliminar definitivamente esta nota?')) return;
        try {
            await storageService.deleteFootnote(id);
            loadData();
        } catch (err) {
            console.error('Error deleting footnote:', err);
        }
    };

    const handleIndexArticle = async (id: string) => {
        const token = localStorage.getItem('sussurros_auth_token');
        if (!token) return;
        try {
            setIsLoading(true);
            await storageService.indexArticle(id, token);
            alert('Indexação semântica concluída com sucesso!');
            loadData();
        } catch (error) {
            console.error('Indexing error:', error);
            alert('Falha na indexação do manuscrito.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[32px] p-10 border border-slate-200 dark:border-slate-700 shadow-xl">
                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                            <Shield className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Painel Administrativo</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Sussurros do Saber Journal Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Institucional</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                placeholder="admin@sussurros.pt"
                                title="Insira o seu email institucional"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Palavra-passe</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                placeholder="••••••••"
                                title="Insira a sua palavra-passe"
                                required
                            />
                        </div>

                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                            <X size={14} /> {error}
                        </div>}

                        <button
                            type="submit"
                            className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Autenticar Acesso
                        </button>
                    </form>

                    <Link to="/" className="flex items-center justify-center gap-2 mt-8 text-slate-400 hover:text-brand-blue font-bold text-xs uppercase tracking-tight transition-colors">
                        <ArrowLeft size={14} /> Voltar ao Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 sticky top-0 h-screen overflow-y-auto no-print">
                <div className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-black text-xs overflow-hidden">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'S'
                        )}
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm leading-none">Admin Panel</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sussurros do Saber</span>
                    </div>
                </div>

                <nav className="space-y-2 flex-grow">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Geral' },
                        { id: 'articles', icon: FileText, label: 'Manuscritos' },
                        { id: 'comments', icon: MessageSquare, label: 'Debates & Críticas' },
                        { id: 'subscribers', icon: Mail, label: 'Audiência' },
                        { id: 'footnotes', icon: FileText, label: 'Notas Colaborativas' },
                        { id: 'settings', icon: Settings, label: 'Parâmetros' },
                        { id: 'profile', icon: Shield, label: 'Meu Perfil' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            title={`Navegar para ${item.label}`}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id
                                ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <Link to="/" className="flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-brand-blue font-black text-[10px] uppercase tracking-widest">
                        <Globe size={18} /> Ver Portal
                    </Link>
                    <button
                        onClick={handleLogout}
                        title="Sair do painel administrativo"
                        className="flex items-center gap-4 px-5 py-3 text-red-500 hover:text-red-600 font-black text-[10px] uppercase tracking-widest w-full text-left"
                    >
                        <LogOut size={18} /> Encerrar Sessão
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12">
                <header className="flex flex-wrap items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                            {activeTab === 'dashboard' && 'Visão Geral do Periódico'}
                            {activeTab === 'articles' && 'Curadoria de Manuscritos'}
                            {activeTab === 'comments' && 'Moderação de Críticas'}
                            {activeTab === 'subscribers' && 'Gestão de Audiência'}
                            {activeTab === 'footnotes' && 'Moderação de Notas'}
                            {activeTab === 'settings' && 'Definições do Sistema'}
                            {activeTab === 'profile' && 'Gestão de Identidade'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {activeTab === 'profile' ? 'Administre as suas credenciais e preferências de acesso.' : 'Gestão de conteúdo científico e métricas de impacto.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button title="Notificações" className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white relative shadow-sm">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            title="Ver meu perfil"
                            className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm hover:border-brand-blue/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                        >
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs uppercase group-hover:scale-105 transition-transform overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || 'A'
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none mb-1">{user?.name || 'Administrador'}</p>
                                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest leading-none">{user?.role === 'admin' ? 'Editor-Chefe' : user?.role || 'Editorial'}</p>
                            </div>
                        </button>
                    </div>
                </header>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-brand-blue" />
                    </div>
                )}

                {!isLoading && activeTab === 'dashboard' && (
                    <div className="space-y-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Manuscritos', value: articles.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Visualizações', value: articles.reduce((acc, a) => acc + (a.views || 0), 0), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Subscritores', value: subscribers.length, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Factor de Impacto', value: '3.84', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 transition-transform hover:scale-[1.02]">
                                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} dark:bg-opacity-10 rounded-2xl flex items-center justify-center`}>
                                        <stat.icon size={26} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h4>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* Recent Articles */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Últimos Manuscritos</h3>
                                    <button onClick={() => setActiveTab('articles')} title="Ver todos os manuscritos" className="text-[10px] font-black text-brand-blue uppercase hover:underline">Ver Todos</button>
                                </div>
                                <div className="space-y-6">
                                    {articles.slice(0, 4).map(art => (
                                        <div key={art.id} className="flex items-center gap-4 group">
                                            <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                                                <img src={art.imageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{art.title}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{art.date} · {art.category}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <div className="flex items-center gap-1 text-[10px] font-bold"><Eye size={12} /> {art.views}</div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold"><MessageSquare size={12} /> {comments.filter(c => c.articleId === art.id).length}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pending Comments */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Debates Pendentes</h3>
                                    <button onClick={() => setActiveTab('comments')} title="Ver todas as críticas" className="text-[10px] font-black text-brand-blue uppercase hover:underline">Ver Todos</button>
                                </div>
                                <div className="space-y-6">
                                    {comments.filter(c => c.status === 'pending').slice(0, 4).map(comment => (
                                        <div key={comment.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{comment.author}</h5>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateCommentStatus(comment.id, 'approved')} title="Aprovar participação" className="p-1.5 text-green-500 hover:bg-green-100 rounded-lg"><Check size={14} /></button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} title="Eliminar Definitivamente" className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><X size={14} /></button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic italic font-serif leading-relaxed">"{comment.content}"</p>
                                        </div>
                                    ))}
                                    {comments.filter(c => c.status === 'pending').length === 0 && (
                                        <div className="text-center py-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Nenhum debate pendente de aprovação.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ARTICLES TAB */}
                {!isLoading && activeTab === 'articles' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar por título ou autor..."
                                    title="Pesquisar manuscritos"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-xs"
                                />
                            </div>
                            <button
                                onClick={() => { setEditingArticle({}); setIsArticleModalOpen(true); }}
                                title="Criar novo manuscrito"
                                className="flex items-center gap-2.5 px-6 py-3.5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                <Plus size={16} /> Submeter Novo Manuscrito
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Manuscrito</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Métricas</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acções</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {articles.filter(a =>
                                        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        a.author.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(art => (
                                        <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                                        <img src={art.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate max-w-[200px] mb-1">{art.title}</h5>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{art.author} · {art.date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    {art.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`text-[8px] font-black uppercase tracking-tight px-3 py-1.5 rounded-lg border flex items-center gap-1.5 w-fit ${art.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    <div className={`w-1 h-1 rounded-full ${art.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                    {art.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4 text-slate-400">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold"><Eye size={13} /> {art.views || 0}</div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold"><Heart size={13} /> {art.likes || 0}</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleIndexArticle(art.id)}
                                                        title="Indexar com IA (Deep Scan)"
                                                        className="p-2.5 bg-white dark:bg-slate-800 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-xl border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                                                    >
                                                        <Brain size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingArticle(art); setIsArticleModalOpen(true); }}
                                                        title="Editar manuscrito"
                                                        className="p-2.5 bg-white dark:bg-slate-800 text-blue-500 hover:text-white hover:bg-blue-500 rounded-xl border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteArticle(art.id)}
                                                        title="Excluir manuscrito"
                                                        className="p-2.5 bg-white dark:bg-slate-800 text-red-500 hover:text-white hover:bg-red-500 rounded-xl border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* COMMENTS TAB */}
                {!isLoading && activeTab === 'comments' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-6">
                                {['all', 'pending', 'approved', 'spam'].map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setCommentFilter(st as any)}
                                        title={`Filtrar por ${st}`}
                                        className={`text-[10px] font-black uppercase tracking-widest pb-4 border-b-2 transition-all ${commentFilter === st ? 'text-brand-blue border-brand-blue' : 'text-slate-400 border-transparent hover:text-slate-600'
                                            }`}
                                    >
                                        {st === 'all' ? 'Todos' : st === 'pending' ? 'Pendentes' : st === 'approved' ? 'Aprovados' : 'Spam'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {comments
                                .filter(c => commentFilter === 'all' || c.status === commentFilter)
                                .map(c => (
                                    <div key={c.id} className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md animate-in fade-in">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 font-black text-sm shrink-0 uppercase">
                                            {c.author.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{c.author}</h4>
                                                    <Link to={`/article/${c.articleId}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-tight hover:text-brand-blue">
                                                        Manuscrito ID: {c.articleId}
                                                    </Link>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${c.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    c.status === 'spam' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 font-serif italic mb-6 leading-relaxed">"{c.content}"</p>

                                            <div className="flex items-center gap-3">
                                                {c.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleUpdateCommentStatus(c.id, 'approved')}
                                                        title="Aprovar participação"
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-600 transition-all"
                                                    >
                                                        <Check size={12} /> Aprovar Reflexão
                                                    </button>
                                                )}
                                                {c.status !== 'spam' && (
                                                    <button
                                                        onClick={() => handleUpdateCommentStatus(c.id, 'spam')}
                                                        title="Marcar como spam"
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                                                    >
                                                        <X size={12} /> Marcar como Spam
                                                    </button>
                                                )}
                                                <span className="text-[9px] font-bold text-slate-400 ml-auto uppercase opacity-60">
                                                    {new Date(c.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {comments.length === 0 && (
                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Nenhuma participação ou reflexão registada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FOOTNOTES TAB */}
                {!isLoading && activeTab === 'footnotes' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-white">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-6">
                                {['all', 'pending', 'approved', 'rejected'].map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setFootnoteFilter(st as any)}
                                        className={`text-[10px] font-black uppercase tracking-widest pb-4 border-b-2 transition-all ${footnoteFilter === st ? 'text-brand-blue border-brand-blue' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                    >
                                        {st === 'all' ? 'Todas' : st === 'pending' ? 'Pendentes' : st === 'approved' ? 'Aprovadas' : 'Rejeitadas'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {footnotes
                                .filter(f => footnoteFilter === 'all' || f.status === footnoteFilter)
                                .map(f => (
                                    <div key={f.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                                                    {f.author.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase mb-0.5">{f.author}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Tipo: {f.type} | {new Date(f.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {f.status !== 'approved' && (
                                                    <button onClick={() => handleUpdateFootnoteStatus(f.id, 'approved')} className="p-2 text-green-500 hover:bg-green-100 rounded-lg" title="Aprovar"><Check size={16} /></button>
                                                )}
                                                {f.status !== 'rejected' && (
                                                    <button onClick={() => handleUpdateFootnoteStatus(f.id, 'rejected')} className="p-2 text-amber-500 hover:bg-amber-100 rounded-lg" title="Rejeitar"><X size={16} /></button>
                                                )}
                                                <button onClick={() => handleDeleteFootnote(f.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg" title="Excluir"><Trash2 size={16} /></button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {f.referenceText && (
                                                <div className="text-[10px] bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 border-l-4 border-brand-blue italic text-slate-400">
                                                    Ref: "{f.referenceText}"
                                                </div>
                                            )}
                                            <p className="text-sm font-serif italic text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/40 p-4 rounded-xl">
                                                "{f.content}"
                                            </p>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                ID Manuscrito: {f.articleId}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {footnotes.length === 0 && (
                                <div className="text-center py-20 italic text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                                    Nenhuma nota de rodapé registada.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SUBSCRIBERS TAB */}
                {!isLoading && activeTab === 'subscribers' && (
                    <div className="space-y-10">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Lista de Escuta</h3>
                                    <p className="text-xs text-slate-500 font-medium">Audiência inscrita na Newsletter Sussurros.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button title="Exportar dados dos subscritores" className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all">
                                        <Download size={14} /> Exportar CSV
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                                {subscribers.map((email, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:scale-[1.02]">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Mail size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{email}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Membro Activo</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Enviar Comunicado Geral (Broadcast)</h4>
                                <div className="space-y-4 max-w-xl">
                                    <input
                                        type="text"
                                        placeholder="Assunto da Newsletter..."
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-sm"
                                        title="Assunto da newsletter"
                                    />
                                    <textarea
                                        placeholder="Escreva a sua mensagem para todos os subscritores..."
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all h-32 resize-none font-medium leading-relaxed"
                                        title="Corpo da mensagem"
                                    ></textarea>
                                    <button
                                        onClick={() => alert('Funcionalidade de envio em massa preparada. Configure o servidor SMTP para activar o envio real.')}
                                        className="flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        <Send size={16} /> Disparar Newsletter
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Team management section moved inside subscribers tab as "Equipa Administrative" */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Equipa Editorial</h3>
                                    <p className="text-xs text-slate-500 font-medium">Administradores com permissões de gestão.</p>
                                </div>
                                <button
                                    onClick={() => setIsUserModalOpen(true)}
                                    title="Adicionar novo administrador"
                                    className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <Plus size={14} /> Novo Administrador
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allUsers.map((u, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black uppercase text-xs">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{u.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {/* SETTINGS TAB */}
                {!isLoading && activeTab === 'settings' && settings && (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 max-w-2xl">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Definições do Periódico</h3>

                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Journal</label>
                                <input
                                    type="text"
                                    value={settings.name}
                                    onChange={e => setSettings({ ...settings, name: e.target.value })}
                                    placeholder="Nome do Jornal"
                                    title="Insira o nome oficial do journal"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Contacto</label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                    placeholder="contacto@journal.pt"
                                    title="Insira o email de contacto institucional"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Impact Factor (JCR)</label>
                                    <input
                                        type="text"
                                        value={settings.impactFactor}
                                        onChange={e => setSettings({ ...settings, impactFactor: e.target.value })}
                                        placeholder="Ex: 3.84"
                                        title="Insira o Factor de Impacto actual"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">H-Index</label>
                                    <input
                                        type="number"
                                        value={settings.hIndex}
                                        onChange={e => setSettings({ ...settings, hIndex: parseInt(e.target.value) })}
                                        placeholder="Ex: 12"
                                        title="Insira o H-Index do journal"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button type="submit" className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                    Actualizar Parâmetros do Journal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* PROFILE TAB */}
                {!isLoading && activeTab === 'profile' && user && (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 max-w-2xl">
                        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-20 h-20 bg-brand-blue rounded-[28px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20 uppercase overflow-hidden">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{user.name}</h3>
                                <p className="text-xs font-bold text-brand-blue uppercase tracking-widest leading-none">{user.role} Sussurros do Saber</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome de Exibição</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                    placeholder="Seu nome completo"
                                    title="Actualize o seu nome de exibição"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Acesso</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                    placeholder="seuemail@sussurros.pt"
                                    title="Actualize o seu email de acesso"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL da Foto de Perfil</label>
                                <input
                                    type="text"
                                    value={profileData.avatarUrl}
                                    onChange={e => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                                    placeholder="https://exemplo.com/foto.jpg"
                                    title="Actualize a sua foto de perfil"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                />
                                <p className="text-[9px] text-slate-400 font-bold uppercase ml-1">Esta foto será visível publicamente no portal e no admin.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Palavra-passe</label>
                                <input
                                    type="password"
                                    value={profileData.password}
                                    onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                    placeholder="Deixe em branco para manter a actual"
                                    title="Introduza uma nova palavra-passe se desejar alterar"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                />
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                    Actualizar Credenciais de Acesso
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ARTICLES MODAL */}
                {isArticleModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsArticleModalOpen(false)}></div>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                            <header className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl">
                                        {editingArticle?.id ? 'Actualizar Manuscrito' : 'Registo de Novo Manuscrito'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Preencha os rigorosos parâmetros académicos.</p>
                                </div>
                                <button onClick={() => setIsArticleModalOpen(false)} title="Fechar modal" className="p-3 text-slate-400 hover:text-red-500 transition-colors rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10">
                                    <X size={24} />
                                </button>
                            </header>

                            <form className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label htmlFor="articleTitle" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Título do Artigo</label>
                                        <input
                                            id="articleTitle"
                                            type="text"
                                            value={editingArticle?.title || ''}
                                            onChange={e => setEditingArticle(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Ex: A influência da..."
                                            title="Insira o título do manuscrito"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-base"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="articleCategory" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Categoria Científica</label>
                                        <select
                                            id="articleCategory"
                                            value={editingArticle?.category || ''}
                                            onChange={e => setEditingArticle(prev => ({ ...prev, category: e.target.value as Category }))}
                                            title="Seleccione a categoria científica"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-base appearance-none"
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            {Object.values(Category).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            {suggestedCategories.filter(c => !Object.values(Category).includes(c as any)).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="articleExcerpt" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Resumo Teórico (Excerpt)</label>
                                    <textarea
                                        id="articleExcerpt"
                                        value={editingArticle?.excerpt || ''}
                                        onChange={e => setEditingArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                                        placeholder="Resumo curto para visualização rápida..."
                                        title="Insira o resumo teórico"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all h-24 resize-none font-medium leading-relaxed"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="articleContent" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Conteúdo Integral (Markdown Suportado)</label>
                                    <ArticleEditor
                                        initialContent={editingArticle?.content || ''}
                                        onChange={(content: string) => setEditingArticle(prev => ({ ...prev, content }))}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label htmlFor="articleImageUrl" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">URL da Imagem de Capa</label>
                                        <div className="flex gap-2">
                                            <input
                                                id="articleImageUrl"
                                                type="text"
                                                value={editingArticle?.imageUrl || ''}
                                                onChange={e => setEditingArticle(prev => ({ ...prev, imageUrl: e.target.value }))}
                                                placeholder="https://exemplo.com/foto.jpg ou Upload..."
                                                title="Insira a URL da imagem de capa"
                                                className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-sm"
                                            />
                                            <label className="p-4 bg-brand-blue text-white rounded-2xl cursor-pointer hover:bg-brand-dark transition-all flex items-center justify-center shadow-lg shadow-blue-500/10" title="Fazer upload de imagem">
                                                <Plus size={20} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} title="Seleccionar ficheiro de imagem" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="articleReadTime" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Tempo de Leitura (Minutos)</label>
                                        <input
                                            id="articleReadTime"
                                            type="number"
                                            value={editingArticle?.readTime || 0}
                                            onChange={e => setEditingArticle(prev => ({ ...prev, readTime: parseInt(e.target.value) }))}
                                            placeholder="Ex: 5"
                                            title="Insira o tempo de leitura em minutos"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="articleTags" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Tags (Separadas por vírgula)</label>
                                    <input
                                        id="articleTags"
                                        type="text"
                                        list="tags-list"
                                        value={editingArticle?.tags?.join(', ') || ''}
                                        onChange={e => setEditingArticle(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) }))}
                                        placeholder="Ex: ciência, astronomia, nasa"
                                        title="Insira as tags separadas por vírgula"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold text-sm"
                                    />
                                    <datalist id="tags-list">
                                        {suggestedTags.map(tag => (
                                            <option key={tag} value={tag} />
                                        ))}
                                    </datalist>
                                </div>

                            </form>

                            <footer className="px-10 py-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4">
                                <button
                                    onClick={() => setIsArticleModalOpen(false)}
                                    title="Cancelar acção"
                                    className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!editingArticle) return;
                                        if (!editingArticle.title || !editingArticle.category) {
                                            alert('Preencha os campos obrigatórios.');
                                            return;
                                        }

                                        // Use logged in user if available, fallback to mock only if necessary
                                        const currentUser = user || { id: 'u1', name: 'Mergior Goriate', role: 'admin' as const, email: 'admin@sussurros.pt', joinedDate: '' };

                                        await storageService.saveArticle(editingArticle, currentUser);
                                        setIsArticleModalOpen(false);
                                        loadData();
                                    }}
                                    title="Guardar manuscrito no sistema"
                                    className="px-10 py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    Publicar Manuscrito
                                </button>
                            </footer>
                        </div>
                    </div >
                )}

                {/* USER MODAL */}
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                            <header className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl">Novo Administrador</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Expando a equipa editorial.</p>
                                </div>
                                <button onClick={() => setIsUserModalOpen(false)} title="Fechar modal" className="p-3 text-slate-400 hover:text-red-500 rounded-2xl">
                                    <X size={24} />
                                </button>
                            </header>

                            <form onSubmit={handleCreateUser} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                        placeholder="Nome do Administrador"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Institucional</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                        placeholder="email@sussurros.pt"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Palavra-passe Temporária</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 dark:text-white transition-all font-bold"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button type="submit" className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/20 mt-4">
                                    Confirmar Registo
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
};

export default Admin;
