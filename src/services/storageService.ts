
import { Article, Category, Comment, BlogSettings, BlogUser, MediaItem, ActivityLog, CommentStatus, Footnote, FootnoteStatus } from '../types';
import { apiService } from './apiService';

const STORAGE_KEYS = {
  DB: 'sussurros_journal_db_v5',
  INTERACTIONS: 'sussurros_user_stats_v2',
  AUTH: 'sussurros_auth_token',
  USER: 'sussurros_user_data'
};

class JournalBackend {
  // Mantemos db local apenas para compatibilidade de UI se necessário, 
  // mas agora a fonte da verdade é o servidor.
  private db: {
    articles: Article[];
    comments: Comment[];
    settings: BlogSettings;
    users: BlogUser[];
    subscribers: string[];
    media: MediaItem[];
    logs: ActivityLog[];
  };

  constructor() {
    this.db = this.initializeDefaultDB();
  }

  private initializeDefaultDB() {
    return {
      articles: [],
      comments: [],
      subscribers: [],
      media: [],
      logs: [],
      settings: {
        name: 'Sussurros do Saber Journal',
        description: 'Multidisciplinary Academic Open Access Journal',
        impactFactor: '3.84',
        hIndex: 12,
        contactEmail: 'journal@sussurros.pt'
      },
      users: []
    };
  }

  public async getArticles(query?: string, category?: string): Promise<Article[]> {
    return apiService.getArticles(query, category);
  }

  public async getArticleById(id: string): Promise<Article | undefined> {
    try {
      return await apiService.getArticleById(id);
    } catch {
      return undefined;
    }
  }

  public async addComment(articleId: string, author: string, content: string, email?: string): Promise<Comment> {
    const response = await fetch(`http://127.0.0.1:5000/api/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content, email })
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  }

  public async getArticleComments(articleId: string): Promise<Comment[]> {
    const response = await fetch(`http://127.0.0.1:5000/api/articles/${articleId}/comments`);
    if (!response.ok) return [];
    return response.json();
  }

  public async toggleLike(id: string): Promise<boolean> {
    const response = await fetch(`http://127.0.0.1:5000/api/articles/${id}/like`, { method: 'POST' });
    if (!response.ok) return false;
    const data = await response.json();

    // Sincronizar localmente para efeitos visuais rápidos
    const stats = this.getUserInteractions();
    const idx = stats.likedArticles.indexOf(id);
    if (idx === -1) {
      stats.likedArticles.push(id);
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(stats));
      return true;
    } else {
      stats.likedArticles.splice(idx, 1);
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(stats));
      return false;
    }
  }

  public async addSubscriber(email: string): Promise<boolean> {
    const response = await fetch(`http://127.0.0.1:5000/api/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.ok;
  }

  public async login(email: string, pass: string): Promise<BlogUser | null> {
    const response = await fetch(`http://127.0.0.1:5000/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await response.json();
    localStorage.setItem(STORAGE_KEYS.AUTH, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  }

  public getCurrentUser(): BlogUser | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  public logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  public async saveArticle(article: Partial<Article>, user: BlogUser) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const method = article.id ? 'PUT' : 'POST';
    const url = article.id
      ? `http://127.0.0.1:5000/api/articles/${article.id}`
      : `http://127.0.0.1:5000/api/articles`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });

    if (!response.ok) throw new Error('Failed to save article');
    window.dispatchEvent(new Event('storage-update'));
  }

  public async deleteArticle(id: string) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/articles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete article');
    window.dispatchEvent(new Event('storage-update'));
  }

  public getUserInteractions() {
    const data = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    return data ? JSON.parse(data) : { likedArticles: [], bookmarkedArticles: [] };
  }

  public async toggleBookmark(id: string): Promise<boolean> {
    const stats = this.getUserInteractions();
    const idx = stats.bookmarkedArticles.indexOf(id);
    let result = false;

    if (idx === -1) {
      stats.bookmarkedArticles.push(id);
      result = true;
    } else {
      stats.bookmarkedArticles.splice(idx, 1);
      result = false;
    }

    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(stats));
    window.dispatchEvent(new Event('storage-update'));
    return result;
  }

  // Métodos administrativos adaptados para a API
  public async getComments(): Promise<Comment[]> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  }

  public async updateCommentStatus(id: string, status: CommentStatus, user: BlogUser) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update comment');
  }

  public async deleteComment(id: string, user: BlogUser) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  }

  public async getSubscribers(): Promise<string[]> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/subscribers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  }

  public async getSettings(): Promise<BlogSettings> {
    const response = await fetch(`http://127.0.0.1:5000/api/settings`);
    if (!response.ok) return this.db.settings;
    return response.json();
  }

  public async updateSettings(settings: BlogSettings) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update settings');
  }

  public async getUsers(): Promise<BlogUser[]> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  }

  public async createUser(userData: Partial<BlogUser>) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao criar utilizador');
    }
  }

  public async updateProfile(profileData: Partial<BlogUser>) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Falha ao actualizar perfil');
    const data = await response.json();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  }

  public async getMedia(): Promise<MediaItem[]> {
    return []; // Para implementar se houver upload real
  }

  // FOOTNOTES
  public async getArticleFootnotes(articleId: string): Promise<Footnote[]> {
    return apiService.getArticleFootnotes(articleId);
  }

  public async submitFootnoteSuggestion(articleId: string, author: string, content: string, type: any, referenceText?: string) {
    return apiService.submitFootnoteSuggestion(articleId, { author, content, type, referenceText });
  }

  public async getAllFootnotes(): Promise<Footnote[]> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/footnotes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  }

  public async updateFootnoteStatus(id: string, status: FootnoteStatus) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/footnotes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update footnote');
  }

  public async deleteFootnote(id: string) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH);
    const response = await fetch(`http://127.0.0.1:5000/api/footnotes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete footnote');
  }

  public async uploadImage(file: File, token: string) {
    return apiService.uploadImage(file, token);
  }

  public async getCategories() {
    return apiService.getCategories();
  }

  public async getTags() {
    return apiService.getTags();
  }

  public async indexArticle(id: string, token: string) {
    return apiService.indexArticle(id, token);
  }
}

export const storageService = new JournalBackend();
