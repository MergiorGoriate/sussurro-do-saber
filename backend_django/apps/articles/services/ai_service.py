
import os
import google.generativeai as genai
from django.conf import settings
from ..models import Article, ArticleChunk

class AIService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        self.embed_model = 'models/gemini-embedding-001'


    def generate_embedding(self, text):
        """Gera embedding para um texto usando Gemini"""
        result = genai.embed_content(
            model=self.embed_model,
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']

    def get_query_embedding(self, query):
        """Gera embedding para uma pesquisa"""
        result = genai.embed_content(
            model=self.embed_model,
            content=query,
            task_type="retrieval_query"
        )
        return result['embedding']

    def rag_chat(self, question, context_chunks):
        """
        Executa o fluxo RAG: Contexto + Pergunta -> Resposta com Citações
        """
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
        Sempr que usar informação do contexto, CITE a fonte no formato [Artigo:ID, Chunk:ID].
        
        INSTRUÇÕES GERAIS (Fallback):
        Se a pergunta for uma saudação (ex: "Oi", "Tudo bem?") ou algo genérico que não dependa dos artigos, responda de forma educada e útil usando seu conhecimento geral.
        Se a pergunta for específica sobre um tema científico e não houver informação no contexto, você pode usar seu conhecimento geral, mas DEVE avisar que a resposta não é baseada nos artigos da plataforma.

        CONTEXTO DOS ARTIGOS:
        {context_text}

        PERGUNTA DO UTILIZADOR:
        {question}
        """

        response = self.model.generate_content(prompt)
        
        return {
            "text": response.text,
            "citations": [
                {"article_id": chunk.article.id, "chunk_id": chunk.id} 
                for chunk in context_chunks
            ],
            "confidence": 0.95 # Mock for now
        }
