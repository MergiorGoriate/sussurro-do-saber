from rest_framework import viewsets, filters, status, permissions, authentication
from rest_framework.decorators import action, permission_classes, authentication_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article, Category, Comment, Footnote, Subscriber, AuthorMessage, AuthorFollower, Bookmark, UserLike
from .serializers import (ArticleListSerializer, 
                            ArticleDetailSerializer, 
                            CategorySerializer, 
                            CommentSerializer,
                            FootnoteSerializer,
                            SubscriberSerializer,
                            AuthorMessageSerializer, 
                            AuthorFollowerSerializer,
                            BookmarkSerializer,
                            AuthorSerializer)
from .utils import (generate_ai_insight, 
                    generate_ai_summary, 
                    generate_ai_glossary, 
                    generate_ai_chat)

class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar detalhes de artigos publicados.
    Inclui filtros por categoria e tags, além de busca por texto.
    """
    queryset = Article.objects.filter(status='published').select_related(
        'author', 'author__profile', 'category'
    ).prefetch_related('tags')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug']

    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'views', 'likes']
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        params = self.request.query_params
        
        # Filtro por Categoria (Suporta ID ou Slug/Name)
        category = params.get('category')
        if category:
            if category.isdigit():
                queryset = queryset.filter(category__id=category)
            else:
                queryset = queryset.filter(category__name__iexact=category)
                
        # Filtro por Autor (Username case-insensitive)
        author_username = params.get('author__username')
        if author_username:
            
            # Match username OR first/last name OR full name parts
            from django.db.models import Q
            name_query = Q(author__username__iexact=author_username) | \
                         Q(author__first_name__iexact=author_username) | \
                         Q(author__last_name__iexact=author_username)
            
            # If it's a full name (has space), try matching both
            if " " in author_username:
                parts = author_username.split(" ")
                first = parts[0]
                last = parts[-1]
                name_query |= (Q(author__first_name__iexact=first) & Q(author__last_name__iexact=last))
            
            queryset = queryset.filter(name_query)

            
        return queryset





    def get_object(self):
        """
        Busca robusta por ID (pk) ou Slug.
        Ignora complexidades do ViewSet para garantir recuperação direta.
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        # Se não houver valor, fallback para o padrão
        if not lookup_value:
            return super().get_object()

        # Determinar qual campo usar
        if lookup_value.isdigit():
            # Busca por ID Numérico
            obj = get_object_or_404(Article, pk=lookup_value, status='published')
        else:
            # Busca por Slug (Padrão)
            obj = get_object_or_404(Article, slug=lookup_value, status='published')

        self.check_object_permissions(self.request, obj)
        return obj

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Incrementar contador de visualizações (Atomic update to avoid hangs)
        from django.db.models import F
        Article.objects.filter(id=instance.id).update(views=F('views') + 1)
        
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def like(self, request, slug=None):
        from django.db.models import F
        article = self.get_object()
        user = request.user
        
        if user.is_authenticated:
            like_obj = UserLike.objects.filter(user=user, article=article).first()
            if like_obj:
                like_obj.delete()
                Article.objects.filter(id=article.id).update(likes=F('likes') - 1)
                article.refresh_from_db()
                return Response({'likes': article.likes, 'liked': False})
            else:
                UserLike.objects.create(user=user, article=article)
                Article.objects.filter(id=article.id).update(likes=F('likes') + 1)
                article.refresh_from_db()
                return Response({'likes': article.likes, 'liked': True})
        else:
            # Anonymous Increment
            Article.objects.filter(id=article.id).update(likes=F('likes') + 1)
            article.refresh_from_db()
            return Response({'likes': article.likes})

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, slug=None):
        article = self.get_object()
        if request.method == 'GET':
            comments = Comment.objects.filter(article=article, status='approved')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        else: # POST
            data = request.data.copy()
            if not data.get('email'):
                data['email'] = 'leitor@sussurros.pt'
            
            serializer = CommentSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(article=article, status='approved')
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def request_review(self, request, slug=None):
        article = self.get_object()
        if article.status != 'draft':
            return Response({'error': 'Apenas rascunhos podem ser enviados para revisão.'}, status=status.HTTP_400_BAD_REQUEST)
        
        article.status = 'under_review'
        article.save(update_fields=['status'])
        
        # Aqui poderíamos criar um ReviewRequest automático se o editor for conhecido
        # ou apenas deixar para o editor atribuir no admin.
        
        return Response({'status': 'under_review', 'message': 'Artigo enviado para revisão pelos pares.'})

    @action(detail=True, methods=['get'])
    def recommendations(self, request, slug=None):
        article = self.get_object()
        # Lógica simples de recomendação por categoria
        recommendations = Article.objects.filter(
            category=article.category,
            status='published'
        ).exclude(id=article.id)[:3]
        serializer = ArticleListSerializer(recommendations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        # Aqui você pode salvar em um modelo de Media ou retornar o URL diretamente se estiver usando um storage
        # Para este projeto, vamos salvar no diretório media padrão
        from django.core.files.storage import default_storage
        filename = default_storage.save(f'uploads/{file.name}', file)
        file_url = default_storage.url(filename)
        
        return Response({'url': file_url})

    @action(detail=True, methods=['get', 'post'])
    def footnotes(self, request, slug=None):
        article = self.get_object()
        if request.method == 'GET':
            footnotes = Footnote.objects.filter(article=article, status='approved')
            serializer = FootnoteSerializer(footnotes, many=True)
            return Response(serializer.data)
        else: # POST
            serializer = FootnoteSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(article=article, status='pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def list(self, request, *args, **kwargs):
        # Retornar apenas nomes se solicitado pela apiService
        response = super().list(request, *args, **kwargs)
        if isinstance(response.data, list):
            return Response([cat['name'] for cat in response.data])
        return response

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(status='approved').select_related('article')
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def get_queryset(self):
        article_slug = self.request.query_params.get('article')
        if article_slug:
            return self.queryset.filter(article__slug=article_slug)
        return self.queryset

class FootnoteViewSet(viewsets.ModelViewSet):
    queryset = Footnote.objects.all()
    serializer_class = FootnoteSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def create(self, request, *args, **kwargs):
        # Permitir criação pública mas com status pendente
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status='pending')
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    http_method_names = ['post'] # Público só pode POST
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

from rest_framework.views import APIView
from taggit.models import Tag

class TagListView(APIView):
    def get(self, request):
        tags = Tag.objects.all().values_list('name', flat=True)
        return Response(list(tags))

class AIInsightView(APIView):
    def post(self, request):
        content = request.data.get('content')
        insight = generate_ai_insight(content)
        return Response({'insight': insight})

class AISummaryView(APIView):
    def post(self, request):
        content = request.data.get('content')
        summary = generate_ai_summary(content)
        return Response({'summary': summary})

class AIGlossaryView(APIView):
    def post(self, request):
        content = request.data.get('content')
        terms = generate_ai_glossary(content)
        return Response(terms)

from .services.search_service import SearchService
from .services.ai_service import AIService
from .services.recommender_service import RecommenderService

class SemanticSearchView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({'error': 'Query is required'}, status=400)
            
        search_service = SearchService()
        relevant_chunks = search_service.semantic_search(query)
        
        # Get unique articles from chunks
        articles = []
        seen = set()
        for chunk in relevant_chunks:
            if chunk.article.id not in seen:
                articles.append(chunk.article)
                seen.add(chunk.article.id)
                
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)

