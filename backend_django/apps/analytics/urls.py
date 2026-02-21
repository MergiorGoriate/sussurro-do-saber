from django.urls import path
from . import views

urlpatterns = [
    # Enterprise Metrics API
    path('metrics/view/', views.ConfirmViewAPI.as_view(), name='metrics_view_confirm'),
    path('articles/trending/', views.TrendingAPI.as_view(), name='trending_articles'),
    
    # Real-time / Engagement API
    path('presence/<int:article_id>/', views.LegacyStatsView.as_view(), name='update_presence_legacy'), # Simplified
    path('stats/<int:article_id>/', views.LegacyStatsView.as_view(), name='get_stats_legacy'),
]
