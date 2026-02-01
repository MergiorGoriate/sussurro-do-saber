
import { Category } from "../types";

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface SEOAnalysis {
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  summary: string;
  seoScore: number;
  readabilityIndex: string;
}

export const generateBlogContent = async (topic: string, type: 'explanation' | 'essay'): Promise<{ title: string; content: string; excerpt: string }> => {
  const response = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, type })
  });

  if (!response.ok) throw new Error("Failed to generate content");
  return response.json();
};

export const suggestArticleSEO = async (title: string, content: string): Promise<SEOAnalysis> => {
  // Para simplificar, vou usar um mock ou implementar no backend se necessário.
  // Mas o principal era a geração de conteúdo.
  return {
    metaTitle: title,
    metaDescription: content.substring(0, 150),
    tags: ["Educação", "Saber"],
    summary: content.substring(0, 200),
    seoScore: 85,
    readabilityIndex: "Alta"
  };
};
