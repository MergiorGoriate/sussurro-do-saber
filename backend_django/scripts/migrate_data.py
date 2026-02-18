"""
Script de Migração: Flask (SQLAlchemy/SQLite) -> Django (SQLite)
Mapeia os dados da base de dados antiga para a nova estrutura do Django.
"""
import os
import django
import sqlite3
import sys
from datetime import datetime
from django.utils.text import slugify
from django.utils import timezone


# Configurar ambiente Django
sys.path.append(os.path.join(os.getcwd(), 'backend_django'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from apps.articles.models import Article, Category, Comment, Footnote

# Caminho das bases de dados
FLASK_DB = os.path.join('backend', 'instance', 'sussurros.db')
DJANGO_DB = os.path.join('backend_django', 'db.sqlite3')

def migrate():
    print("🚀 Iniciando migração de dados...")
    
    if not os.path.exists(FLASK_DB):
        print(f"❌ Erro: Base de dados Flask não encontrada em {FLASK_DB}")
        return

    # Conectar ao SQLite do Flask
    conn = sqlite3.connect(FLASK_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Garantir que existe um administrador
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@sussurros.pt',
            'first_name': 'Admin',
            'last_name': 'Sussurros'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("✅ Superusuário admin criado.")

    # Limpar dados existentes para re-migração limpa
    print("🧹 Limpando dados existentes...")
    Article.objects.all().delete()
    Category.objects.all().delete()

    # 2. Migrar Categorias
    print("📁 Migrando categorias...")
    cursor.execute("SELECT DISTINCT category FROM article WHERE category IS NOT NULL")
    categories = cursor.fetchall()
    
    cat_map = {}
    for row in categories:
        name = row['category']
        if name:
            cat, created = Category.objects.get_or_create(
                name=name,
                defaults={'slug': slugify(name)}
            )
            cat_map[name] = cat
            print(f"   + Categoria '{name}' processada.")

    # Mapeamento de meses em Português para parsing de data
    meses = {
        'Jan': 1, 'Fev': 2, 'Mar': 3, 'Abr': 4, 'Mai': 5, 'Jun': 6,
        'Jul': 7, 'Ago': 8, 'Set': 9, 'Out': 10, 'Nov': 11, 'Dez': 12
    }

    # 3. Migrar Artigos
    print("📄 Migrando artigos...")
    cursor.execute("SELECT * FROM article")
    articles = cursor.fetchall()
    
    count = 0
    for row in articles:
        category = cat_map.get(row['category'])
        slug = row['id'] if len(row['id']) > 5 else slugify(row['title'])
        
        # Parsing de data: "20 Out 2024" -> datetime
        pub_date = timezone.now()
        try:
            parts = row['date'].split()
            if len(parts) == 3:
                day = int(parts[0])
                month = meses.get(parts[1], 10)
                year = int(parts[2])
                pub_date = timezone.make_aware(datetime(year, month, day))
        except:
            pass

        # Tratar a imagem: se for URL externa, guardamos como string no campo ImageField 
        # (Django permite se usarmos o nome do ficheiro, mas o serializer tratará a URL)
        img_path = row['image_url'] or ""
        
        obj = Article.objects.create(
            title=row['title'],
            slug=slug,
            summary=row['excerpt'] or "",
            content=row['content'] or "",
            author=admin_user,
            category=category,
            status=row['status'] or 'published',
            published_at=pub_date,
            cover_image=img_path, # Guardar path original
            views=row['views'] or 0,
            likes=row['likes'] or 0,
            reading_time=row['read_time'] or 0,
            citations=row['citations'] or 0,
            altmetric_score=row['altmetric_score'] or 0,
            download_count=row['download_count'] or 0,
            doi=row['doi'] or "",
            issn=row['issn'] or "2024-99XX",
            volume=row['volume'] or 1,
            issue=row['issue'] or 1,
        )
        
        # Adicionar tags
        tags_str = row['tags'] or ""
        tags_list = [t.strip() for t in tags_str.split(',') if t.strip()]
        if tags_list:
            obj.tags.add(*tags_list)
        
        count += 1
        print(f"   + [{count}/35] Artigo '{obj.title[:30]}...' migrado.")


    print(f"✅ Migração concluída: {count} novos artigos adicionados.")
    conn.close()

if __name__ == "__main__":
    migrate()
