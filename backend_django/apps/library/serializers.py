from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Author, Institution, Collection, Publication

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = '__all__'

class PublicationListSerializer(TaggitSerializer, serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    institution = InstitutionSerializer(read_only=True)
    keywords = TagListSerializerField()

    class Meta:
        model = Publication
        fields = [
            'id', 'title', 'slug', 'type', 'year', 'authors', 
            'institution', 'cover_image', 'access_level', 
            'views_count', 'downloads_count', 'is_verified',
            'keywords', 'country'
        ]

class PublicationDetailSerializer(TaggitSerializer, serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    institution = InstitutionSerializer(read_only=True)
    collections = CollectionSerializer(many=True, read_only=True)
    keywords = TagListSerializerField()

    class Meta:
        model = Publication
        fields = '__all__'