class AIRAGChatView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        message = request.data.get('message')
        if not message:
            return Response({'error': 'Message is required'}, status=400)
            
        search_service = SearchService()
        ai_service = AIService()
        
        # 1. Retrieval
        relevant_chunks = search_service.semantic_search(message, top_k=3)
        
        # 2. Generation (RAG)
        response_data = ai_service.rag_chat(message, relevant_chunks)
        
        return Response(response_data)

class RecommendationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        session_id = request.query_params.get('session_id')
        recommender = RecommenderService()
        recommendations = recommender.get_recommendations_for_user(
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id
        )
        serializer = ArticleListSerializer(recommendations, many=True)
        return Response(serializer.data)

# Legacy / Optimized Chat
class AIChatView(AIRAGChatView):
    pass


class AIIndexerInsightsView(APIView):
    def get(self, request):
        # Em produção, isso viria de logs/analytics ou IA
        return Response({
            'total_indexed': Article.objects.count(),
            'trending_topics': ['Sustentabilidade', 'Inteligência Artificial', 'Bioética'],
            'last_sync': "Hoje"
        })


from django.contrib.auth.models import User

# ... (omitted imports)

class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualizar perfis de autores/investigadores.
    Lookup por username.
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = AuthorSerializer
    lookup_field = 'username'
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        identifier = self.kwargs[lookup_url_kwarg].strip()
        
        print(f"[AuthorViewSet] Requisitando objeto com identificador: '{identifier}'")

        # Prioridade 1: Match EXATO
        obj = queryset.filter(username=identifier).first()
        if obj: print(f"[AuthorViewSet] Encontrado via username exato: {obj.username}")
        
        # Prioridade 2: Username iexact
        if not obj:
            obj = queryset.filter(username__iexact=identifier).first()
            if obj: print(f"[AuthorViewSet] Encontrado via username iexact: {obj.username}")
        
        if not obj:
            # Prioridade 3: Email exato
            obj = queryset.filter(email__iexact=identifier).first()
            if obj: print(f"[AuthorViewSet] Encontrado via email: {obj.email}")
            
        if not obj:
            # Prioridade 4: Nome Completo (Primeiro + Último)
            parts = identifier.split(' ')
            if len(parts) >= 2:
                first = parts[0]
                last = " ".join(parts[1:])
                obj = queryset.filter(first_name=first, last_name=last).first()
                if not obj:
                    obj = queryset.filter(first_name__iexact=first, last_name__iexact=last).first()
                
                if not obj:
                    obj = queryset.filter(first_name__iexact=first, last_name__iexact=parts[-1]).first()
                
                if obj: print(f"[AuthorViewSet] Encontrado via nome: {obj.get_full_name()}")

        if not obj:
            print(f"[AuthorViewSet] AVISO: Nenhum autor encontrado para '{identifier}'")
            from django.http import Http404
            raise Http404

        self.check_object_permissions(self.request, obj)
        return obj


    @action(detail=True, methods=['post'])
    def send_message(self, request, username=None):
        author = self.get_object()
        serializer = AuthorMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=author)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, username=None):
        try:
            author = self.get_object()
            user = request.user
            
            # Check if already following
            if AuthorFollower.objects.filter(author=author, follower_email=user.email).exists():
                return Response({'detail': 'Você já segue este autor.', 'following': True}, status=status.HTTP_200_OK)
                
            # Create follower linked to user account
            AuthorFollower.objects.create(
                author=author,
                follower_email=user.email,
                follower_user=user
            )
            return Response({'detail': 'Agora você segue este autor.', 'following': True}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"[AuthorViewSet] Erro no follow: {str(e)}")
            return Response({'detail': f'Erro ao seguir autor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unfollow(self, request, username=None):
        author = self.get_object()
        user = request.user
        
        deleted, _ = AuthorFollower.objects.filter(author=author, follower_email=user.email).delete()
        
        if deleted:
            return Response({'detail': 'Deixou de seguir este autor.', 'following': False}, status=status.HTTP_200_OK)
        return Response({'detail': 'Você não segue este autor.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def check_follow(self, request, username=None):
        author = self.get_object()
        user = request.user
        is_following = AuthorFollower.objects.filter(author=author, follower_email=user.email).exists()
        return Response({'following': is_following})


class BookmarkViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerir bookmarks (favoritos) do utilizador.
    """
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related('article')

    def create(self, request, *args, **kwargs):
        article_id = request.data.get('article_id')
        if not article_id:
             return Response({'error': 'Article ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent duplicates
        existing = Bookmark.objects.filter(user=request.user, article_id=article_id).first()
        if existing:
            return Response(BookmarkSerializer(existing).data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle bookmark status for an article"""
        article_id = request.data.get('article_id')
        if not article_id:
            return Response({'error': 'Article ID required'}, status=400)
            
        # Robust lookup: ID or Slug
        from django.db.models import Q
        if str(article_id).isdigit():
            article = get_object_or_404(Article, id=article_id)
        else:
            article = get_object_or_404(Article, slug=article_id)
            
        bookmark = Bookmark.objects.filter(user=request.user, article=article).first()
        if bookmark:
            bookmark.delete()
            return Response({'bookmarked': False})
        else:
            Bookmark.objects.create(user=request.user, article=article)
            return Response({'bookmarked': True})


