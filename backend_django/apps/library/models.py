from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
from taggit.managers import TaggableManager
import uuid

class Institution(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nome da Instituição")
    slug = models.SlugField(max_length=255, unique=True)
    country = models.CharField(max_length=100, verbose_name="País")
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='library/institutions/', blank=True, null=True)

    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Author(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nome Completo")
    slug = models.SlugField(max_length=255, unique=True)
    bio = models.TextField(blank=True, verbose_name="Biografia")
    photo = models.ImageField(upload_to='library/authors/', blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='library_author_profile')
    orcid = models.CharField(max_length=50, blank=True, verbose_name="ORCID")

    class Meta:
        verbose_name = "Autor Académico"
        verbose_name_plural = "Autores Académicos"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Collection(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nome da Coleção")
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='library/collections/', blank=True, null=True)

    class Meta:
        verbose_name = "Coleção"
        verbose_name_plural = "Coleções"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Publication(models.Model):
    TYPE_CHOICES = [
        ('BOOK', 'Livro'),
        ('ARTICLE', 'Artigo'),
        ('JOURNAL', 'Revista'),
        ('THESIS', 'Tese'),
        ('TFC', 'Trabalho de Fim de Curso'),
        ('MONOGRAPH', 'Monografia'),
        ('MANUAL', 'Manual Local'),
        ('AFRICAN_CONTEXT', 'Recurso Contextualizado (África)'),
    ]

    ACCESS_CHOICES = [
        ('OPEN', 'Acesso Livre'),
        ('REGISTERED', 'Apenas Utilizadores Registados'),
        ('RESTRICTED', 'Acesso Restrito (Requer Permissão)'),
    ]

    title = models.CharField(max_length=500, verbose_name="Título")
    slug = models.SlugField(max_length=500, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Tipo de Publicação")
    abstract = models.TextField(verbose_name="Resumo / Abstract")
    keywords = TaggableManager(blank=True, verbose_name="Palavras-Chave")
    
    year = models.IntegerField(verbose_name="Ano de Publicação")
    language = models.CharField(max_length=50, default="Português", verbose_name="Idioma")
    country = models.CharField(max_length=100, verbose_name="País de Origem")
    province = models.CharField(max_length=100, blank=True, verbose_name="Província / Estado")
    
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='publications')
    authors = models.ManyToManyField(Author, related_name='publications', verbose_name="Autores")
    collections = models.ManyToManyField(Collection, blank=True, related_name='publications', verbose_name="Coleções")

    cover_image = models.ImageField(upload_to='library/covers/%Y/%m/', blank=True, null=True, verbose_name="Capa")
    pdf_file = models.FileField(upload_to='library/pdfs/%Y/%m/', verbose_name="Ficheiro PDF")
    
    access_level = models.CharField(max_length=20, choices=ACCESS_CHOICES, default='OPEN', verbose_name="Nível de Acesso")
    
    views_count = models.PositiveIntegerField(default=0, verbose_name="Visualizações")
    downloads_count = models.PositiveIntegerField(default=0, verbose_name="Downloads")
    is_verified = models.BooleanField(default=False, verbose_name="Verificado pela Equipa Editorial")
    
    doi_internal = models.CharField(max_length=100, blank=True, unique=True, verbose_name="DOI Interno (SDS)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Publicação"
        verbose_name_plural = "Publicações"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        if not self.doi_internal:
            # Format: SDS-YYYY-RANDOM
            random_part = uuid.uuid4().hex[:5].upper()
            self.doi_internal = f"SDS-{self.year}-{random_part}"
            
        super().save(*args, **kwargs)
