
from ..models import Article, UserEvent, ArticleChunk
from .search_service import SearchService
import numpy as np

class RecommenderService:
    def __init__(self):
        self.search = SearchService()

    def get_recommendations_for_user(self, user=None, session_id=None, top_k=5):
        """
        Sistema de recomendação híbrido:
        1. Baseado em Conteúdo (Artigos similares aos que o utilizador gostou/viu)
        2. Popularidade (Fallback)
        """
        # Obter histórico recente do utilizador
        events = UserEvent.objects.filter(
            user=user if user else None,
            session_id=session_id
        ).order_by('-created_at')[:10]
        
        if not events.exists():
            # Fallback: Top artigos por visualizações
            return Article.objects.filter(status='published').order_by('-views')[:top_k]
        
        # Obter IDs de artigos interagidos
        article_ids = events.values_list('article_id', flat=True).distinct()
        
        # Encontrar artigos similares usando embeddings
        recommended_articles = []
        seen_ids = set(article_ids)
        
        for art_id in article_ids:
            article = Article.objects.get(id=art_id)
            # Pegar o primeiro chunk do artigo para busca de similaridade
            chunk = article.chunks.first()
            if chunk and chunk.embedding:
                similars = self.search.semantic_search(chunk.content, top_k=3)
                for s_chunk in similars:
                    if s_chunk.article.id not in seen_ids:
                        recommended_articles.append(s_chunk.article)
                        seen_ids.add(s_chunk.article.id)
                        
        # Se não houver recomendações suficientes, preencher com populares
        if len(recommended_articles) < top_k:
            pop_articles = Article.objects.exclude(id__in=seen_ids).order_by('-views')[:top_k-len(recommended_articles)]
            recommended_articles.extend(list(pop_articles))
            
        return recommended_articles[:top_k]
