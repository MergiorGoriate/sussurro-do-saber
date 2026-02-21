import redis
import json
import time
import hashlib
from datetime import datetime
from django.conf import settings

# Initialize Redis connection with safety wrapper
class SafeRedisWrapper:
    def __init__(self, url):
        self.enabled = False
        self.client = None
        if url and (url.startswith('redis://') or url.startswith('rediss://')):
            try:
                self.client = redis.StrictRedis.from_url(url, decode_responses=True, socket_connect_timeout=1)
                self.client.ping()
                self.enabled = True
            except Exception as e:
                print(f"[SafeRedisWrapper] Redis connection failed: {e}")
                self.enabled = False
        else:
            print(f"[SafeRedisWrapper] Redis desativado ou esquema de URL inválido para analytics: {url}")

    def __getattr__(self, name):
        if not self.enabled:
            return lambda *args, **kwargs: None
            
        def method(*args, **kwargs):
            try:
                return getattr(self.client, name)(*args, **kwargs)
            except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError, ConnectionRefusedError) as e:
                print(f"[SafeRedisWrapper] Connection Error: {e}")
                return None
        return method

redis_client = SafeRedisWrapper(settings.CELERY_BROKER_URL)

class AnalyticsService:
    @staticmethod
    def get_article_view_key(article_id):
        return f"views_delta:{article_id}"

    @staticmethod
    def get_view_dedupe_key(article_id, fingerprint_hash):
        return f"view_dedupe:{article_id}:{fingerprint_hash}"

    @staticmethod
    def hash_fingerprint(fingerprint):
        """Hashes sensitivity data (IP, Session) for privacy."""
        return hashlib.sha256(fingerprint.encode()).hexdigest()

    @staticmethod
    def record_view(article_id, fingerprint):
        """
        Records a view if not already recorded in the last 30 mins.
        Falls back to DB-only increment if Redis is unavailable.
        """
        fingerprint_hash = AnalyticsService.hash_fingerprint(fingerprint)
        dedupe_key = AnalyticsService.get_view_dedupe_key(article_id, fingerprint_hash)
        
        if redis_client.enabled:
            # Redis is active: Use high-scale logic with ZSETs
            if redis_client.set(dedupe_key, 1, ex=1800, nx=True):
                redis_client.incr(AnalyticsService.get_article_view_key(article_id))
                AnalyticsService.update_rankings(article_id)
                AnalyticsService.publish_stats(article_id)
                return True
            return False
        else:
            # Fallback for Redis-less environments (Local Dev)
            # Increment core counter + aggregates directly
            from apps.articles.models import Article
            from .models import ArticleMetricDaily
            from django.db.models import F
            from datetime import date
            
            try:
                # Increment core article counter
                Article.objects.filter(id=article_id).update(views=F('views') + 1)
                
                # Update/Create Daily Metric
                metric, created = ArticleMetricDaily.objects.get_or_create(
                    article_id=article_id, 
                    day=date.today(),
                    defaults={'views': 1}
                )
                if not created:
                    ArticleMetricDaily.objects.filter(id=metric.id).update(views=F('views') + 1)
                
                return True
            except Exception as e:
                print(f"[AnalyticsService] DB Fallback Error: {e}")
                return False

    @staticmethod
    def get_ranking_keys():
        """Returns the keys for the current day, week, and month ZSETs."""
        now = datetime.now()
        day_key = f"rank:articles:day:{now.strftime('%Y%m%d')}"
        week_key = f"rank:articles:week:{now.strftime('%YW%V')}"
        month_key = f"rank:articles:month:{now.strftime('%Y%m')}"
        return day_key, week_key, month_key

    @staticmethod
    def update_rankings(article_id):
        """Increments the article score in daily, weekly, and monthly ZSETs."""
        day_key, week_key, month_key = AnalyticsService.get_ranking_keys()
        
        pipe = redis_client.pipeline()
        pipe.zincrby(day_key, 1, article_id)
        pipe.zincrby(week_key, 1, article_id)
        pipe.zincrby(month_key, 1, article_id)
        
        # Set expiry to automatically clean up old rankings
        # day: 14 days, week: 12 weeks, month: 12 months (approx)
        pipe.expire(day_key, 1209600)      # 14 * 86400
        pipe.expire(week_key, 7257600)    # 12 * 7 * 86400
        pipe.expire(month_key, 31104000)  # 12 * 30 * 86400
        pipe.execute()

    @staticmethod
    def get_trending_ids(range_type='day', limit=10):
        """Fetches trending article IDs and scores from Redis."""
        day_key, week_key, month_key = AnalyticsService.get_ranking_keys()
        key = day_key
        if range_type == 'week': key = week_key
        elif range_type == 'month': key = month_key
        
        results = redis_client.zrevrange(key, 0, limit - 1, withscores=True)
        return results or []

    @staticmethod
    def get_presence_key(article_id):
        return f"presence_z:{article_id}"
        
    @staticmethod
    def get_stats_channel(article_id):
        return f"stats:{article_id}"

    @staticmethod
    def update_presence(article_id, fingerprint):
        fingerprint_hash = AnalyticsService.hash_fingerprint(fingerprint)
        key = AnalyticsService.get_presence_key(article_id)
        current_time = time.time()
        redis_client.zadd(key, {fingerprint_hash: current_time})
        redis_client.expire(key, 3600) 
        AnalyticsService.publish_stats(article_id)

    @staticmethod
    def get_realtime_stats(article_id):
        presence_key = AnalyticsService.get_presence_key(article_id)
        redis_client.zremrangebyscore(presence_key, 0, time.time() - 60)
        reading_now = redis_client.zcard(presence_key) or 0
        
        views_delta = redis_client.get(AnalyticsService.get_article_view_key(article_id))
        return {
            "views_delta": int(views_delta) if views_delta else 0,
            "reading_now": reading_now
        }

    @staticmethod
    def publish_stats(article_id):
        stats = AnalyticsService.get_realtime_stats(article_id)
        channel = AnalyticsService.get_stats_channel(article_id)
        redis_client.publish(channel, json.dumps(stats))

    @staticmethod
    def publish_author_update(username, event_type, data):
        channel = f"author_stats:{username}"
        message = {"type": event_type, "data": data, "timestamp": time.time()}
        redis_client.publish(channel, json.dumps(message))
