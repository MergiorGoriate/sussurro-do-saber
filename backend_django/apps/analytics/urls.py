from django.urls import path
from . import views

urlpatterns = [
    path('view/<int:article_id>/', views.RecordView.as_view(), name='record_view'),
    path('presence/<int:article_id>/', views.UpdatePresenceView.as_view(), name='update_presence'),
    path('stream/<int:article_id>/', views.stream_stats, name='stream_stats'),
    path('stats/<int:article_id>/', views.StatsView.as_view(), name='get_stats'),
]
