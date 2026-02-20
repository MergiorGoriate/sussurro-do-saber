import redis
import json
import time
from django.conf import settings

# Initialize Redis connection with safety wrapper
class SafeRedisWrapper:
    def __init__(self, url):
        self.enabled = False
        self.client = None
        if url and (url.startswith('redis://') or url.startswith('rediss://')):
            try:
                self.client = redis.StrictRedis.from_url(url, decode_responses=True)
                self.enabled = True
            except Exception as e:
                print(f"[SafeRedisWrapper] Erro ao inicializar cliente Redis: {e}")
        else:
            print(f"[SafeRedisWrapper] Redis desativado ou esquema de URL inválido para analytics: {url}")

    def __getattr__(self, name):
        if not self.enabled:
            # Retorna uma função dummy que não faz nada se o Redis estiver desativado
            return lambda *args, **kwargs: None
            
        def method(*args, **kwargs):
            try:
                return getattr(self.client, name)(*args, **kwargs)
            except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError, ConnectionRefusedError):
                # Falha silenciosa para desenvolvimento local sem Redis
                return None
        return method

redis_client = SafeRedisWrapper(settings.CELERY_BROKER_URL)

class AnalyticsService:
    @staticmethod
    def get_article_view_key(article_id):
        return f"views_delta:{article_id}"

    @staticmethod
    def get_view_dedupe_key(article_id, fingerprint):
        return f"view_dedupe:{article_id}:{fingerprint}"

    @staticmethod
    def get_presence_key(article_id):
        return f"presence_z:{article_id}"
        
    @staticmethod
    def get_stats_channel(article_id):
        return f"stats:{article_id}"

    @staticmethod
    def record_view(article_id, fingerprint):
        """
        Records a view if not already recorded for this fingerprint in the last 30 mins.
        Returns True if view was counted, False otherwise.
        """
        dedupe_key = AnalyticsService.get_view_dedupe_key(article_id, fingerprint)
        
        # Try to set the key with an expiry of 30 minutes (1800s)
        # setnx (set if not exists) logic is handled by set(..., nx=True)
        if redis_client.set(dedupe_key, 1, ex=1800, nx=True):
            # Increment the delta counter
            redis_client.incr(AnalyticsService.get_article_view_key(article_id))
            
            # Publish update
            AnalyticsService.publish_stats(article_id)
            return True
        return False

    @staticmethod
    def update_presence(article_id, fingerprint):
        """
        Updates the presence heartbeat for a user on an article.
        Uses a ZSET to store fingerprints with a timestamp score.
        """
        key = AnalyticsService.get_presence_key(article_id)
        current_time = time.time()
        
        # Add/Update user in ZSET with current timestamp
        redis_client.zadd(key, {fingerprint: current_time})
        
        # Set expiry for the whole key (optional cleanup backup, but ZREMRANGE is main cleanup)
        redis_client.expire(key, 3600) 
        
        # Publish update (throttling could be added here if needed)
        AnalyticsService.publish_stats(article_id)

    @staticmethod
    def get_realtime_stats(article_id):
        """
        Returns {views_delta, reading_now}
        """
        # Cleanup old presence entries (older than 60s)
        presence_key = AnalyticsService.get_presence_key(article_id)
        min_score = 0
        max_score = time.time() - 60
        redis_client.zremrangebyscore(presence_key, min_score, max_score)
        
        # Count remaining users
        reading_now = redis_client.zcard(presence_key) or 0
        
        # Get pending views
        views_delta = redis_client.get(AnalyticsService.get_article_view_key(article_id))
        views_delta = int(views_delta) if views_delta else 0
        
        return {
            "views_delta": views_delta,
            "reading_now": reading_now
        }

    @staticmethod
    def publish_stats(article_id):
        """
        Publishes current stats to the Reids channel for SSE consumption.
        """
        stats = AnalyticsService.get_realtime_stats(article_id)
        channel = AnalyticsService.get_stats_channel(article_id)
        redis_client.publish(channel, json.dumps(stats))

    # --- Author Stats Handlers ---

    @staticmethod
    def get_author_stats_channel(username):
        return f"author_stats:{username}"

    @staticmethod
    def publish_author_update(username, event_type, data):
        """
        Publishes an update to the Author's personal stats channel.
        event_type: 'view', 'follower', 'karma'
        data: dict with relevant info (e.g. {'delta': 1} or {'total': 50})
        """
        channel = AnalyticsService.get_author_stats_channel(username)
        message = {
            "type": event_type,
            "data": data,
            "timestamp": time.time()
        }
        redis_client.publish(channel, json.dumps(message))
