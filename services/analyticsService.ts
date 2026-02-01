
import { AnalyticsEvent, EventType, AggregatedImpact } from '../types';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'sussurros_big_data_events';

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.events = JSON.parse(saved);
    }
  }

  public trackEvent(type: EventType, contentId: string, category: string, metadata?: any) {
    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      contentId,
      category,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.events.push(newEvent);
    this.save();
    
    // Dispatch event for UI updates if needed
    window.dispatchEvent(new CustomEvent('analytics-event', { detail: newEvent }));
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events.slice(-5000))); // Keep last 5000 events
  }

  public getAggregatedImpact(): AggregatedImpact {
    const total = this.events.length;
    if (total === 0) return { totalEvents: 0, retentionRate: 0, topCategories: [], searchTrends: [], educationalEfficiency: 0 };

    const catMap: Record<string, number> = {};
    const starts = this.events.filter(e => e.type === 'leitura_iniciada').length;
    const completes = this.events.filter(e => e.type === 'leitura_concluida').length;
    const downloads = this.events.filter(e => e.type === 'download_recurso').length;

    this.events.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + 1;
    });

    const topCategories = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const searches = this.events
      .filter(e => e.type === 'pesquisa_realizada')
      .map(e => e.metadata?.query)
      .filter(Boolean);

    return {
      totalEvents: total,
      retentionRate: starts > 0 ? (completes / starts) * 100 : 0,
      topCategories,
      searchTrends: Array.from(new Set(searches)).slice(0, 10),
      educationalEfficiency: (downloads + completes) / (starts || 1) * 100
    };
  }

  public async getAIStrategicAdvice(impact: AggregatedImpact): Promise<string> {
    if (!process.env.API_KEY) return "Análise indisponível no momento.";

    // Initializing AI client inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Analise estes dados de Big Data do Observatório Educativo do blog "Sussurros do Saber":
    - Eventos Totais: ${impact.totalEvents}
    - Taxa de Conclusão de Leitura: ${impact.retentionRate.toFixed(2)}%
    - Eficiência Educativa: ${impact.educationalEfficiency.toFixed(2)}%
    - Top Categorias: ${impact.topCategories.map(c => `${c.category} (${c.count})`).join(', ')}
    - Tendências de Pesquisa: ${impact.searchTrends.join(', ')}

    Com base nestes padrões, dê 3 conselhos editoriais estratégicos para melhorar o impacto do conhecimento na comunidade.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um Estrategista de Dados Educacionais e Curador Científico. Seu objetivo é otimizar a disseminação de conhecimento baseado em evidências de comportamento de estudo."
        }
      });
      return response.text || "Sem recomendações no momento.";
    } catch (error) {
      console.error(error);
      return "Erro ao processar análise inteligente.";
    }
  }

  public resetAnalytics() {
    this.events = [];
    this.save();
  }
}

export const analyticsService = new AnalyticsService();
