from celery import shared_task
from django.db import transaction
from django.utils import timezone
from datetime import datetime, date
from .services import AnalyticsService, redis_client
from .models import ArticleMetricDaily, ArticleMetricWeekly, ArticleMetricMonthly
import logging

logger = logging.getLogger(__name__)

@shared_task
def flush_metrics_to_db():
    """
    Consome as janelas activas de ranking no Redis e sincroniza com PostgreSQL.
    Usa UPSERT em batch para escala.
    """
    day_key, week_key, month_key = AnalyticsService.get_ranking_keys()
    
    # 1. Flush Daily
    _sync_zset_to_model(day_key, ArticleMetricDaily, 'day', date.today())
    
    # 2. Flush Weekly
    year_week = datetime.now().strftime('%YW%V')
    _sync_zset_to_model(week_key, ArticleMetricWeekly, 'year_week', year_week)
    
    # 3. Flush Monthly
    year_month = datetime.now().strftime('%Y-%m')
    _sync_zset_to_model(month_key, ArticleMetricMonthly, 'year_month', year_month)

    return "Metrics synced"

def _sync_zset_to_model(zset_key, model_class, period_field, period_value):
    """Auxiliar para ler ZSET e fazer UPSERT no DB."""
    data = redis_client.zrevrange(zset_key, 0, -1, withscores=True)
    if not data:
        return

    processed = 0
    for article_id, score in data:
        try:
            # Atomic UPSERT
            # Em PostgreSQL 9.5+ podemos usar update_or_create ou um loop com try/except
            # Para performance enterprise, o ideal seria um bulk_create com on_conflict_do_update
            # Mas o Django .update_or_create é seguro e legível para este volume.
            
            model_class.objects.update_or_create(
                article_id=article_id,
                **{period_field: period_value},
                defaults={'views': int(score)}
            )
            processed += 1
        except Exception as e:
            logger.error(f"Error syncing {zset_key} for article {article_id}: {e}")

    if processed > 0:
        logger.info(f"Synced {processed} records for {zset_key} to {model_class.__name__}")

@shared_task
def rebuild_rankings_from_db():
    """
    Reconstrói os ZSETs do Redis a partir dos dados do PostgreSQL.
    Útil para recuperação de desastres ou reinicialização de cache.
    """
    day_key, week_key, month_key = AnalyticsService.get_ranking_keys()
    
    # Daily
    daily = ArticleMetricDaily.objects.filter(day=date.today())
    for m in daily:
        redis_client.zadd(day_key, {m.article_id: m.views})
        
    # Weekly
    year_week = datetime.now().strftime('%YW%V')
    weekly = ArticleMetricWeekly.objects.filter(year_week=year_week)
    for m in weekly:
        redis_client.zadd(week_key, {m.article_id: m.views})
        
    # Monthly
    year_month = datetime.now().strftime('%Y-%m')
    monthly = ArticleMetricMonthly.objects.filter(year_month=year_month)
    for m in monthly:
        redis_client.zadd(month_key, {m.article_id: m.views})
        
    return "Rankings rebuilt"

# Legacy flush for core 'views' counter (keeping for compatibility)
@shared_task
def flush_legacy_views():
    cursor = '0'
    while True:
        cursor, keys = redis_client.scan(cursor, match="views_delta:*", count=100)
        for key in keys:
            try:
                article_id = key.split(":")[1]
                delta = redis_client.getset(key, 0)
                if delta and int(delta) > 0:
                    from apps.articles.models import Article
                    from django.db.models import F
                    Article.objects.filter(id=article_id).update(views=F('views') + int(delta))
            except: pass
        if cursor == 0: break
