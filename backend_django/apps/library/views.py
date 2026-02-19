from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F
from .models import Author, Institution, Collection, Publication
from .serializers import (
    AuthorSerializer, InstitutionSerializer, 
    CollectionSerializer, PublicationListSerializer, 
    PublicationDetailSerializer
)

class InstitutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'country']

class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'orcid']
    lookup_field = 'slug'

class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    lookup_field = 'slug'

class PublicationViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all()
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'year', 'institution', 'country', 'language', 'access_level', 'is_verified']
    search_fields = ['title', 'abstract', 'doi_internal']
    ordering_fields = ['created_at', 'views_count', 'downloads_count', 'year']

    def get_serializer_class(self):
        if self.action == 'list':
            return PublicationListSerializer
        return PublicationDetailSerializer

    @action(detail=True, methods=['post'])
    def view(self, request, slug=None):
        """Increment view count"""
        publication = self.get_object()
        publication.views_count = F('views_count') + 1
        publication.save(update_fields=['views_count'])
        return Response({'status': 'view recorded'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def download(self, request, slug=None):
        """Increment download count and return file URL"""
        publication = self.get_object()
        publication.downloads_count = F('downloads_count') + 1
        publication.save(update_fields=['downloads_count'])
        
        # In a real R2 implementation with restrictions, we would generate a signed URL here.
        # For now, we return the public file URL.
        return Response({
            'status': 'download recorded',
            'download_url': publication.pdf_file.url
        }, status=status.HTTP_200_OK)
