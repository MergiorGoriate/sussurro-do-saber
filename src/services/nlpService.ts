
import { GoogleGenAI, Type } from "@google/genai";

export interface NLPResult {
  sentiment: 'Positivo' | 'Neutro' | 'Negativo';
  summary: string;
  keywords: string[];
  intent?: string;
}

/**
 * Realiza uma análise completa de NLP em um bloco de texto.
 */
export const performNLPAnalysis = async (text: string): Promise<NLPResult> => {
  if (!text || text.length < 10) {
    return { sentiment: 'Neutro', summary: '', keywords: [] };
  }

  if (!process.env.API_KEY) {
    return { sentiment: 'Neutro', summary: '', keywords: [] };
  }

  // Initializing AI client inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Analise o seguinte texto sob a perspectiva de NLP:
  "${text}"
  
  Tarefas:
  1. Identifique o sentimento predominante.
  2. Crie um resumo de no máximo 2 frases.
  3. Extraia 5 palavras-chave.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um motor de processamento de linguagem natural especializado em análise de conteúdo acadêmico e cultural.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { 
              type: Type.STRING, 
              // Fix: Added explanation for enum-like behavior in description as per best practices
              description: "O tom emocional do texto: Positivo, Neutro ou Negativo"
            },
            summary: { type: Type.STRING, description: "Resumo executivo" },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Tópicos principais"
            }
          },
          // Fix: Using propertyOrdering instead of required as per provided GenAI guidelines
          propertyOrdering: ["sentiment", "summary", "keywords"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("NLP Service Error:", error);
    return { sentiment: 'Neutro', summary: 'Erro no processamento.', keywords: [] };
  }
};

/**
 * Função específica para sumarização de artigos longos.
 */
export const summarizeContent = async (content: string): Promise<string> => {
  if (!process.env.API_KEY) return "";
  
  // Initializing AI client inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma este conteúdo acadêmico de forma cativante para um blog: ${content.substring(0, 5000)}`,
      config: {
        systemInstruction: "Você é um editor sênior. Seu objetivo é criar resumos que despertem curiosidade científica."
      }
    });
    return response.text?.trim() || "";
  } catch (e) {
    return "";
  }
};
