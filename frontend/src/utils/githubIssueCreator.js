// GitHub Issue Creator - Frontend Version
// Cria issues automaticamente no GitHub quando ocorrem erros no frontend

const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || 'Jailtonfonseca/sistem-agent';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || null;
const ISSUE_LABELS = process.env.NEXT_PUBLIC_ISSUE_LABELS || 'bug,auto-reported,frontend';
const APP_NAME = 'sistem-agent-frontend';
const APP_VERSION = '1.0.0';

class GitHubIssueCreator {
  constructor() {
    this.enabled = !!(GITHUB_REPO && GITHUB_TOKEN);
    if (this.enabled) {
      console.log('[GitHub Issue Creator] Enabled for:', GITHUB_REPO);
    }
  }

  async createIssue(error, context = {}) {
    if (!this.enabled) {
      console.log('[GitHub Issue Creator] Disabled - no token');
      return null;
    }

    try {
      // Verificar duplicatas
      const isDuplicate = await this.checkDuplicateError(error.message);
      if (isDuplicate) {
        console.log('[GitHub Issue Creator] Duplicate error - skipping');
        return null;
      }

      const title = this.generateTitle(error);
      const body = this.generateBody(error, context);

      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          labels: ISSUE_LABELS.split(',').map(l => l.trim())
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[GitHub Issue Creator] Issue created:', data.number);
      return { number: data.number, url: data.html_url };

    } catch (error) {
      console.error('[GitHub Issue Creator] Error:', error.message);
      return null;
    }
  }

  async checkDuplicateError(errorMessage) {
    try {
      const searchTerm = encodeURIComponent(errorMessage.slice(0, 50));
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.github.com/search/issues?q=repo:${GITHUB_REPO}+is:issue+${searchTerm}+created:>=${dateStr}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const data = await response.json();
      return data.total_count > 0;
    } catch {
      return false;
    }
  }

  generateTitle(error) {
    const prefix = APP_NAME.toUpperCase();
    const errorType = error.name || 'Error';
    const shortMessage = error.message?.slice(0, 50) || 'Unknown error';
    return `[${prefix}] ${errorType}: ${shortMessage}...`;
  }

  generateBody(error, context = {}) {
    const timestamp = new Date().toISOString();
    
    return `## 🚨 Erro Automático Reportado - Frontend

**Data:** ${timestamp}
**Versão:** ${APP_VERSION}
**Aplicação:** ${APP_NAME}

---

### 📋 Descrição do Erro

**Tipo:** ${error.name || 'Unknown'}
**Mensagem:** ${error.message || 'No message'}

${error.stack ? `### 📚 Stack Trace\n\`\`\`\n${error.stack.slice(0, 1500)}\n\`\`\`` : ''}

### 🔍 Contexto

- **URL:** ${context.url || window.location.href}
- **Navegador:** ${navigator.userAgent}

---

### ✅ Como Resolver

- [ ] Investigar a causa raiz
- [ ] Implementar correção
- [ ] Testar
- [ ] Fechar esta issue

---

*Issue criada automaticamente pelo sistema de monitoramento do ${APP_NAME}*
`;
  }

  setupGlobalHandlers() {
    if (!this.enabled) return;

    // Capturar erros JavaScript
    window.onerror = (message, source, lineno, colno, error) => {
      this.createError({
        name: 'JavaScript Error',
        message: String(message),
        stack: error?.stack
      }, { type: 'window.onerror', source, lineno, colno });
    };

    // Capturar Promise rejections
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.createError(error, { type: 'unhandledrejection' });
    };
  }

  createError(error, context = {}) {
    this.createIssue(error, {
      ...context,
      url: window?.location?.href
    }).catch(console.error);
  }

  report(error, context = {}) {
    this.createIssue({
      name: error?.name || 'Manual Report',
      message: error?.message || String(error),
      stack: error?.stack
    }, { ...context, type: 'manual' });
  }
}

const githubIssueCreator = new GitHubIssueCreator();

// Iniciar automaticamente
if (typeof window !== 'undefined') {
  githubIssueCreator.setupGlobalHandlers();
}

export default githubIssueCreator;
