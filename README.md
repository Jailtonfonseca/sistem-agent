# Sistem-Agent 🤖

Um sistema completo de gerenciamento de servidores e containers Docker, combinado com um assistente de IA integrado — como o Portainer encontra o ChatGPT.

## 🚀 Visão Geral

O **Sistem-Agent** é uma plataformaall-in-one que permite:

- **Gerenciar containers Docker** de forma visual e intuitiva
- **Monitorar recursos** do sistema (CPU, memória, disco, rede)
- **Controlar serviços** e processos do servidor
- **Interagir com uma IA** para executar comandos, resolver problemas e automatizar tarefas

## ✨ Funcionalidades

### 🐳 Gerenciamento Docker
- Listar, iniciar, parar e remover containers
- Visualizar logs em tempo real
- Gerenciar imagens e volumes
- Criar e editar containers via interface
- Monitorar status e saúde dos containers

### 💬 Chat de IA Integrado
- Assistente de IA para executar comandos Docker
- Análise de logs e diagnóstico de problemas
- Sugestões de otimização e boas práticas
- Automação de tarefas via linguagem natural
- Explicação de erros e soluções

### 📊 Monitoramento
- Dashboard em tempo real
- Uso de CPU, memória e disco
- Status de todos os containers
- Alertas de recursos
- Histórico de métricas

### 🔧 Sistema
- Gerenciador de processos
- Gerenciador de arquivos
- Terminal virtual integrado
- Gerenciamento de usuários
- Backup e restauração

## 🛠️ Tecnologias

- **Backend:** Node.js, Python, Go
- **Frontend:** React, Next.js, TypeScript
- **Docker:** Docker API, Docker SDK
- **IA:** OpenAI API, Anthropic, Ollama (local)
- **Banco de dados:** PostgreSQL, Redis

## 📦 Instalação

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+
- Python 3.9+

### Clone o projeto
```bash
git clone https://github.com/Jailtonfonseca/sistem-agent.git
cd sistem-agent
```

### Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### Inicie com Docker
```bash
docker-compose up -d
```

### Acesse a aplicação
```
http://localhost:3000
```

## 🔧 Configuração

### Configurar API de IA
No arquivo `.env`:
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Ou Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
```

### Permissões Docker
Certifique-se de ter permissão para acessar o Docker:
```bash
sudo usermod -aG docker $USER
```

## 📖 Uso

### 1. Acesse a interface web
Abra `http://localhost:3000` no seu navegador.

### 2. Gerencie containers
- Clique em "Containers" no menu lateral
- Visualize todos os containers em execução
- Use os botões de ação para iniciar/parar/remover

### 3. Converse com a IA
- Clique no chat na barra lateral
- Pergunte coisas como:
  - "Liste os containers em execução"
  - "Pare o container nginx"
  - "Me mostre os logs do container app"
  - "Qual consumo de memória do sistema?"

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

MIT License - see LICENSE for details.

---

## 🌐 Conecte-se comigo

*   **Instagram:** [jailton_fon](https://instagram.com/jailton_fon)
*   **Facebook:** Zfonseca
Julio Fonseca - fonseca@123.com
*   **TikTok:** [@fonsecac41](https://tiktok.com/@fonsecac41)
*   **Twitch:** [fonsecac41](https://twitch.tv/fonsecac41)
*   **YouTube:** [@JailtonFonseca](https://www.youtube.com/@JailtonFonseca)

📍 **Brasil** 🇧🇷

---

**Desenvolvido por Jailtonfonseca**
