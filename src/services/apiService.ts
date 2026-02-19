
import { Article, Footnote } from "../types";

export const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  /**
   * Busca artigos no servidor com suporte a filtros e busca.
   */
  async getArticles(query?: string, category?: string): Promise<Article[]> {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (category) params.append('category', category);

    const response = await fetch(`${API_BASE_URL}/articles/?${params.toString()}&_t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  /**
   * Busca artigos de um autor específico pelo username.
   */
  async getArticlesByAuthor(username: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE_URL}/articles/?author__username=${encodeURIComponent(username)}&_t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch author articles');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },



  /**
   * Busca um artigo detalhado por seu Slug.
   */
  async getArticleById(slug: string): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}/`);
    if (!response.ok) throw new Error('Article not found');
    return response.json();
  },

  /**
   * Busca semântica (delegada ao servidor via query parameter 'search').
   */
  async semanticSearch(query: string, articles: Article[]): Promise<Article[]> {
    if (!query) return articles;
    return this.getArticles(query);
  },

  /**
   * Obtém artigos recomendados com base no slug do artigo atual.
   */
  async getRecommendedArticles(slug: string): Promise<Article[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}/recommendations/`);
      if (!response.ok) return [];
      return response.json();
    } catch (error) {
      console.error("Recommendations error:", error);
      return [];
    }
  },

  /**
   * Factos científicos aleatórios (Front-end side).
   */
  async getRandomScienceFact(): Promise<string> {
    const facts = [
      "O conhecimento acadêmico triplica a cada década nas ciências naturais.",
      "A luz do Sol demora 8 minutos para chegar à Terra.",
      "O DNA de todos os humanos no planeta caberia em uma colher de chá.",
      "Existem mais estrelas no universo do que grãos de areia na Terra.",
      "O cérebro humano produz eletricidade suficiente para acender uma pequena lâmpada LED."
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  },


  /**
   * Busca notas de rodapé de um artigo (Django Action).
   */
  async getArticleFootnotes(slug: string): Promise<Footnote[]> {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}/footnotes/`);
    if (!response.ok) return [];
    return response.json();
  },

  /**
   * Submete uma sugestão de nota de rodapé (Django Action).
   */
  async submitFootnoteSuggestion(slug: string, footnote: Partial<Footnote>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}/footnotes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(footnote)
    });
    if (!response.ok) throw new Error('Failed to submit suggestion');
  },


  /**
   * Obtém termos de glossário via IA (Django Backend).
   */
  async getGlossaryTerms(content: string): Promise<{ term: string; definition: string }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/glossary/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Glossary fetch error:", error);
      return [];
    }
  },

  /**
   * Lista nomes de categorias (Migrado para Django).
   */
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/categories/`);
    if (!response.ok) return [];
    return response.json();
  },

  /**
   * Lista nomes de tags das bibliotecas Python (Migrado para Django).
   */
  async getTags(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/tags/`);
    if (!response.ok) return [];
    return response.json();
  },

  /**
   * Upload de imagem para o servidor (Media storage em Django).
   */
  async uploadImage(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/articles/upload_image/`, { // Ajustado para action de Article ou endpoint global
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  async indexArticle(id: string, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/indexer/${id}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to index article');
    return response.json();
  },



  /**
   * Insights globais do indexador.
   */
  async getIndexerInsights(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/indexer/`);
    if (!response.ok) throw new Error('Failed to fetch indexer insights');
    return response.json();
  },

  /**
   * Obtém o perfil completo de um autor via Username.
   */
  async getAuthorProfile(username: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/authors/${encodeURIComponent(username)}/`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Author profile fetch error:", error);
      return null;
    }
  },

  /**
   * Envia uma mensagem para o autor (autenticado ou anônimo).
   */
  async sendMessageToAuthor(username: string, data: { name: string; email: string; message: string }, token?: string): Promise<void> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/authors/${encodeURIComponent(username)}/send_message/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to send message');
    }
  },

  /**
   * Segue um autor (Requer Autenticação).
   */
  async followAuthor(username: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/authors/${encodeURIComponent(username)}/follow/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok && response.status !== 409) throw new Error('Failed to follow author');
  },

  /**
   * Deixa de seguir um autor (Requer Autenticação).
   */
  async unfollowAuthor(username: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/authors/${encodeURIComponent(username)}/unfollow/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to unfollow author');
  },

  /**
   * Verifica se o usuário atual segue o autor (Requer Autenticação).
   */
  async checkFollowStatus(username: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/authors/${encodeURIComponent(username)}/check_follow/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.following;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtém a lista de artigos favoritados (Requer Autenticação).
   */
  async getBookmarks(token: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE_URL}/bookmarks/`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    const data = await response.json();
    // A API retorna uma lista de objetos Bookmark que contêm o artigo aninhado
    return data.map((b: any) => b.article);
  },

  /**
   * Alterna o estado de favorito de um artigo (Requer Autenticação).
   * Retorna true se foi adicionado, false se removido.
   */
  async toggleBookmark(articleId: string, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/bookmarks/toggle/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ article_id: articleId })
    });

    if (!response.ok) throw new Error('Failed to toggle bookmark');
    const data = await response.json();
    return data.bookmarked;
  },

  /**
   * Alterna o estado de Like de um artigo.
   * Se token estiver presente, faz toggle no servidor.
   */
  async toggleLike(slug: string, token?: string): Promise<{ likes: number; liked: boolean }> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/articles/${slug}/like/`, {
      method: 'POST',
      headers
    });

    if (!response.ok) throw new Error('Failed to toggle like');
    return response.json();
  },

  async get(endpoint: string, options: any = {}) {
    const params = options.params ? `?${new URLSearchParams(options.params).toString()}` : '';
    const response = await fetch(`${API_BASE_URL}${endpoint}${params}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    const data = await response.json();
    return { data };
  },

  async post(endpoint: string, body: any, options: any = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    const data = await response.json();
    return { data };
  }
};

export default apiService;
