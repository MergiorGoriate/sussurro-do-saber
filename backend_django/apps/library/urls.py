from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthorViewSet, InstitutionViewSet, CollectionViewSet, PublicationViewSet

router = DefaultRouter()
router.register(r'authors', AuthorViewSet)
router.register(r'institutions', InstitutionViewSet)
router.register(r'collections', CollectionViewSet)
router.register(r'publications', PublicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
