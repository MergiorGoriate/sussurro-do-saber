<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://6996744ab3906ad69abd9423.imgix.net/D%3A/Fotos/Genio%20purificado%20da%20desgraca/5.png" />
</div>

# Sussurros do Saber 🦉

[![CI/CD Pipeline](https://github.com/MergiorGoriate/sussurro-do-saber/actions/workflows/deploy.yml/badge.svg)](https://github.com/MergiorGoriate/sussurro-do-saber/actions/workflows/deploy.yml)

Sussurros do Saber é uma plataforma digital africana de divulgação científica e publicação académica, concebida para fortalecer a produção intelectual no continente através de tecnologia moderna, rigor científico e contextualização africana.

## Missão

Democratizar o acesso ao conhecimento científico em África, promovendo conteúdos académicos contextualizados à realidade africana e fortalecendo a soberania intelectual digital do continente.

## Tech Stack 🛠️

- **Frontend**: React, TypeScript, Vite, TailwindCSS.
- **Backend**: Python 3.12, Django 5.0, Django REST Framework.
- **Database**: PostgreSQL (Produção via Docker) / SQLite (Dev).
- **Infrastructure**: Docker, Docker Compose, WhiteNoise.
- **AI Integration**: Google Gemini (Resumos, Glossário, Chat).

## 🏗 Arquitectura do Sistema

```bash
sussurros-do-saber/
│
├── frontend/        # React + Next.js (TypeScript)
├── backend/         # Django REST API
├── cms/             # CMS custom (Django)
├── infrastructure/  # Nginx, Docker, Deploy configs
└── docs/            # Documentação técnica
```

## 🧠 Arquitectura Tecnológica

A plataforma foi concebida com uma arquitectura moderna, escalável e preparada para milhares de utilizadores.

### 🔹 Frontend

- React + Next.js
- TypeScript
- SSR/SSG para performance e SEO académico
- Interface optimizada para leitura científica

### 🔹 Backend (API Principal)

- Django (Python)
- Django REST Framework
- Autenticação segura
- Sistema de autores, artigos e categorias
- Integração com Redis e Celery

### 🔹 CMS (Gestão Editorial)

- Flask (100% customizado)
- Painel administrativo próprio
- Gestão de:
- Artigos
- Livros
- Monografias
- Teses
- Recursos educativos
- Autores

### 🔹 Infraestrutura

- Hosting: Hetzner VPS
- Armazenamento: Cloudflare R2 (object storage)
- Cache & Real-time: Redis
- Background Tasks: Celery
- Nginx: Reverse proxy e gestão de domínio
- PostgreSQL: Base de dados principal

### 1. Backend (Django)

```bash
cd backend_django
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend (React)

```bash
npm install
npm run dev
```

Aceda a:

- **Site**: [http://localhost:8000](http://localhost:5173)
- **Admin/CMS**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

## Deployment (Docker) 🐳

Para rodar em produção com PostgreSQL e Gunicorn:

```bash
docker-compose up --build -d
```

O sistema estará disponível na porta `8000`.

## Configuração de Ambiente ⚙️

Crie um arquivo `.env` na pasta `backend_django/` com as seguintes chaves:

```ini
SECRET_KEY=sua-chave-secreta-django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=sua-chave-api-gemini
```

Para o Frontend, crie um arquivo `.env.local` na raiz do projeto:

```ini
GEMINI_API_KEY=sua-chave-api-gemini
```

> **Nota:** Após alterar o `.env.local`, execute `npm run build` para recompilar os assets.

## Testes Automatizados 🧪

O projeto inclui uma suite de testes para garantir a estabilidade.

```bash
cd backend_django
pytest
```

## Documentação 📚

Verifique a pasta `.gemini/antigravity/brain/...` para documentação detalhada:

- `walkthrough.md`: Guia passo-a-passo e histórico de mudanças.
- `architecture.md`: Visão técnica da arquitetura.
- `implementation_plan.md`: Plano de execução original.
