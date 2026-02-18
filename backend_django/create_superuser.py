"""
Script para criar superusuário Django automaticamente
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# Criar superusuário se não existir
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@sussurros.pt',
        password='admin123',
        first_name='Admin',
        last_name='Sussurros'
    )
    print("✅ Superusuário criado com sucesso!")
    print("   Username: admin")
    print("   Password: admin123")
    print("   Email: admin@sussurros.pt")
else:
    print("ℹ️  Superusuário 'admin' já existe.")
