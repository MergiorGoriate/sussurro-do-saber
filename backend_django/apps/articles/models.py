from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
import uuid
from taggit.managers import TaggableManager
from simple_history.models import HistoricalRecords


class Category(models.Model):
    """Categoria de artigos científicos"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, verbose_name="Descrição")
    
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Article(models.Model):
    """Artigo científico do blog"""
    
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('review', 'Em Revisão'),
        ('published', 'Publicado'),
        ('archived', 'Arquivado'),
    ]
    
    # Conteúdo Principal
    title = models.CharField(max_length=200, verbose_name="Título")
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    excerpt = models.TextField(max_length=500, verbose_name="Resumo", help_text="Resumo curto do artigo")
    content = models.TextField(verbose_name="Conteúdo (Markdown)")
    cover_image = models.ImageField(
        upload_to='articles/covers/%Y/%m/', 
        blank=True, 
        null=True,
        verbose_name="Imagem de Capa"
    )
    
    # Autoria e Classificação
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='articles',
        verbose_name="Autor"
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='articles',
        verbose_name="Categoria"
    )
    tags = TaggableManager(blank=True, verbose_name="Tags")
    
    # Estado e Datas
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        verbose_name="Estado"
    )
    published_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Data de Publicação",
        help_text="Deixe em branco para publicar imediatamente"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    history = HistoricalRecords()
    
    # Métricas
    reading_time = models.IntegerField(
        default=0, 
        verbose_name="Tempo de Leitura (min)",
        help_text="Calculado automaticamente"
    )
    views = models.IntegerField(default=0, verbose_name="Visualizações")
    likes = models.IntegerField(default=0, verbose_name="Likes")
    
    # SEO
    meta_title = models.CharField(
        max_length=60, 
        blank=True,
        verbose_name="Meta Título",
        help_text="Título para SEO (máx. 60 caracteres)"
    )
    meta_description = models.CharField(
        max_length=160, 
        blank=True,
        verbose_name="Meta Descrição",
        help_text="Descrição para SEO (máx. 160 caracteres)"
    )
    canonical_url = models.URLField(blank=True, verbose_name="URL Canônica")
    
    # Dados Científicos
    doi = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="DOI",
        help_text="Digital Object Identifier"
    )
    citations = models.IntegerField(default=0, verbose_name="Citações")
    altmetric_score = models.IntegerField(default=0, verbose_name="Altmetric Score")
    download_count = models.IntegerField(default=0, verbose_name="Downloads")
    
    # Metadados Adicionais
    issn = models.CharField(max_length=50, default='2024-99XX', verbose_name="ISSN")
    volume = models.IntegerField(default=1, verbose_name="Volume")
    issue = models.IntegerField(default=1, verbose_name="Edição")
    
    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = "Artigo"
        verbose_name_plural = "Artigos"
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Gerar slug automaticamente
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-publicar se status mudou para published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        # Calcular tempo de leitura (250 palavras/min)
        if self.content:
            word_count = len(self.content.split())
            self.reading_time = max(1, word_count // 250)
        
        # Preencher meta_title e meta_description se vazios
        if not self.meta_title:
            self.meta_title = self.title[:60]
        if not self.meta_description:
            self.meta_description = self.excerpt[:160]
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return f"/#/article/{self.slug}"
    
    @property
    def is_published(self):
        """Verifica se o artigo está publicado"""
        return self.status == 'published' and (
            self.published_at is None or self.published_at <= timezone.now()
        )


class Comment(models.Model):
    """Comentário em um artigo"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]
    
    article = models.ForeignKey(
        Article, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name="Artigo"
    )
    author_name = models.CharField(max_length=100, verbose_name="Nome do Autor")
    author_email = models.EmailField(verbose_name="Email do Autor")
    content = models.TextField(verbose_name="Conteúdo")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Estado"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Comentário"
        verbose_name_plural = "Comentários"
    
    def __str__(self):
        return f"Comentário de {self.author_name} em {self.article.title}"


