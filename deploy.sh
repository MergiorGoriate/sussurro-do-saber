#!/bin/bash
set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Deploy do Sussurros do Saber...${NC}"

# 1. Verificar Pré-requisitos
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Erro: Docker não está instalado.${NC}"
    echo "Por favor instale o Docker e tente novamente."
    exit 1
fi

# 2. Verificar Variáveis de Ambiente
if [ ! -f backend_django/.env ]; then
    echo -e "${BLUE}ℹ️ Arquivo .env não encontrado. Criando a partir do exemplo...${NC}"
    cp backend_django/.env.example backend_django/.env
    echo -e "${GREEN}✅ .env criado. IMPORTANTE: Edite-o com suas chaves de produção!${NC}"
fi

# 3. Construir Frontend (Usando Docker para não depender de Node local)
echo -e "${BLUE}📦 Construindo Frontend (via Node container)...${NC}"
docker run --rm -v "$(pwd):/app" -w /app node:20-alpine sh -c "npm ci && npm run build"

if [ ! -d "dist" ]; then
    echo -e "${RED}Erro: Build do frontend falhou (pasta dist não encontrada).${NC}"
    exit 1
fi

# 4. Preparar Arquivos Estáticos para o Django
echo -e "${BLUE}📂 Integrando Frontend ao Backend...${NC}"
# Limpar antigos
rm -rf backend_django/static/assets
rm -f backend_django/templates/index.html

# Criar diretórios se não existirem
mkdir -p backend_django/static/assets
mkdir -p backend_django/templates

# Copiar novos
cp -r dist/assets/* backend_django/static/assets/
cp dist/index.html backend_django/templates/index.html

echo -e "${GREEN}✅ Integração concluída.${NC}"

# 5. Iniciar Serviços Backend
echo -e "${BLUE}🐳 Iniciando Contentores Docker...${NC}"
cd backend_django

# Parar contentores antigos se existirem
docker compose down --remove-orphans || true

# Subir novos
docker compose up -d --build

# 6. Verificação Final
echo -e "${BLUE}🔍 Verificando status...${NC}"
sleep 5
if docker compose ps | grep -q "Up"; then
    PUBLIC_IP=$(curl -s ifconfig.me || echo "localhost")
    echo -e "${GREEN}✅ Deploy Concluído com Sucesso!${NC}"
    echo -e "Acesse sua aplicação em: http://$PUBLIC_IP:8000"
    echo -e "Painel Admin: http://$PUBLIC_IP:8000/admin/"
else
    echo -e "${RED}⚠️ Parece que houve um problema na inicialização dos contentores.${NC}"
    echo "Verifique os logs com: cd backend_django && docker compose logs"
fi
