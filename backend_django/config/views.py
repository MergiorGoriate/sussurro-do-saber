from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError
import redis
from django.conf import settings

def health_check(request):
    health = {
        "status": "healthy",
        "database": "ok",
        "redis": "ok"
    }
    
    # Check Database
    try:
        connections['default'].cursor()
    except OperationalError:
        health["status"] = "unhealthy"
        health["database"] = "down"
        
    # Check Redis
    try:
        if settings.REDIS_URL:
            r = redis.StrictRedis.from_url(settings.REDIS_URL, decode_responses=True)
            r.ping()
        else:
            health["redis"] = "not configured"
    except Exception:
        health["status"] = "unhealthy"
        health["redis"] = "down"
        
    status_code = 200 if health["status"] == "healthy" else 503
    return JsonResponse(health, status=status_code)