class Footnote(models.Model):
    """Sugestão de correção ou adição a um artigo"""
    
    TYPE_CHOICES = [
        ('correction', 'Correção'),
        ('addition', 'Adição'),
        ('clarification', 'Esclarecimento'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]
    
    article = models.ForeignKey(
        Article, 
        on_delete=models.CASCADE, 
        related_name='footnotes',
        verbose_name="Artigo"
    )
    author = models.CharField(max_length=100, verbose_name="Autor")
    content = models.TextField(verbose_name="Conteúdo da Sugestão")
    type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES,
        verbose_name="Tipo"
    )
    reference_text = models.TextField(
        blank=True,
        verbose_name="Texto de Referência",
        help_text="Trecho do artigo ao qual a sugestão se refere"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Estado"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Sugestão"
        verbose_name_plural = "Sugestões"
    
    def __str__(self):
        return f"Sugestão de {self.type} para {self.article.title}"


class Subscriber(models.Model):
    """Subscritores da newsletter"""
    email = models.EmailField(unique=True, verbose_name="Email")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Inscrito em")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")

    class Meta:
        verbose_name = "Subscritor"
        verbose_name_plural = "Subscritores"
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class Profile(models.Model):
    """Perfil estendido para investigadores e autores"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="Utilizador")
    
    # Dados Pessoais e Académicos
    photo = models.ImageField(
        upload_to='profiles/%Y/%m/', 
        blank=True, 
        null=True,
        verbose_name="Foto de Perfil"
    )
    bio = models.TextField(
        max_length=500, 
        blank=True, 
        verbose_name="Mini Biografia Académica",
        help_text="Breve descrição do percurso académico (máx. 500 caracteres)"
    )
    institution = models.CharField(max_length=100, blank=True, verbose_name="Instituição")
    scientific_area = models.CharField(max_length=100, blank=True, verbose_name="Área Científica")
    
    # Métricas
    citation_count = models.IntegerField(default=0, verbose_name="Nº de Citações")
    
    # Links e Redes
    linkedin_url = models.URLField(blank=True, verbose_name="LinkedIn")
    research_gate_url = models.URLField(blank=True, verbose_name="ResearchGate")
    orcid_url = models.URLField(blank=True, verbose_name="ORCID")
    
    # Publicações Externas (Opcional)
    external_publications = models.TextField(
        blank=True, 
        verbose_name="Publicações Relevantes",
        help_text="Listar DOI ou títulos de publicações externas importantes"
    )
    
    badges = models.JSONField(
        default=list, 
        blank=True, 
        verbose_name="Distintivos/Badges",
        help_text="Ex: [{'type': 'verified', 'label': 'Autor Verificado'}, {'type': 'top', 'label': 'Top Investigador'}]"
    )

    karma = models.IntegerField(
        default=0, 
        verbose_name="Reconhecimento (Karma)",
        help_text="Pontos acumulados por contribuições aprovadas"
    )

    class Meta:
        verbose_name = "Perfil de Investigador"
        verbose_name_plural = "Perfis de Investigadores"

    def __str__(self):
        return f"Perfil de {self.user.get_full_name() or self.user.username}"


# Signals para criar/atualizar Perfil automaticamente
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # Garantir que o perfil existe antes de salvar (para users antigos)
    if not hasattr(instance, 'profile'):
        Profile.objects.create(user=instance)
    instance.profile.save()


class AuthorMessage(models.Model):
    """Mensagem enviada de um leitor para um autor"""
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name="Autor Destinatário"
    )
    name = models.CharField(max_length=100, verbose_name="Nome do Remetente")
    email = models.EmailField(verbose_name="Email do Remetente")
    message = models.TextField(verbose_name="Mensagem")
    is_read = models.BooleanField(default=False, verbose_name="Lida")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Enviada em")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Mensagem para Autor"
        verbose_name_plural = "Mensagens para Autores"

    def __str__(self):
        return f"Mensagem de {self.name} para {self.author.get_full_name()}"


class AuthorFollower(models.Model):
    """Seguidores de um autor (para notificações)"""
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name="Autor Seguido"
    )
    follower_email = models.EmailField(verbose_name="Email do Seguidor")
    follower_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='following_authors',
        verbose_name="Utilizador Seguidor (Opcional)"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Seguindo desde")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Seguidor"
        verbose_name_plural = "Seguidores"
        unique_together = ('author', 'follower_email')

    def __str__(self):
        return f"{self.follower_email} segue {self.author.get_full_name()}"


# Signal para Notificações de Novos Artigos
@receiver(post_save, sender=Article)
def create_outbox_event_on_publish(sender, instance, created, **kwargs):
    """Cria um evento no Outbox sempre que um artigo é publicado"""
    # Skip metrics updates
    update_fields = kwargs.get('update_fields')
    if update_fields and 'views' in update_fields:
        return

    if instance.is_published:
        # Padrão: Apenas emitir se não existir um evento recente para este artigo 
        # (simples para MVP, em produção usaria comparação de estado 'is_dirty')
        event, created = OutboxEvent.objects.get_or_create(
            event_type='article.published',
            payload={
                'event_id': str(uuid.uuid4()),
                'occurred_at': timezone.now().isoformat(),
                'article_id': instance.id,
                'title': instance.title,
                'excerpt': instance.excerpt,
                'canonical_url': instance.get_absolute_url(),
                'category': instance.category.name if instance.category else 'Geral',
                'author_name': instance.author.get_full_name() or instance.author.username,
            },
            processed=False
        )
        
        if created:
            from django.db import transaction
            from .tasks import dispatch_outbox_task
            # Só despacha se a transação for concluída com sucesso
            transaction.on_commit(lambda: dispatch_outbox_task.delay())


class Bookmark(models.Model):
    """Artigos guardados pelo utilizador (Biblioteca Pessoal)"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookmarks',
        verbose_name="Utilizador"
    )
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='bookmarked_by',
        verbose_name="Artigo"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Guardado em")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Favorito"
        verbose_name_plural = "Favoritos"
        unique_together = ('user', 'article')

    def __str__(self):
        return f"{self.user.username} guardou {self.article.title}"


