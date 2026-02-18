
import os
import django
import sys

# Setup Django
sys.path.append('d:/Aprendendo a progranmar em Python/sussurros-do-saber/backend_django')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.articles.models import Article, ArticleChunk
from apps.articles.tasks import index_article_task

def run_indexing():
    articles = Article.objects.filter(status='published')
    total = articles.count()
    print(f"Iniciando indexação de {total} artigos...")
    
    for i, article in enumerate(articles):
        print(f"[{i+1}/{total}] Indexando: {article.title} (Autor: {article.author.get_full_name()})")
        try:
            # Chamamos a lógica da task diretamente de forma síncrona para simplificar
            result = index_article_task(article.id)
            print(f"   Success: {result}")
        except Exception as e:
            print(f"   Error indexando {article.id}: {e}")

    print("\nIndexação concluída!")

if __name__ == "__main__":
    run_indexing()
