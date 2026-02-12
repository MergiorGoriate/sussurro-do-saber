
import { Article, Footnote } from "../types";

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const apiService = {
  /**
   * Busca artigos no servidor.
   */
  async getArticles(query?: string, category?: string): Promise<Article[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);

    const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  /**
   * Busca um artigo por ID.
   */
  async getArticleById(id: string): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);
    if (!response.ok) throw new Error('Article not found');
    return response.json();
  },

  /**
   * Busca semântica (agora delegada ao servidor se necessário, ou mantida local para performance).
   * Para agora, usaremos o endpoint de articles com query.
   */
  async semanticSearch(query: string, articles: Article[]): Promise<Article[]> {
    if (!query) return articles;
    return this.getArticles(query);
  },

  /**
   * Recomenda artigos com base na semântica (IA).
   */
  async getRecommendedArticles(articleId: string): Promise<Article[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${articleId}/recommendations`);
      if (!response.ok) return [];
      return response.json();
    } catch (error) {
      console.error("Recommendations error:", error);
      return [];
    }
  },

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

  async getAiInsight(content: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/ai/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const data = await response.json();
    return data.insight;
  },

  async getArticleFootnotes(articleId: string): Promise<Footnote[]> {
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}/footnotes`);
    if (!response.ok) return [];
    return response.json();
  },

  async submitFootnoteSuggestion(articleId: string, footnote: Partial<Footnote>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}/footnotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(footnote)
    });
    if (!response.ok) throw new Error('Failed to submit suggestion');
  },

  async getArticleSummary(content: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) return '';
      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Summary fetch error:", error);
      return '';
    }
  },

  async getGlossaryTerms(content: string): Promise<{ term: string; definition: string }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/glossary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) return [];
      return await response.json();
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Glossary fetch error:", error);
      return [];
    }
  },

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) return [];
    return response.json();
  },

  async getTags(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) return [];
    return response.json();
  },

  async uploadImage(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  async indexArticle(articleId: string, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/index_article/${articleId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to index article');
    return response.json();
  },

  async getIndexerInsights(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/indexer`);
    if (!response.ok) throw new Error('Failed to fetch indexer insights');
    return response.json();
  }
};
