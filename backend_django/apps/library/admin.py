from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Author, Institution, Collection, Publication

@admin.register(Institution)
class InstitutionAdmin(ModelAdmin):
    list_display = ("name", "country", "website")
    search_fields = ("name", "country")
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Author)
class AuthorAdmin(ModelAdmin):
    list_display = ("name", "orcid", "user")
    search_fields = ("name", "orcid")
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Collection)
class CollectionAdmin(ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Publication)
class PublicationAdmin(ModelAdmin):
    list_display = ("title", "type", "year", "access_level", "is_verified", "views_count", "downloads_count")
    list_filter = ("type", "access_level", "is_verified", "year", "country")
    search_fields = ("title", "abstract", "doi_internal")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("authors", "collections")
    readonly_fields = ("doi_internal", "views_count", "downloads_count")
    
    fieldsets = (
        ("Informação Principal", {
            "fields": ("title", "slug", "type", "abstract", "keywords")
        }),
        ("Metadados Académicos", {
            "fields": ("year", "language", "country", "province", "institution", "authors", "collections")
        }),
        ("Ficheiros e Acesso", {
            "fields": ("cover_image", "pdf_file", "access_level", "is_verified")
        }),
        ("Métricas e Identificação", {
            "fields": ("doi_internal", "views_count", "downloads_count")
        }),
    )
