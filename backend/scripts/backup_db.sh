#!/bin/bash

# Configurações
BACKUP_DIR="/home/mergior/backups"
APP_DIR="/home/mergior/apps/sussurro-do-saber"
DB_FILE="$APP_DIR/backend/instance/sussurros.db"
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_NAME="sussurros_backup_$DATE.tar.gz"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se o banco de dados existe
if [ ! -f "$DB_FILE" ]; then
    echo "Erro: Arquivo do banco de dados não encontrado em $DB_FILE"
    exit 1
fi

# Criar o backup compactado
tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$(dirname "$DB_FILE")" "$(basename "$DB_FILE")"

# Verificar se o backup foi criado com sucesso
if [ $? -eq 0 ]; then
    echo "Backup concluído com sucesso: $BACKUP_DIR/$BACKUP_NAME"
else
    echo "Erro ao criar o backup!"
    exit 1
fi

# Rotação: Manter apenas os últimos 7 dias de backup
find "$BACKUP_DIR" -name "sussurros_backup_*.tar.gz" -mtime +7 -delete

echo "Rotação concluída. Mantendo apenas últimos 7 dias."
