/**
 * AI Service
 * Serviço de chat com IA para comandos Docker
 */

import OpenAI from 'openai';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import dockerService from './docker.js';
import systemService from './system.js';

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    
    // Inicializar OpenAI se a chave estiver configurada
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    logger.info(`AI Service inicializado com provedor: ${this.provider}`);
  }

  // Enviar mensagem para IA
  async chat(message, conversationHistory = []) {
    try {
      // Obter contexto do sistema
      const context = await this.getContext();
      
      // Construir prompt com contexto
      const prompt = this.buildPrompt(message, context);
      
      // Escolher provedor
      if (this.provider === 'ollama') {
        return await this.chatWithOllama(prompt, conversationHistory);
      } else {
        return await this.chatWithOpenAI(prompt, conversationHistory);
      }
    } catch (error) {
      logger.error(`Erro no chat: ${error.message}`);
      throw error;
    }
  }

  // Chat com OpenAI
  async chatWithOpenAI(prompt, history) {
    try {
      const messages = [
        {
          role: 'system',
          content: `Você é o Sistem-Agent, um assistente de IA que ajuda a gerenciar servidores Linux e containers Docker.

Você tem acesso às seguintes ferramentas e informações:
- Listar, iniciar, parar, reiniciar e remover containers Docker
- Visualizar logs e estatísticas de containers
- Monitorar recursos do sistema (CPU, memória, disco, rede)
- Gerenciar imagens e volumes Docker
- Executar comandos no sistema

Sempre responda de forma clara e útil. Quando appropriate, sugira comandos Docker ou execute ações diretamente.

Responda em português brasileiro.`
        },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: prompt }
      ];

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      return {
        success: true,
        response: response.choices[0].message.content,
        model: response.model
      };
    } catch (error) {
      logger.error(`Erro OpenAI: ${error.message}`);
      throw error;
    }
  }

  // Chat com Ollama
  async chatWithOllama(prompt, history) {
    try {
      const messages = [
        {
          role: 'system',
          content: `Você é o Sistem-Agent, um assistente de IA que ajuda a gerenciar servidores Linux e containers Docker. Responda em português brasileiro.`
        },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: prompt }
      ];

      const response = await axios.post(
        `${process.env.OLLAMA_BASE_URL}/api/chat`,
        {
          model: process.env.OLLAMA_MODEL || 'llama2',
          messages,
          stream: false
        },
        { timeout: 60000 }
      );

      return {
        success: true,
        response: response.data.message.content,
        model: process.env.OLLAMA_MODEL || 'llama2'
      };
    } catch (error) {
      logger.error(`Erro Ollama: ${error.message}`);
      throw error;
    }
  }

  // Obter contexto do sistema
  async getContext() {
    try {
      const [containers, images, volumes, sysInfo, cpu, memory] = await Promise.all([
        dockerService.listContainers(),
        dockerService.listImages(),
        dockerService.listVolumes(),
        systemService.getSystemInfo(),
        systemService.getCpuUsage(),
        systemService.getMemoryUsage()
      ]);

      return {
        containers: {
          total: containers.length,
          running: containers.filter(c => c.state === 'running').length,
          stopped: containers.filter(c => c.state !== 'running').length,
          list: containers.slice(0, 10).map(c => ({
            name: c.name,
            image: c.image,
            state: c.state,
            status: c.status
          }))
        },
        images: { total: images.length },
        volumes: { total: volumes.length },
        system: {
          os: sysInfo.os?.distro,
          cpu: sysInfo.cpu?.brand,
          cores: sysInfo.cpu?.cores,
          memory: sysInfo.memory?.total,
          cpuLoad: cpu?.currentLoad,
          memoryUsage: memory?.usedPercent
        }
      };
    } catch (error) {
      logger.error(`Erro ao obter contexto: ${error.message}`);
      return { error: error.message };
    }
  }

  // Construir prompt com contexto
  buildPrompt(message, context) {
    return `
Usuário disse: "${message}"

Contexto atual do sistema:
- Containers: ${context.containers?.total || 0} total, ${context.containers?.running || 0} em execução
- Imagens: ${context.images?.total || 0}
- Volumes: ${context.volumes?.total || 0}
- SO: ${context.system?.os}
- CPU: ${context.system?.cpu}
- Memória: ${context.system?.memory}
- Uso de CPU: ${context.system?.cpuLoad}
- Uso de Memória: ${context.system?.memoryUsage}

Liste de containers em execução:
${context.containers?.list?.map(c => `- ${c.name} (${c.image}): ${c.state}`).join('\n') || 'Nenhum'}

Com base nisso, responda à pergunta do usuário ou execute a ação solicitada.`;
  }

  // Processar comando específico
  async processCommand(command) {
    const cmd = command.toLowerCase();
    
    try {
      // Listar containers
      if (cmd.includes('listar') && cmd.includes('container')) {
        const containers = await dockerService.listContainers();
        return {
          action: 'list_containers',
          data: containers,
          response: `Encontrei ${containers.length} containers:\n\n` +
            containers.map(c => `• **${c.name}** - ${c.image}\n  Estado: ${c.state}\n  Status: ${c.status}`).join('\n')
        };
      }

      // Listar imagens
      if (cmd.includes('listar') && cmd.includes('imagem')) {
        const images = await dockerService.listImages();
        return {
          action: 'list_images',
          data: images,
          response: `Encontrei ${images.length} imagens:\n\n` +
            images.map(i => `• ${i.tags?.[0] || i.id.slice(0, 12)}\n  Tamanho: ${(i.size / 1024 / 1024).toFixed(2)} MB`).join('\n')
        };
      }

      // Status do sistema
      if (cmd.includes('status') || cmd.includes('monitorar')) {
        const [cpu, memory, disk] = await Promise.all([
          systemService.getCpuUsage(),
          systemService.getMemoryUsage(),
          systemService.getDiskUsage()
        ]);
        
        return {
          action: 'system_status',
          data: { cpu, memory, disk },
          response: `📊 Status do Sistema:\n\n` +
            `💻 **CPU:** ${cpu.currentLoad}\n` +
            `🧠 **Memória:** ${memory.used} / ${memory.total} (${memory.usedPercent})\n` +
            `💾 **Disco:** ${disk[0]?.used} / ${disk[0]?.size} (${disk[0]?.usedPercent})`
        };
      }

      // CPU
      if (cmd.includes('cpu')) {
        const cpu = await systemService.getCpuUsage();
        return {
          action: 'cpu_usage',
          data: cpu,
          response: `💻 **Uso de CPU:** ${cpu.currentLoad}\n\n` +
            cpu.cpus.map((c, i) => `Core ${i}: ${c.load}`).join('\n')
        };
      }

      // Memória
      if (cmd.includes('memória') || cmd.includes('memoria') || cmd.includes('ram')) {
        const mem = await systemService.getMemoryUsage();
        return {
          action: 'memory_usage',
          data: mem,
          response: `🧠 **Uso de Memória:**\n\n` +
            `Total: ${mem.total}\n` +
            `Usado: ${mem.used}\n` +
            `Livre: ${mem.free}\n` +
            `Porcentagem: ${mem.usedPercent}`
        };
      }

      // Containers em execução
      if (cmd.includes('container') && (cmd.includes('executando') || cmd.includes('rodando') || cmd.includes('running'))) {
        const containers = await dockerService.listContainers(false);
        return {
          action: 'running_containers',
          data: containers,
          response: containers.length > 0 
            ? `Container em execução:\n\n${containers.map(c => `• ${c.name}`).join('\n')}`
            : 'Nenhum container em execução no momento.'
        };
      }

      return null;
    } catch (error) {
      logger.error(`Erro ao processar comando: ${error.message}`);
      throw error;
    }
  }
}

export default new AIService();