class UserLike(models.Model):
    """Likes de artigos por utilizadores autenticados"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='article_likes',
        verbose_name="Utilizador"
    )
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='liked_by',
        verbose_name="Artigo"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')
        verbose_name = "Like de Utilizador"
        verbose_name_plural = "Likes de Utilizadores"

    def __str__(self):
        return f"{self.user.username} gostou de {self.article.title}"


@receiver(post_save, sender=Footnote)
def update_karma_on_footnote_approval(sender, instance, **kwargs):
    """Aumenta o Karma do autor quando uma nota é aprovada"""
    if instance.status == 'approved':
        # Tenta encontrar o utilizador pelo username ou email (simplificado)
        # Se o autor da nota for um utilizador registado, damos karma
        try:
            user = User.objects.get(username=instance.author)
            if hasattr(user, 'profile'):
                user.profile.karma += 50  # 50 pontos por contribuição científica
                user.profile.save()
        except User.DoesNotExist:
            pass




# --- Enterprise AI Architecture Models ---

class ArticleChunk(models.Model):
    """Fragmento de artigo para recuperação semântica (RAG)"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField(verbose_name="Conteúdo do Chunk")
    token_count = models.IntegerField(default=0)
    embedding = models.JSONField(null=True, blank=True, help_text="Vetor de embedding (fallback para SQLite)")
    # Para Postgres + pgvector, usar: embedding = VectorField(dimensions=768)
    
    class Meta:
        verbose_name = "Chunk de Artigo"
        verbose_name_plural = "Chunks de Artigos"

    def __str__(self):
        return f"Chunk {self.id} de {self.article.title}"


class UserEvent(models.Model):
    """Eventos de utilizador para o motor de recomendação"""
    EVENT_TYPES = [
        ('view', 'Visualização'),
        ('like', 'Like'),
        ('read_finish', 'Leitura Completa'),
        ('search', 'Pesquisa'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    session_id = models.CharField(max_length=100, db_index=True)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='user_events', null=True, blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    search_query = models.CharField(max_length=255, blank=True)
    read_time_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Evento de Utilizador"
        verbose_name_plural = "Eventos de Utilizadores"


class AISuggestion(models.Model):
    """Auditoria de sugestões editoriais da IA"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='ai_suggestions')
    field = models.CharField(max_length=50, verbose_name="Campo Alvo")
    suggestion_text = models.TextField(verbose_name="Texto Sugerido")
    rationale = models.TextField(blank=True, verbose_name="Justificação da IA")
    is_applied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sugestão de IA"
        verbose_name_plural = "Sugestões de IA"



class OutboxEvent(models.Model):
    """Eventos para serem despachados para sistemas externos (Microserviço Newsletter)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=100, verbose_name="Tipo de Evento")
    payload = models.JSONField(verbose_name="Dados do Evento")
    occurred_at = models.DateTimeField(auto_now_add=True, verbose_name="Ocorrido em")
    processed = models.BooleanField(default=False, verbose_name="Processado")
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Processado em")

    class Meta:
        verbose_name = "Evento Outbox"
        verbose_name_plural = "Eventos Outbox"
        ordering = ['occurred_at']

    def __str__(self):
        return f"{self.event_type} - {self.id} ({'OK' if self.processed else 'PENDING'})"


class ReviewRequest(models.Model):
    """Solicitação de revisão por pares para um artigo"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('accepted', 'Aceite'),
        ('declined', 'Recusada'),
        ('completed', 'Concluída'),
    ]
    
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='review_requests')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_reviews')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    comments = models.TextField(blank=True, verbose_name="Comentários ao Autor")
    editor_notes = models.TextField(blank=True, verbose_name="Notas Privadas ao Editor")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Pedido de Revisão"
        verbose_name_plural = "Pedidos de Revisão"

    def __str__(self):
        return f"Revisão de {self.article.title} por {self.reviewer.username}"
