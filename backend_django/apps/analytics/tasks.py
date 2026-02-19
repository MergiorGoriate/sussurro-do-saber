from celery import shared_task
from django.db import transaction
from django.db.models import F
from apps.articles.models import Article
from .services import AnalyticsService
import logging

logger = logging.getLogger(__name__)

@shared_task
def flush_views_to_db():
    """
    Periodically flushes view deltas from Redis to PostgreSQL.
    """
    # This is a simplified approach. In a high-scale environment, 
    # we would iterate over a set of 'active_articles' instead of using SCAN.
    # For MVP/Medium scale, SCAN is acceptable or we can just iterate known articles if not too many.
    # Ideally, AnalyticsService.record_view should add article_id to a specific 'dirty_set' in Redis.
    # Let's assume we implement the 'dirty_set' improvement for better performance.
    
    # But wait, services.py didn't implement 'dirty_set'.
    # Let's iterate keys matching pattern. 
    # Warning: KEYS is O(N), SCAN is better.
    
    # Better approach without changing services.py too much:
    # Use SCAN to find views_delta:*
    
    redis_client = AnalyticsService.redis_client
    cursor = '0'
    processed = 0
    
    while True:
        cursor, keys = redis_client.scan(cursor, match="views_delta:*", count=100)
        
        for key in keys:
            try:
                # Extract article_id from "views_delta:{id}"
                article_id = key.split(":")[1]
                
                # GETSET (Get existing value and set to 0 atomically)
                # Redis < 6.2 uses GETSET, newer uses SET with GET argument.
                # But python-redis has getset.
                # Ideally we want to read and delete OR read and reset.
                # Using getset to 0 is safer than delete because new views might come in.
                # Actually, GETSET 0 means we might lose the '0' check logic? No.
                
                delta = redis_client.getset(key, 0)
                
                if delta and int(delta) > 0:
                    delta_int = int(delta)
                    # Update DB
                    with transaction.atomic():
                        Article.objects.filter(id=article_id).update(views=F('views') + delta_int)
                        processed += 1
                        
                # If key is 0, we can optionally delete it to save memory, 
                # but leaving it is fine too as it expires or stays small.
                # To clean up: redis_client.delete(key) if int(redis_client.get(key)) == 0
                
            except Exception as e:
                logger.error(f"Error flushing view for key {key}: {e}")
                
        if cursor == 0:
            break
            
    if processed > 0:
        logger.info(f"Flushed views for {processed} articles.")
    return f"Flushed {processed} articles"
