#!/bin/bash

# ============================================
# Script de Instalação - Sistem-Agent
# Servidor: 192.168.1.108
# ============================================

set -e

echo "🚀 Instalando Sistem-Agent..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Atualizar sistema
echo -e "${GREEN}Atualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar dependências
echo -e "${GREEN}Instalando dependências...${NC}"
apt install -y curl git nginx certbot python3-certbot-nginx

# Instalar Node.js
echo -e "${GREEN}Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar Docker
echo -e "${GREEN}Instalando Docker...${NC}"
curl -fsSL https://get.docker.com | sh
usermod -aG docker www-data

# Instalar Docker Compose
echo -e "${GREEN}Instalando Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Criar diretório do projeto
echo -e "${GREEN}Criando diretórios...${NC}"
mkdir -p /var/www/sistem-agent
cd /var/www/sistem-agent

# Clonar repositório
echo -e "${GREEN}Clonando repositório...${NC}"
git clone https://github.com/Jailtonfonseca/sistem-agent.git .

# Criar arquivo .env
echo -e "${GREEN}Criando configurações...${NC}"
cp .env.example .env

# Editar .env com configurações
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://torado.store
NEXT_PUBLIC_API_URL=/api

# AI
AI_PROVIDER=openai
OPENAI_API_KEY=SUA_CHAVE_AQUI

# Error Monitoring -指向本服务器
ERROR_MONITOR_URL=http://localhost:3002
APP_NAME=sistem-agent
APP_VERSION=1.0.0
EOF

# Build e start dos containers
echo -e "${GREEN}Iniciando containers...${NC}"
docker-compose up -d --build

# Configurar Nginx
echo -e "${GREEN}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/sistem-agent << 'EOF'
server {
    listen 80;
    server_name torado.store www.torado.store;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/sistem-agent /etc/nginx/sites-enabled/
nginx -t

# Configurar SSL (se domínio estiver pointing)
echo -e "${YELLOW}Para configurar SSL, execute:${NC}"
echo "  certbot --nginx -d torado.store -d www.torado.store"

# Criar script de atualização
cat > /usr/local/bin/sistem-update << 'EOF'
#!/bin/bash
cd /var/www/sistem-agent
git pull
docker-compose down
docker-compose up -d --build
echo "Sistema atualizado!"
EOF
chmod +x /usr/local/bin/sistem-update

# Criar script de backup
cat > /usr/local/bin/sistem-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/sistem-agent"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/sistem-agent_$DATE.tar.gz /var/www/sistem-agent
echo "Backup criado: $BACKUP_DIR/sistem-agent_$DATE.tar.gz"
EOF
chmod +x /usr/local/bin/sistem-backup

# Configurar firewall
echo -e "${GREEN}Configurando firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}  Instalação concluída!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo "Acesse: http://torado.store"
echo ""
echo "Comandos úteis:"
echo "  sistem-update  - Atualizar sistema"
echo "  sistem-backup  - Fazer backup"
echo "  docker-compose logs -f - Ver logs"
echo "  docker-compose restart - Reiniciar"
echo ""
echo "Edite o arquivo .env para configurar a API da OpenAI"
echo "  nano /var/www/sistem-agent/.env"
echo ""
echo "Para configurar SSL:"
echo "  certbot --nginx -d torado.store -d www.torado.store"
