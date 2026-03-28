#!/bin/bash

# ============================================
# Script de Instalação - Sistem-Agent
# Para OrangePi / Armbian / Debian
# ============================================

set -e

echo "🚀 Instalando Sistem-Agent..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detectar SO
if [ -f /etc/armbian-release ]; then
    OS="armbian"
elif [ -f /etc/debian_version ]; then
    OS="debian"
else
    OS="unknown"
fi
echo "Detectado: $OS"

# Atualizar sistema
echo -e "${GREEN}Atualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar dependências
echo -e "${GREEN}Instalando dependências...${NC}"
apt install -y curl git nginx

# Instalar Node.js
echo -e "${GREEN}Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar Docker
echo -e "${GREEN}Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker root
fi

# Instalar Docker Compose
echo -e "${GREEN}Instalando Docker Compose...${NC}"
apt install -y docker-compose

# Criar diretório do projeto
echo -e "${GREEN}Baixando Sistem-Agent...${NC}"
mkdir -p /opt/sistem-agent
cd /opt/sistem-agent
git clone https://github.com/Jailtonfonseca/sistem-agent.git .
cd sistem-agent || cd .

# Criar arquivo .env
echo -e "${GREEN}Criando configurações...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Configurar com valores padrão
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://torado.store
NEXT_PUBLIC_API_URL=http://torado.store/api

# AI - Configure sua chave
AI_PROVIDER=openai
OPENAI_API_KEY=SUA_CHAVE_OPENAI_AQUI

# Error Monitoring - Servidor local
ERROR_MONITOR_URL=http://localhost:3002
APP_NAME=sistem-agent
APP_VERSION=1.0.0
EOF
fi

# Criar rede Docker
echo -e "${GREEN}Criando rede Docker...${NC}"
docker network create sistem-agent 2>/dev/null || true

# Build dos containers
echo -e "${GREEN}Buildando containers (isso pode demorar)...${NC}"
docker-compose build

# Iniciar containers
echo -e "${GREEN}Iniciando containers...${NC}"
docker-compose up -d

# Esperar containers iniciarem
sleep 10

# Configurar Nginx para acesso local
echo -e "${GREEN}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/sistem-agent << 'EOF'
server {
    listen 80;
    server_name torado.store www.torado.store 127.0.0.1 localhost;

    # Redirect HTTP to HTTPS (optional - remove if not using SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3001;
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
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host $host;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/sistem-agent /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Adicionar ao /etc/hosts se necessário
if ! grep -q \"torado.store\" /etc/hosts; then
    echo \"127.0.0.1 torado.store www.torado.store\" >> /etc/hosts
fi

# Criar scripts de gestão
echo -e "${GREEN}Criando scripts de gestão...${NC}"

cat > /usr/local/bin/sistem-update << 'EOF'
#!/bin/bash
cd /opt/sistem-agent/sistem-agent
git pull
docker-compose down
docker-compose build
docker-compose up -d
echo \"✅ Sistema atualizado!\"
EOF

cat > /usr/local/bin/sistem-logs << 'EOF'
#!/bin/bash
cd /opt/sistem-agent/sistem-agent
docker-compose logs -f
EOF

cat > /usr/local/bin/sistem-status << 'EOF'
#!/bin/bash
cd /opt/sistem-agent/sistem-agent
docker-compose ps
EOF

chmod +x /usr/local/bin/sistem-*

# Configurar inicialização automática
echo -e "${GREEN}Configurando inicialização...${NC}"
cat > /etc/systemd/system/sistem-agent.service << 'EOF'
[Unit]
Description=Sistem-Agent Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker-compose -f /opt/sistem-agent/sistem-agent/docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f /opt/sistem-agent/sistem-agent/docker-compose.yml down
WorkingDirectory=/opt/sistem-agent/sistem-agent
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sistem-agent.service 2>/dev/null || true

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}  Instalação concluída!${NC}"
echo -e "${GREEN}===================================${NC}"
echo \"\"
echo \"🚀 Acesse: http://torado.store\"
echo \"\"
echo \"📋 Comandos úteis:\"
echo \"   sistem-status   - Ver status\"
echo \"   sistem-logs    - Ver logs\"
echo \"   sistem-update  - Atualizar sistema\"
echo \"\"
echo \"📁 Arquivo .env:\"
echo \"   nano /opt/sistem-agent/sistem-agent/.env\"
echo \"\"
echo \"⚠️  Lembre-se de configurar sua API Key da OpenAI no arquivo .env\"
echo \"\"
echo \"Containers rodando:\"
docker-compose ps
