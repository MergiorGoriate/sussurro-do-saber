from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import Article, Category, Comment, Footnote, Subscriber, Profile, AuthorMessage, AuthorFollower, ReviewRequest
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from unfold.contrib.filters.admin import DropdownFilter, ChoicesDropdownFilter, RelatedDropdownFilter
from simple_history.admin import SimpleHistoryAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    """Admin para categorias"""
    list_display = ['name', 'slug', 'article_count']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    
    def article_count(self, obj):
        count = obj.articles.count()
        return format_html('<strong>{}</strong> artigos', count)
    article_count.short_description = 'Total de Artigos'



class CommentInline(TabularInline):
    """Inline para comentários no artigo"""
    model = Comment
    extra = 0
    fields = ['author_name', 'author_email', 'content', 'status', 'created_at']
    readonly_fields = ['created_at']
    can_delete = True


class FootnoteInline(TabularInline):
    """Inline para sugestões no artigo"""
    model = Footnote
    extra = 0
    fields = ['author', 'type', 'content', 'status', 'created_at']
    readonly_fields = ['created_at']
    can_delete = True


@admin.register(Article)
class ArticleAdmin(SimpleHistoryAdmin, ModelAdmin):
    """Admin personalizado para artigos"""
    
    list_display = [
        'display_thumbnail',
        'title', 
        'display_author', 
        'category', 
        'display_status',
        'published_at', 
        'views', 
        'preview_link'
    ]
    
    list_display_links = ['display_thumbnail', 'title']
    list_filter = [
        ('status', ChoicesDropdownFilter),
        ('category', RelatedDropdownFilter),
        ('author', RelatedDropdownFilter),
        'published_at',
    ]
    list_filter_sheet = True
    list_full_width = True
    
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views']
    
    fieldsets = [
        (
            "Conteúdo Principal",
            {
                "fields": ["title", "slug", "status", "excerpt", "content", "cover_image"],
                "classes": ["unfold-section-blue"],
            },
        ),
        (
            "Classificação e Autoria",
            {
                "fields": ["category", "tags", "author"],
            },
        ),
        (
            "Publicação e Métricas",
            {
                "fields": ["published_at", "views"],
            },
        ),
    ]

    # Tabs para um layout premium
    tabs = {
        "Geral": ["Conteúdo Principal", "Classificação e Autoria"],
        "Publicação": ["Publicação e Métricas"],
    }

    def display_thumbnail(self, obj):
        """Exibe uma miniatura da imagem de capa na listagem"""
        if obj.cover_image:
            return format_html(
                '<img src="{}" class="w-16 h-10 object-cover rounded-lg shadow-sm" style="border: 1px solid #e2e8f0;" />',
                obj.cover_image.url
            )
        # Fallback para quando não há imagem
        return format_html(
            '<div class="w-16 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 border border-slate-200">'
            '<i class="material-symbols-outlined" style="font-size: 20px;">image</i>'
            '</div>'
        )
    display_thumbnail.short_description = "Capa"
    
    def display_status(self, obj):
        """Exibe o status com badges estilizados e cores semânticas"""
        colors = {
            'published': 'bg-green-100 text-green-700 border-green-200',
            'draft': 'bg-slate-100 text-slate-600 border-slate-200',
            'under_review': 'bg-amber-100 text-amber-700 border-amber-200',
            'archived': 'bg-red-100 text-red-700 border-red-200',
        }
        labels = dict(Article.STATUS_CHOICES)
        color_class = colors.get(obj.status, 'bg-gray-100 text-gray-600 border-gray-200')
        label = labels.get(obj.status, obj.status)
        
        # Estilo de ponto indicador
        dot_colors = {
            'published': 'bg-green-500',
            'under_review': 'bg-amber-500',
            'draft': 'bg-slate-400',
            'archived': 'bg-red-500',
        }
        dot_color = dot_colors.get(obj.status, 'bg-gray-400')
        
        return format_html(
            '<span class="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-2 w-fit {}">'
            '<span class="w-1.5 h-1.5 rounded-full {}"></span>'
            '{}'
            '</span>',
            color_class, dot_color, label
        )
    display_status.short_description = "Estado"
    
    def display_author(self, obj):
        """Exibe o autor com uma estilização mais limpa, estilo Beam"""
        if not obj.author:
            return "-"
        name = obj.author.get_full_name() or obj.author.username
        # Usando um avatar gerado se não houver foto (neste caso o Django User não tem foto por padrão)
        return format_html(
            '<div class="flex items-center gap-3">'
            '<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden shadow-inner">'
            '{}'
            '</div>'
            '<span class="text-sm font-medium text-slate-700">{}</span>'
            '</div>',
            name[0].upper(), name
        )
    display_author.short_description = "Criador"

    def preview_link(self, obj):
        """Link para pré-visualizar o artigo no frontend com ícone"""
        if obj.pk and obj.slug:
            url = f"/#/article/{obj.slug}"
            return format_html(
                '<a href="{}" target="_blank" class="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-black transition-colors">'
                '<span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span>'
                'Site'
                '</a>', 
                url
            )
        return "-"
    preview_link.short_description = "Visualizar"
    
    def publish_articles(self, request, queryset):
        updated = queryset.update(status='published', published_at=timezone.now())
        self.message_user(request, f"{updated} artigo(s) publicado(s).", level='success')
    publish_articles.short_description = "Publicar selecionados"
    
    def send_to_review(self, request, queryset):
        updated = queryset.update(status='under_review')
        self.message_user(request, f"{updated} artigo(s) em revisão pelos pares.", level='info')
    send_to_review.short_description = "Enviar para revisão pelos pares"
    
    def archive_articles(self, request, queryset):
        updated = queryset.update(status='archived')
        self.message_user(request, f"{updated} artigo(s) arquivados.", level='warning')
    archive_articles.short_description = "Arquivar artigos"
    
    actions = [
        'publish_articles', 
        'send_to_review', 
        'archive_articles', 
        'mark_as_draft',
        'generate_excerpt_ai'
    ]

    def generate_excerpt_ai(self, request, queryset):
        """Gera automaticamente o resumo/excerto do artigo usando IA (Gemini)"""
        from .utils import generate_ai_summary
        
        success_count = 0
        for article in queryset:
            if article.content:
                try:
                    summary = generate_ai_summary(article.content)
                    # Limpar possíveis aspas ou prefixos chatos que a IA possa meter
                    summary = summary.strip().replace('**', '').replace('###', '')
                    article.excerpt = summary
                    article.save(update_fields=['excerpt'])
                    success_count += 1
                except Exception as e:
                    self.message_user(request, f"Erro ao processar '{article.title}': {str(e)}", level='error')
        
        if success_count:
            self.message_user(request, f"IA gerou com sucesso excertos para {success_count} artigo(s).", level='success')
    generate_excerpt_ai.short_description = "✨ Gerar Resumo AI (Gemini)"
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.author = request.user
        super().save_model(request, obj, form, change)
    
    def has_delete_permission(self, request, obj=None):
        """Apenas superusers podem deletar artigos"""
        if request.user.is_superuser:
            return True
        return False
    
    class Media:
        """Injeta o editor EasyMDE (Markdown WYSIWYG)"""
        css = {
            'all': (
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', # Ícones para o EasyMDE
                'https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css',
                # Ajustes para o tema Unfold/Slate
                'css/admin_editor_overrides.css', 
            )
        }
        js = (
            'https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js',
            'js/admin_editor.js',
        )


