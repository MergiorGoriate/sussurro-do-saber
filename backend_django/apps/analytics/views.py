from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from apps.articles.models import Article
from apps.articles.serializers import ArticleListSerializer
from .services import AnalyticsService
from .models import ArticleMetricDaily, ArticleMetricWeekly, ArticleMetricMonthly
import logging

logger = logging.getLogger(__name__)

class ConfirmViewAPI(APIView):
    """
    Ingestão de métricas de visualização confirmada.
    Requer validação de anti-bot e deduplicação no Redis.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'metrics_ingestion'

    def post(self, request):
        article_id = request.data.get('article_id')
        event = request.data.get('event')
        
        # Structured Logging Data
        log_data = {
            'article_id': article_id,
            'event': event,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'remote_addr': self.get_client_ip(request)
        }

        if not article_id or event != 'view_confirmed':
            logger.warning("Invalid metrics payload", extra=log_data)
            return Response({"detail": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Quick validation (cacheable)
        cache_key = f"article_exists:{article_id}"
        is_valid = cache.get(cache_key)
        
        if is_valid is None:
            is_valid = Article.objects.filter(id=article_id, status='published').exists()
            cache.set(cache_key, is_valid, 300) # 5 min cache
            
        if not is_valid:
            return Response({"detail": "Article not found or not published"}, status=status.HTTP_404_NOT_FOUND)

        # Fingerprinting
        ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        session_id = request.data.get('session_id', '')
        
        if request.user.is_authenticated:
            fingerprint = f"user:{request.user.id}"
        else:
            fingerprint = f"{ip}:{user_agent}:{session_id}"

        recorded = AnalyticsService.record_view(article_id, fingerprint)
        
        return Response({"recorded": recorded}, status=status.HTTP_200_OK)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class TrendingAPI(APIView):
    """
    Endpoint de trending articles com cache e fallback para DB.
    """
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(30)) # 30s cache
    def get(self, request):
        range_type = request.query_params.get('range', 'day')
        limit = min(int(request.query_params.get('limit', 10)), 50)
        
        # 1. Try Redis
        trending_data = AnalyticsService.get_trending_ids(range_type, limit)
        
        if trending_data:
            # zip IDs and scores
            ids = [int(item[0]) for item in trending_data]
            scores = {int(item[0]): int(item[1]) for item in trending_data}
            
            # Fetch objects preserving order
            # Note: order_by(Field) can be used, but manual sorting is often cleaner for ZSETs
            articles = Article.objects.filter(id__in=ids).select_related('author', 'category').prefetch_related('tags')
            
            # Re-sort to match ZSET order
            sorted_articles = sorted(articles, key=lambda a: scores.get(a.id, 0), reverse=True)
            
            serializer = ArticleListSerializer(sorted_articles, many=True)
            
            # Inject score (views) into response
            for i, item in enumerate(serializer.data):
                item['period_views'] = scores.get(int(sorted_articles[i].id), 0)
                
            return Response(serializer.data)

        # 2. Fallback to PostgreSQL Aggregates
        return self.get_db_fallback(range_type, limit)

    def get_db_fallback(self, range_type, limit):
        logger.warning(f"Redis trending failed, falling back to DB for range: {range_type}")
        
        from django.db.models import Sum
        
        # Query matching table based on range
        if range_type == 'week':
            from datetime import datetime
            now = datetime.now()
            year_week = now.strftime('%YW%V')
            metrics = ArticleMetricWeekly.objects.filter(year_week=year_week).order_by('-views')[:limit]
        elif range_type == 'month':
            from datetime import datetime
            now = datetime.now()
            year_month = now.strftime('%Y-%m')
            metrics = ArticleMetricMonthly.objects.filter(year_month=year_month).order_by('-views')[:limit]
        else:
            from datetime import date
            metrics = ArticleMetricDaily.objects.filter(day=date.today()).order_by('-views')[:limit]

        ids = [m.article_id for m in metrics]
        articles = Article.objects.filter(id__in=ids).select_related('author', 'category').prefetch_related('tags')
        
        # Preserve order
        metric_map = {m.article_id: m.views for m in metrics}
        sorted_articles = sorted(articles, key=lambda a: metric_map.get(a.id, 0), reverse=True)
        
        serializer = ArticleListSerializer(sorted_articles, many=True)
        for i, item in enumerate(serializer.data):
             item['period_views'] = metric_map.get(sorted_articles[i].id, 0)
             
        return Response(serializer.data)

# Re-keeping legacy views for compatibility if needed (or refactoring them)
# For now, let's keep them and we'll update urls.py to include new ones.
class LegacyStatsView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, article_id):
        stats = AnalyticsService.get_realtime_stats(article_id)
        return Response(stats, status=status.HTTP_200_OK)
