from django.contrib.sitemaps import Sitemap
from .models import Article, Category
from django.urls import reverse

class ArticleSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.9

    def items(self):
        return Article.objects.filter(status='published').order_by('-published_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # O React frontend está no root. O Django serve o index.html.
        # As rotas do React são /article/<slug>
        return f"/article/{obj.slug}"

class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return f"/?cat={obj.slug}"