@admin.register(Comment)
class CommentAdmin(ModelAdmin):
    """Admin para comentários"""
    list_display = ['author_name', 'article', 'status', 'created_at']
    list_filter = [
        ('status', ChoicesDropdownFilter),
        ('article', RelatedDropdownFilter),
        'created_at',
    ]
    list_filter_sheet = True
    search_fields = ['author_name', 'author_email', 'content', 'article__title']
    readonly_fields = ['created_at']
    actions = ['approve_comments', 'reject_comments']
    
    def approve_comments(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f"{updated} aprovados.", level='success')
    approve_comments.short_description = "Aprovar"
    
    def reject_comments(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f"{updated} rejeitados.", level='warning')
    reject_comments.short_description = "Rejeitar"


@admin.register(Footnote)
class FootnoteAdmin(ModelAdmin):
    """Admin para sugestões/footnotes"""
    list_display = ['article', 'author', 'type', 'status', 'created_at']
    list_filter = [
        ('type', ChoicesDropdownFilter),
        ('status', ChoicesDropdownFilter),
        ('article', RelatedDropdownFilter),
        'created_at',
    ]
    list_filter_sheet = True
    readonly_fields = ['created_at']
    actions = ['approve_footnotes', 'reject_footnotes']
    
    def approve_footnotes(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f"{updated} aprovadas.", level='success')
    approve_footnotes.short_description = "Aprovar"
    
    def reject_footnotes(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f"{updated} rejeitadas.", level='warning')
    reject_footnotes.short_description = "Rejeitar"


