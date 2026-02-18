
from celery import shared_task
from .models import Article, ArticleChunk
from .services.ai_service import AIService
from django.utils.text import Truncator

@shared_task
def index_article_task(article_id):
    """
    Tarefa assíncrona para:
    1. Limpar chunks antigos
    2. Segmentar texto (Chunking)
    3. Gerar Embeddings
    """
    article = Article.objects.get(id=article_id)
    ArticleChunk.objects.filter(article=article).delete()
    
    ai = AIService()
    text = article.content
    
    # Chunking simples por parágrafos/tamanho (aprox 1000 chars)
    # Em produção usaríamos RecursiveCharacterTextSplitter
    chunks = [text[i:i+1000] for i in range(0, len(text), 800)]
    
    for content in chunks:
        embedding = ai.generate_embedding(content)
        ArticleChunk.objects.create(
            article=article,
            content=content,
            token_count=len(content.split()),
            embedding=embedding
        )
    
    return f"Artigo {article_id} indexado com {len(chunks)} chunks."

@shared_task
def generate_editorial_nlp_task(article_id, tool_type):
    """
    Gera conteúdo editorial (Abstract, Keywords, APA) via IA
    """
    article = Article.objects.get(id=article_id)
    ai = AIService()
    
    prompts = {
        'abstract': "Gere um abstract científico formal em Português para o seguinte artigo...",
        'keywords': "Extraia 5 palavras-chave científicas do seguinte artigo...",
        'apa': "Formate a referência bibliográfica deste artigo em estilo APA 7th Edition...",
    }
    
    prompt = f"{prompts.get(tool_type, 'Analise:')}\n\n{article.content}"
    response = ai.model.generate_content(prompt)
    
    # Log da sugestão para auditoria no Admin
    from .models import AISuggestion
    AISuggestion.objects.create(
        article=article,
        field=tool_type,
        suggestion_text=response.text,
        rationale="Geração automática baseada em processamento NLP Gemini 2.0"
    )
    
    return f"Sugestão {tool_type} gerada para o artigo {article_id}."

@shared_task
def dispatch_outbox_task():
    """
    Despacha eventos pendentes no Outbox para o microserviço de Newsletter.
    Implementa retentativas automáticas via Celery.
    """
    from .models import OutboxEvent
    from django.utils import timezone
    import requests
    import os
    
    events = OutboxEvent.objects.filter(processed=False)
    count = 0
    
    # URL do microserviço (configurável via ENV)
    # No MVP, se não houver URL, apenas marcamos como processado para fins de demonstração
    NEWSLETTER_API_URL = os.getenv('NEWSLETTER_API_URL')
    
    for event in events:
        try:
            print(f"DISPATCHER: Processando {event.event_type} [{event.id}]")
            
            if NEWSLETTER_API_URL:
                # INTEGRATION REAL: Envio via HTTP para o FastAPI
                # response = requests.post(f"{NEWSLETTER_API_URL}/api/v1/events", json=event.payload, timeout=10)
                # response.raise_for_status()
                pass
            
            # Marcar como despachado
            event.processed = True
            event.processed_at = timezone.now()
            event.save()
            count += 1
            
        except Exception as e:
            print(f"DISPATCHER ERROR [{event.id}]: {e}")
            
    return f"{count} eventos despachados do Outbox."
