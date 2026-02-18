
import numpy as np
from ..models import ArticleChunk
from .ai_service import AIService

class SearchService:
    def __init__(self):
        self.ai = AIService()

    def semantic_search(self, query, top_k=5, author_id=None):
        """
        Executa pesquisa semântica. 
        Nota: Em produção com PostgreSQL, isto usaria o operador <=> do pgvector.
        Aqui implementamos uma versão compatível que funciona com o campo JSONField/Numpy.
        """
        query_vec = self.ai.get_query_embedding(query)
        
        # Recuperar todos os chunks que têm embeddings
        chunks = ArticleChunk.objects.exclude(embedding__isnull=True)
        
        if author_id:
            chunks = chunks.filter(article__author_id=author_id)

        
        results = []
        for chunk in chunks:
            # Calcular cosine similarity simples
            similarity = self.cosine_similarity(query_vec, chunk.embedding)
            results.append((similarity, chunk))
        
        # Ordenar por similaridade
        results.sort(key=lambda x: x[0], reverse=True)
        
        return [item[1] for item in results[:top_k]]

    @staticmethod
    def cosine_similarity(v1, v2):
        dot_product = np.dot(v1, v2)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)
        return dot_product / (norm_v1 * norm_v2)