@admin.register(Subscriber)
class SubscriberAdmin(ModelAdmin):
    """Admin para subscritores"""
    list_display = ['email', 'created_at', 'is_active']
    list_filter = [
        'is_active',
        'created_at',
    ]
    list_filter_sheet = True
    search_fields = ['email']
    readonly_fields = ['created_at']


# Customizar o site admin
admin.site.site_header = "Sussurros do Saber - CMS"
admin.site.site_title = "Sussurros do Saber Admin"
admin.site.index_title = "Painel de Administração"


# Re-register User Admin with Profile Inline
admin.site.unregister(User)

class ProfileInline(StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Perfil de Investigador'
    fk_name = 'user'
    
    fieldsets = (
        (None, {'fields': ('photo', 'bio', 'karma')}),
        ('Académico', {'fields': ('institution', 'scientific_area', 'citation_count')}),
        ('Links', {'fields': ('linkedin_url', 'research_gate_url', 'orcid_url')}),
        ('Badges & Reconhecimento', {'fields': ('badges',)}),
        ('Publicações', {'fields': ('external_publications',)}),
    )

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    """Admin de utilizador estendido com perfil"""
    inlines = (ProfileInline,)
    list_display = ['username', 'email', 'first_name', 'last_name', 'get_institution', 'is_staff']
    
    def get_institution(self, instance):
        # Evitar erro se o perfil não existir (embora o signal deva criar)
        if hasattr(instance, 'profile'):
            return instance.profile.institution
        return "-"
    get_institution.short_description = 'Instituição'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('profile')


@admin.register(AuthorMessage)
class AuthorMessageAdmin(ModelAdmin):
    list_display = ('name', 'email', 'get_author', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('author', 'name', 'email', 'message', 'created_at')
    
    actions = ['mark_as_read']

    def get_author(self, obj):
        return obj.author.get_full_name() or obj.author.username
    get_author.short_description = "Destinatário"

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Marcar como lidas"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

    def has_add_permission(self, request):
        return False # Messages are created via API only

@admin.register(AuthorFollower)
class AuthorFollowerAdmin(ModelAdmin):
    list_display = ('follower_email', 'get_author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('follower_email',)
    readonly_fields = ('author', 'follower_email', 'follower_user', 'created_at')

    def get_author(self, obj):
        return obj.author.get_full_name() or obj.author.username
    get_author.short_description = "Autor Seguido"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

    def has_add_permission(self, request):
        return False # Followers are created via API only


@admin.register(ReviewRequest)
class ReviewRequestAdmin(ModelAdmin):
    list_display = ('article', 'reviewer', 'display_status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('article__title', 'reviewer__username', 'comments')
    
    def display_status(self, obj):
        colors = {
            'pending': 'bg-amber-100 text-amber-700 border-amber-200',
            'accepted': 'bg-blue-100 text-blue-700 border-blue-200',
            'declined': 'bg-red-100 text-red-700 border-red-200',
            'completed': 'bg-green-100 text-green-700 border-green-200',
        }
        labels = dict(ReviewRequest.STATUS_CHOICES)
        color_class = colors.get(obj.status, 'bg-gray-100 text-gray-600 border-gray-200')
        label = labels.get(obj.status, obj.status)
        
        return format_html(
            '<span class="px-2.5 py-1 rounded-full text-xs font-bold border {}">'
            '{}'
            '</span>',
            color_class, label
        )
    display_status.short_description = "Estado da Revisão"