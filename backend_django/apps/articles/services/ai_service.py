
import os
import google.generativeai as genai
from django.conf import settings
from ..models import Article, ArticleChunk

class AIService:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("[AIService] Warning: GEMINI_API_KEY not configured.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.embed_model = 'models/gemini-embedding-001'

    def generate_insight(self, content):
        """Fornece um insight curto e fascinante sobre o artigo"""
        if not self.api_key: return "Fascinante reflexão científica em processamento..."
        
        prompt = f"Como um curador científico do 'Sussurros do Saber', forneça um insight curto (máximo 3 frases) e fascinante sobre este artigo: {content[:4000]}"
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"[AIService] Insight Error: {e}")
            return "Um insight fascinante está a ser preparado pelos nossos curadores."

    def generate_summary(self, content):
        """Cria um sumário executivo de alto nível"""
        if not self.api_key: return "Sumário em elaboração editorial."
        
        prompt = f"""
        Você é um editor sénior do jornal académico "Sussurros do Saber".
        Leia o manuscrito abaixo e crie um sumário executivo de alto nível.
        O sumário deve consistir em 3 pontos fundamentais (bullet points), totalizando no máximo 80 palavras.
        Seja rigoroso, académico mas fascinante.
        
        Texto:
        {content[:4000]}
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"[AIService] Summary Error: {e}")
            return "O sumário está a ser revisto pela nossa equipa editorial."

    def generate_glossary(self, content):
        """Identifica e define termos técnicos complexos em formato JSON"""
        if not self.api_key: return []
        
        prompt = f"""
        Como editor académico do Sussurros do Saber, analise o texto abaixo.
        Identifique 5 a 8 termos técnicos, científicos ou conceitos complexos que necessitam de clarificação.
        REGRAS CRÍTICAS:
        1. Ignore termos extremamente comuns.
        2. Foque-se em conceitos específicos do domínio do texto.
        3. A definição deve ter entre 10 e 20 palavras, num tom formal e enciclopédico.
        4. Retorne APENAS o JSON.
        
        JSON STRUCTURE:
        [
            {{"term": "Exemplo", "definition": "Definição clara e concisa."}}
        ]
        
        Texto:
        {content[:3000]}
        """
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            import json
            return json.loads(response.text)
        except Exception as e:
            print(f"[AIService] Glossary Error: {e}")
            return []

    def generate_embedding(self, text):
        """Gera embedding para um texto usando Gemini"""
        if not self.api_key: return [0.0] * 768
        try:
            result = genai.embed_content(
                model=self.embed_model,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"[AIService] Embedding Error: {e}")
            return [0.0] * 768

    def get_query_embedding(self, query):
        """Gera embedding para uma pesquisa"""
        if not self.api_key: return [0.0] * 768
        try:
            result = genai.embed_content(
                model=self.embed_model,
                content=query,
                task_type="retrieval_query"
            )
            return result['embedding']
        except Exception as e:
            print(f"[AIService] Query Embedding Error: {e}")
            return [0.0] * 768

    def rag_chat(self, question, context_chunks):
        """
        Executa o fluxo RAG: Contexto + Pergunta -> Resposta com Citações
        """
        if not self.api_key:
            return {"text": "A funcionalidade de IA não está configurada (API Key em falta).", "citations": [], "confidence": 0}

        context_text = "\n\n".join([
            f"[ID:{chunk.id} | Artigo:{chunk.article.id}] {chunk.content}" 
            for chunk in context_chunks
        ])

        prompt = f"""
        Atue como o Assistente Científico "Sussurros AI".
        
        OBJETIVO:
        Responder à pergunta do utilizador de forma útil, precisa e académica.
        
        INSTRUÇÕES DE CONTEXTO (RAG):
        Abaixo estão trechos de artigos da nossa base de conhecimento.
        PRIORIZE o uso destes trechos para responder.
        Sempre que usar informação do contexto, CITE a fonte no formato [Artigo:ID, Chunk:ID].
        
        INSTRUÇÕES GERAIS (Fallback):
        Se a pergunta for uma saudação (ex: "Oi", "Tudo bem?") ou algo genérico que não dependa dos artigos, responda de forma educada e útil usando seu conhecimento geral.
        Se a pergunta for específica sobre um tema científico e não houver informação no contexto, você pode usar seu conhecimento geral, mas DEVE avisar que a resposta não é baseada nos artigos da plataforma.

        CONTEXTO DOS ARTIGOS:
        {context_text}

        PERGUNTA DO UTILIZADOR:
        {question}
        """

        import time
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return {
                    "text": response.text,
                    "citations": [
                        {"article_id": chunk.article.id, "chunk_id": chunk.id} 
                        for chunk in context_chunks
                    ],
                    "confidence": 0.95
                }
            except Exception as e:
                # Se for erro de quota (429), tentar novamente com backoff
                if "429" in str(e) and attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    print(f"[AIService] Quota exceeded (429). Retrying in {wait_time}s... (Attempt {attempt + 1})")
                    time.sleep(wait_time)
                    continue
                
                import traceback
                print(f"[AIService] RAG Chat Error: {e}")
                traceback.print_exc()
                
                user_msg = "Peço desculpa, ocorreu um erro ao contactar o motor de inteligência artificial do Sussurros do Saber. Por favor, tente novamente em instantes."
                if "429" in str(e):
                    user_msg = "O motor de IA está com elevada carga de pedidos (Limite de Quota). Por favor, aguarde um minuto e tente novamente."
                
                return {
                    "text": user_msg,
                    "citations": [],
                    "confidence": 0
                }
