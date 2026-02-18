from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from apps.articles.sitemaps import ArticleSitemap, CategorySitemap

sitemaps = {
    'articles': ArticleSitemap,
    'categories': CategorySitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.articles.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.views.generic import TemplateView, RedirectView
from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}), # Serve media in production (Docker without Nginx)
    re_path(r'^admin/?$', RedirectView.as_view(url='/admin/login/', permanent=False)), # Catch /admin without slash
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')), # Catch-all for React
]
