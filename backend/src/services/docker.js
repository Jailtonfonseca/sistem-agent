/**
 * Docker Service
 * Gerencia todas as operações com Docker
 */

import Docker from 'dockerode';
import { logger } from '../utils/logger.js';

class DockerService {
  constructor() {
    // Configurar Docker baseado no SO
    if (process.env.DOCKER_HOST) {
      this.docker = new Docker({ host: process.env.DOCKER_HOST });
    } else if (process.platform === 'win32') {
      // Windows
      this.docker = new Docker({ socketPath: '//./pipe/docker_engine' });
    } else {
      // Linux/Mac
      this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    }
    
    logger.info('Docker service inicializado');
  }

  // Listar todos os containers
  async listContainers(all = true) {
    try {
      const containers = await this.docker.listContainers({ all });
      return containers.map(container => ({
        id: container.Id,
        name: container.Names[0]?.replace('/', ''),
        image: container.Image,
        state: container.State,
        status: container.Status,
        ports: container.Ports,
        created: container.Created,
        labels: container.Labels
      }));
    } catch (error) {
      logger.error(`Erro ao listar containers: ${error.message}`);
      throw error;
    }
  }

  // Obter container específico
  async getContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      
      return {
        id: info.Id,
        name: info.Name.replace('/', ''),
        image: info.Config.Image,
        state: info.State,
        config: info.Config,
        networkSettings: info.NetworkSettings,
        mounts: info.Mounts,
        created: info.Created
      };
    } catch (error) {
      logger.error(`Erro ao obter container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  // Iniciar container
  async startContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
      logger.info(`Container ${containerId} iniciado`);
      return { success: true, containerId };
    } catch (error) {
      logger.error(`Erro ao iniciar container: ${error.message}`);
      throw error;
    }
  }

  // Parar container
  async stopContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      logger.info(`Container ${containerId} parado`);
      return { success: true, containerId };
    } catch (error) {
      logger.error(`Erro ao parar container: ${error.message}`);
      throw error;
    }
  }

  // Reiniciar container
  async restartContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart();
      logger.info(`Container ${containerId} reiniciado`);
      return { success: true, containerId };
    } catch (error) {
      logger.error(`Erro ao reiniciar container: ${error.message}`);
      throw error;
    }
  }

  // Remover container
  async removeContainer(containerId, force = false) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.remove({ force });
      logger.info(`Container ${containerId} removido`);
      return { success: true, containerId };
    } catch (error) {
      logger.error(`Erro ao remover container: ${error.message}`);
      throw error;
    }
  }

  // Obter logs do container
  async getContainerLogs(containerId, tail = 100) {
    try {
      const container = this.docker.getContainer(containerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail,
        timestamps: true
      });
      
      // Converter buffer para string
      return logs.toString('utf8');
    } catch (error) {
      logger.error(`Erro ao obter logs: ${error.message}`);
      throw error;
    }
  }

  // Stat em tempo real (streaming)
  async getContainerStats(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });
      
      return {
        cpu: this.calculateCpuPercent(stats),
        memory: this.formatMemory(stats),
        network: this.formatNetwork(stats),
        blockIO: this.formatBlockIO(stats)
      };
    } catch (error) {
      logger.error(`Erro ao obter stats: ${error.message}`);
      throw error;
    }
  }

  // Listar imagens
  async listImages() {
    try {
      const images = await this.docker.listImages();
      return images.map(image => ({
        id: image.Id,
        tags: image.RepoTags,
        size: image.Size,
        created: image.Created
      }));
    } catch (error) {
      logger.error(`Erro ao listar imagens: ${error.message}`);
      throw error;
    }
  }

  // Listar volumes
  async listVolumes() {
    try {
      const volumes = await this.docker.listVolumes();
      return volumes.Volumes || [];
    } catch (error) {
      logger.error(`Erro ao listar volumes: ${error.message}`);
      throw error;
    }
  }

  // Listar redes
  async listNetworks() {
    try {
      const networks = await this.docker.listNetworks();
      return networks;
    } catch (error) {
      logger.error(`Erro ao listar redes: ${error.message}`);
      throw error;
    }
  }

  // Criar container
  async createContainer(config) {
    try {
      const container = await this.docker.createContainer(config);
      logger.info(`Container criado: ${container.id}`);
      return { id: container.id, ...config };
    } catch (error) {
      logger.error(`Erro ao criar container: ${error.message}`);
      throw error;
    }
  }

  // Pull de imagem
  async pullImage(imageName) {
    return new Promise((resolve, reject) => {
      this.docker.pull(imageName, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.docker.modem.followProgress(stream, (err, output) => {
          if (err) reject(err);
          else resolve(output);
        });
      });
    });
  }

  // Calcular uso de CPU
  calculateCpuPercent(stats) {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                     stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - 
                       stats.precpu_stats.system_cpu_usage;
    
    if (systemDelta > 0 && cpuDelta > 0) {
      const cpuCount = stats.cpu_stats.online_cpus || 1;
      return ((cpuDelta / systemDelta) * cpuCount * 100).toFixed(2);
    }
    return '0.00';
  }

  // Formatar memória
  formatMemory(stats) {
    const usage = stats.memory_stats.usage || 0;
    const limit = stats.memory_stats.limit || 1;
    return {
      usage: (usage / 1024 / 1024).toFixed(2) + ' MB',
      percent: ((usage / limit) * 100).toFixed(2) + '%',
      limit: (limit / 1024 / 1024).toFixed(0) + ' MB'
    };
  }

  // Formatar rede
  formatNetwork(stats) {
    const networks = stats.networks || {};
    let rxBytes = 0;
    let txBytes = 0;
    
    Object.values(networks).forEach(net => {
      rxBytes += net.rx_bytes || 0;
      txBytes += net.tx_bytes || 0;
    });
    
    return {
      rx: (rxBytes / 1024 / 1024).toFixed(2) + ' MB',
      tx: (txBytes / 1024 / 1024).toFixed(2) + ' MB'
    };
  }

  // Formatar Block I/O
  formatBlockIO(stats) {
    const read = stats.blkio_stats?.io_service_bytes_recursive?.[0]?.value || 0;
    const write = stats.blkio_stats?.io_service_bytes_recursive?.[1]?.value || 0;
    
    return {
      read: (read / 1024 / 1024).toFixed(2) + ' MB',
      write: (write / 1024 / 1024).toFixed(2) + ' MB'
    };
  }

  // Verificar conexão
  async ping() {
    try {
      await this.docker.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export default new DockerService();
export { DockerService };