<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sussurros do Saber 🦉

Uma plataforma moderna de publicação académica e científica, focada na experiência de leitura e descoberta.

## Tech Stack 🛠️

- **Frontend**: React, TypeScript, Vite, TailwindCSS.
- **Backend**: Python 3.12, Django 5.0, Django REST Framework.
- **Database**: PostgreSQL (Produção via Docker) / SQLite (Dev).
- **Infrastructure**: Docker, Docker Compose, WhiteNoise.
- **AI Integration**: Google Gemini (Resumos, Glossário, Chat).

## Como Executar (Localmente) 💻

### Pré-requisitos

- Node.js & npm
- Python 3.12+
- Docker (Opcional para dev, obrigatório para deploy)

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

- **Site**: [http://localhost:8000](http://localhost:8000)
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
