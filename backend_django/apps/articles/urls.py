from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (ArticleViewSet, CategoryViewSet, CommentViewSet, 
                    FootnoteViewSet, TagListView, SubscriberViewSet,
                    AIInsightView, AISummaryView, AIGlossaryView, AIChatView,
                    AIIndexerInsightsView, AuthorViewSet, BookmarkViewSet,
                    SemanticSearchView, RecommendationView)


router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'footnotes', FootnoteViewSet)
router.register(r'subscribers', SubscriberViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'bookmarks', BookmarkViewSet, basename='bookmarks')

urlpatterns = [
    path('', include(router.urls)),
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('ai/insight/', AIInsightView.as_view(), name='ai-insight'),
    path('ai/summary/', AISummaryView.as_view(), name='ai-summary'),
    path('ai/glossary/', AIGlossaryView.as_view(), name='ai-glossary'),
    path('ai/chat/', AIChatView.as_view(), name='ai-chat'),
    path('ai/indexer/', AIIndexerInsightsView.as_view(), name='ai-indexer'),
    path('search/semantic/', SemanticSearchView.as_view(), name='semantic-search'),
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
]
