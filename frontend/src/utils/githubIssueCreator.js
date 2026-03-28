// GitHub Issue Creator - Frontend Version
// Cria issues automaticamente no GitHub quando ocorrem erros no frontend
// As configurações são obtidas do localStorage (configuradas pelo usuário)

class GitHubIssueCreator {
  constructor() {
    this.enabled = false;
    this.loadSettings();
  }

  loadSettings() {
    if (typeof window === 'undefined') return;
    
    const settings = localStorage.getItem('sistem-agent-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.repo = parsed.githubRepo;
      this.token = parsed.githubToken;
      this.labels = parsed.githubLabels || 'bug,auto-reported,frontend';
      this.enabled = !!(this.repo && this.token);
      
      if (this.enabled) {
        console.log('[GitHub Issue Creator] Enabled for:', this.repo);
      }
    }
  }

  // Recarregar configurações
  refresh() {
    this.loadSettings();
  }

  async createIssue(error, context = {}) {
    // Recarregar settings em cada chamada ( caso usuário tenha atualizado)
    this.loadSettings();
    
    if (!this.enabled) {
      // console.log('[GitHub Issue Creator] Not configured');
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

      const response = await fetch(`https://api.github.com/repos/${this.repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          labels: this.labels.split(',').map(l => l.trim())
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[GitHub Issue Creator] Issue created:', data.number, data.html_url);
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
        `https://api.github.com/search/issues?q=repo:${this.repo}+is:issue+${searchTerm}+created:>=${dateStr}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
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
    const prefix = 'SISTEM-AGENT';
    const errorType = error.name || 'Error';
    const shortMessage = error.message?.slice(0, 50) || 'Unknown error';
    return `[${prefix}] ${errorType}: ${shortMessage}...`;
  }

  generateBody(error, context = {}) {
    const timestamp = new Date().toISOString();
    const browserInfo = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    
    return `## 🚨 Erro Automático Reportado - Frontend

**Data:** ${timestamp}
**Aplicação:** sistem-agent-frontend

---

### 📋 Descrição do Erro

**Tipo:** ${error.name || 'Unknown'}
**Mensagem:** ${error.message || 'No message'}

${error.stack ? `### 📚 Stack Trace\n\`\`\`\n${error.stack.slice(0, 1500)}\n\`\`\`` : ''}

### 🔍 Contexto

- **URL:** ${context.url || (typeof window !== 'undefined' ? window.location.href : 'N/A')}
- **Navegador:** ${browserInfo}

---

### ✅ Como Resolver

- [ ] Investigar a causa raiz
- [ ] Implementar correção
- [ ] Testar
- [ ] Fechar esta issue

---

*Issue criada automaticamente pelo sistema de monitoramento do Sistem-Agent*
`;
  }

  setupGlobalHandlers() {
    if (!this.enabled) return;

    // Capturar erros JavaScript
    window.onerror = (message, source, lineno, colno, error) => {
      this.createIssue(
        { name: 'JavaScript Error', message: String(message), stack: error?.stack },
        { type: 'window.onerror', source, lineno, colno }
      );
    };

    // Capturar Promise rejections
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      this.createIssue(error, { type: 'unhandledrejection' });
    };
  }

  // Método para reportar erro manualmente
  report(error, context = {}) {
    this.createIssue(
      { 
        name: error?.name || 'Manual Report', 
        message: error?.message || String(error), 
        stack: error?.stack 
      }, 
      { ...context, type: 'manual' }
    );
  }
}

// Criar instância global
const githubIssueCreator = new GitHubIssueCreator();

// Iniciar automaticamente se configurado
if (typeof window !== 'undefined') {
  githubIssueCreator.setupGlobalHandlers();
}

export default githubIssueCreator;