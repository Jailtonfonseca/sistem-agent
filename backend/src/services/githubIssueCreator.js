/**
 * GitHub Issue Creator
 * Cria issues automaticamente no GitHub quando ocorrem erros
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';

class GitHubIssueCreator {
  constructor() {
    this.enabled = !!process.env.GITHUB_REPO;
    this.repo = process.env.GITHUB_REPO || 'Jailtonfonseca/sistem-agent';
    this.token = process.env.GITHUB_TOKEN;
    this.labels = process.env.ISSUE_LABELS || 'bug,auto-reported';
    this.appVersion = process.env.APP_VERSION || '1.0.0';
    this.appName = process.env.APP_NAME || 'sistem-agent';
    
    if (this.enabled && this.token) {
      logger.info(`GitHub Issue Creator enabled for: ${this.repo}`);
    } else if (this.enabled && !this.token) {
      logger.warn('GITHUB_TOKEN não configurado - Issues não serão criadas');
    }
  }

  // Criar issue no GitHub
  async createIssue(error, context = {}) {
    if (!this.enabled) {
      logger.debug('GitHub Issue Creator desabilitado');
      return null;
    }

    if (!this.token) {
      logger.warn('Token GitHub não configurado - impossível criar issue');
      return null;
    }

    try {
      // Verificar se é um erro duplicado recente
      const isDuplicate = await this.checkDuplicateError(error.message);
      if (isDuplicate) {
        logger.info(`Erro duplicado recente - não criando issue: ${error.message.slice(0, 50)}...`);
        return null;
      }

      // Criar título da issue
      const title = this.generateTitle(error);

      // Criar corpo da issue
      const body = this.generateBody(error, context);

      // Criar a issue
      const response = await axios.post(
        `https://api.github.com/repos/${this.repo}/issues`,
        {
          title,
          body,
          labels: this.labels.split(',').map(l => l.trim())
        },
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      logger.info(`Issue criada: #${response.data.number} - ${title}`);
      return {
        number: response.data.number,
        url: response.data.html_url,
        title: response.data.title
      };

    } catch (error) {
      logger.error(`Erro ao criar issue no GitHub: ${error.message}`);
      return null;
    }
  }

  // Verificar se é erro duplicado (últimas 24h)
  async checkDuplicateError(errorMessage) {
    try {
      const searchTerm = encodeURIComponent(errorMessage.slice(0, 100));
      const response = await axios.get(
        `https://api.github.com/search/issues?q=repo:${this.repo}+is:issue+${searchTerm}+created:>=${this.getYesterdayDate()}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data.total_count > 0;
    } catch (error) {
      // Se falhar a busca, permite criar
      logger.debug(`Erro ao verificar duplicatas: ${error.message}`);
      return false;
    }
  }

  // Gerar título da issue
  generateTitle(error) {
    const prefix = this.appName.toUpperCase();
    const errorType = error.name || 'Error';
    const shortMessage = error.message?.slice(0, 60) || 'Erro desconhecido';
    
    return `[${prefix}] ${errorType}: ${shortMessage}...`;
  }

  // Gerar corpo da issue
  generateBody(error, context) {
    const timestamp = new Date().toISOString();
    
    let body = `## 🚨 Erro Automático Reportado

**Data:** ${timestamp}
**Versão:** ${this.appVersion}
**Aplicação:** ${this.appName}

---

### 📋 Descrição do Erro

**Tipo:** ${error.name || 'Unknown'}
**Mensagem:** 
\`\`\`
${error.message || 'Sem mensagem'}
\`\`\`

`;

    // Adicionar stack trace se disponível
    if (error.stack) {
      body += `### 📚 Stack Trace
\`\`\`
${error.stack.slice(0, 2000)}
\`\`\`

`;
    }

    // Adicionar contexto adicional
    body += `### 🔍 Contexto

`;

    if (context.type) {
      body += `- **Tipo de Erro:** ${context.type}\n`;
    }

    if (context.request) {
      body += `- **URL:** ${context.request.method} ${context.request.url}\n`;
    }

    // Informações do sistema
    if (context.platform || context.nodeVersion) {
      body += `\n### 💻 Sistema\n`;
      body += `- **Plataforma:** ${context.platform || 'N/A'}\n`;
      body += `- **Node.js:** ${context.nodeVersion || 'N/A'}\n`;
    }

    // Informações de memória
    if (context.memory) {
      const mem = context.memory;
      body += `- **Memória RSS:** ${(mem.rss / 1024 / 1024).toFixed(2)} MB\n`;
      body += `- **Memória Heap:** ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
    }

    // Adicionar template de resolução
    body += `

---

### ✅ Como Resolver

- [ ] Investigar a causa raiz do erro
- [ ] Implementar correção
- [ ] Testar a correção
- [ ] Fechar esta issue

---

*Esta issue foi criada automaticamente pelo sistema de monitoramento de erros do ${this.appName}*

---
> ⚠️ **Nota:** Este é um relatório automático de erro. Por favor, não responda a esta issue diretamente.`;

    return body;
  }

  // Obter data de ontem (para busca de duplicatas)
  getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  // Middleware Express para criar issues automaticamente
  middleware() {
    return async (err, req, res, next) => {
      // Criar issue em background (não bloquear a resposta)
      this.createIssue(err, {
        type: 'express-error',
        request: {
          method: req.method,
          url: req.url,
          headers: { ...req.headers, authorization: '[REDACTED]' },
          body: req.body
        },
        platform: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage()
      }).catch(e => logger.error(`Erro ao criar issue: ${e.message}`));

      next(err);
    };
  }

  // Capturar erros não tratados
  setupGlobalHandlers() {
    if (!this.enabled || !this.token) return;

    process.on('unhandledRejection', async (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      await this.createIssue(error, { 
        type: 'unhandledRejection',
        platform: process.platform,
        nodeVersion: process.version 
      });
    });

    process.on('uncaughtException', async (error) => {
      await this.createIssue(error, { 
        type: 'uncaughtException',
        platform: process.platform,
        nodeVersion: process.version 
      });
      logger.error(`Uncaught Exception: ${error.message}`);
    });
  }
}

export default new GitHubIssueCreator();
