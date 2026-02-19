from rest_framework import serializers
from .models import Article, Category, Comment, Footnote, Subscriber, Bookmark

from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class ArticleListSerializer(TaggitSerializer, serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    tags = TagListSerializerField()
    readTime = serializers.IntegerField(source='reading_time', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='published_at', format="%d %b %Y", read_only=True)
    author = serializers.CharField(source='author.get_full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    authorAvatarUrl = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()
    journalMeta = serializers.SerializerMethodField()
    author_badges = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'excerpt', 'author', 'author_username', 'author_badges', 'authorAvatarUrl', 
            'date', 'category', 'imageUrl', 'readTime', 'status',
            'likes', 'views', 'tags', 'metrics', 'journalMeta', 'slug'
        ]

    def get_category(self, obj):
        return obj.category.name if obj.category else "Sem Categoria"

    def get_imageUrl(self, obj):
        request = self.context.get('request')
        if obj.cover_image:
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_authorAvatarUrl(self, obj):
        # Implementar lógica de avatar se houver
        if hasattr(obj.author, 'profile') and obj.author.profile.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.profile.photo.url)
            return obj.author.profile.photo.url
        return None

    def get_author_badges(self, obj):
        if hasattr(obj.author, 'profile'):
            return obj.author.profile.badges
        return []

    def get_metrics(self, obj):
        return {
            'citations': obj.citations,
            'altmetricScore': obj.altmetric_score,
            'viewCount': obj.views,
            'downloadCount': obj.download_count
        }

    def get_journalMeta(self, obj):
        return {
            'doi': obj.doi,
            'issn': obj.issn,
            'volume': obj.volume,
            'issue': obj.issue,
            'receivedDate': obj.created_at.strftime("%d %b %Y"), # Fallback
            'acceptedDate': obj.published_at.strftime("%d %b %Y") if obj.published_at else ""
        }

class ArticleDetailSerializer(ArticleListSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    authorAvatarUrl = serializers.SerializerMethodField()
    readTime = serializers.IntegerField(source='reading_time', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()
    journalMeta = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='published_at', format="%d %b %Y", read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'excerpt', 'content', 'author', 'author_username', 'authorAvatarUrl', 
            'date', 'category', 'imageUrl', 'readTime', 'status', 'tags',
            'likes', 'views', 'metrics', 'journalMeta', 'slug', 'doi', 'issn', 'volume', 'issue'
        ]




class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author_name')
    email = serializers.EmailField(source='author_email')
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%dT%H:%M:%S.%fZ", read_only=True)
    articleId = serializers.CharField(source='article.slug', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'email', 'content', 'date', 'status', 'articleId']
        read_only_fields = ['date', 'articleId', 'status']

class FootnoteSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%dT%H:%M:%S.%fZ", read_only=True)
    referenceText = serializers.CharField(source='reference_text', required=False)
    articleId = serializers.CharField(source='article.slug', read_only=True)

    class Meta:
        model = Footnote
        fields = ['id', 'articleId', 'author', 'content', 'type', 'status', 'date', 'referenceText']
        read_only_fields = ['date', 'articleId', 'status']

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['email']


from .models import Profile, AuthorMessage, AuthorFollower
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['photo', 'bio', 'institution', 'scientific_area', 'citation_count', 'linkedin_url', 'research_gate_url', 'orcid_url', 'external_publications', 'badges']

class AuthorMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorMessage
        fields = ['name', 'email', 'message', 'created_at']
        read_only_fields = ['created_at']

class AuthorFollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorFollower
        fields = ['follower_email']

class BookmarkSerializer(serializers.ModelSerializer):
    article = ArticleListSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(
        source='article', 
        queryset=Article.objects.all(), 
        write_only=True
    )

    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'article', 'article_id', 'created_at']
        read_only_fields = ['user', 'created_at']

class AuthorSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    stats = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'date_joined', 'profile', 'stats', 'is_following']
        
    def get_stats(self, obj):
        # Calcular estatísticas reais
        articles = obj.articles.filter(status='published')
        total_views = sum(a.views for a in articles)
        followers_count = AuthorFollower.objects.filter(author=obj).count()
        return {
            'articles': articles.count(),
            'reads': total_views,
            'followers': followers_count,
            'karma': getattr(obj.profile, 'karma', 0) if hasattr(obj, 'profile') else 0
        }

    def get_is_following(self, obj):
        # Tenta determinar se o usuário atual segue este autor
        # Se for autenticado:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
             return AuthorFollower.objects.filter(author=obj, follower_user=request.user).exists()
        # Se não autenticado, não conseguimos saber facilmente via API sem passar email (frontend gere isso via local storage ou prompt)
        return False

