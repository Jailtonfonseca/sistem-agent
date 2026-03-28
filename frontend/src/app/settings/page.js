'use client';

import { useState, useEffect } from 'react';
import { FiGithub, FiSave, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Settings() {
  const [settings, setSettings] = useState({
    githubRepo: '',
    githubToken: '',
    openaiKey: '',
    aiProvider: 'openai',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama2'
  });
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('sistem-agent-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Salvar configurações
  function saveSettings() {
    localStorage.setItem('sistem-agent-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Testar conexão GitHub
  async function testGitHub() {
    if (!settings.githubToken || !settings.githubRepo) {
      setTestResult({ success: false, message: 'Preencha o token e repositório' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`https://api.github.com/repos/${settings.githubRepo}`, {
        headers: {
          'Authorization': `token ${settings.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ 
          success: true, 
          message: `✓ Conectado ao repositório: ${data.full_name}` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `Erro: ${response.status}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Erro: ${error.message}` 
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-slate-400 mt-1">Configure suas credenciais e preferências</p>
      </div>

      {/* GitHub Settings */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FiGithub className="text-white" />
          GitHub
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Configure para criar issues automaticamente quando occurrem erros.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Repositório (formato: usuário/repositório)
            </label>
            <input
              type="text"
              value={settings.githubRepo}
              onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
              placeholder="seu-usuario/seu-repositorio"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Token GitHub
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={settings.githubToken}
                onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showToken ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:underline mt-1 inline-block"
            >
              Gerar token aqui →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Labels (separadas por vírgula)
            </label>
            <input
              type="text"
              value={settings.githubLabels || 'bug,auto-reported'}
              onChange={(e) => setSettings({ ...settings, githubLabels: e.target.value })}
              placeholder="bug,auto-reported"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg ${testResult.success ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
              {testResult.message}
            </div>
          )}

          <button
            onClick={testGitHub}
            disabled={testing}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? 'Testando...' : 'Testar Conexão'}
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Inteligência Artificial</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provedor de IA</label>
            <select
              value={settings.aiProvider}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          {settings.aiProvider === 'openai' && (
            <div>
              <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
              <input
                type="password"
                value={settings.openaiKey}
                onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:underline mt-1 inline-block"
              >
                Obter chave aqui →
              </a>
            </div>
          )}

          {settings.aiProvider === 'ollama' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">URL do Ollama</label>
                <input
                  type="text"
                  value={settings.ollamaUrl}
                  onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Modelo</label>
                <input
                  type="text"
                  value={settings.ollamaModel}
                  onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                  placeholder="llama2"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={saveSettings}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
        >
          {saved ? <FiCheck /> : <FiSave />}
          {saved ? 'Salvo!' : 'Salvar Configurações'}
        </button>

        {saved && (
          <span className="text-emerald-400">Configurações salvas com sucesso!</span>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">💡 Sobre o GitHub Issues</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• As issues serão criadas no seu repositório</li>
          <li>• Erros duplicados em 24h não criam novas issues</li>
          <li>• Cada usuário usa seu próprio token</li>
          <li>• As configurações ficam apenas no seu navegador</li>
        </ul>
      </div>
    </div>
  );
}