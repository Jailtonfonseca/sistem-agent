/**
 * System Service
 * Gerencia informações do sistema operacional
 */

import si from 'systeminformation';
import { logger } from '../utils/logger.js';

class SystemService {
  // Obter informações gerais do sistema
  async getSystemInfo() {
    try {
      const [cpu, mem, osInfo, time] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.time()
      ]);

      return {
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed
        },
        memory: {
          total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          used: (mem.used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          free: (mem.free / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          usedPercent: ((mem.used / mem.total) * 100).toFixed(2) + '%'
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
          hostname: osInfo.hostname
        },
        uptime: this.formatUptime(time.uptime)
      };
    } catch (error) {
      logger.error(`Erro ao obter info do sistema: ${error.message}`);
      throw error;
    }
  }

  // Uso de CPU
  async getCpuUsage() {
    try {
      const load = await si.currentLoad();
      return {
        currentLoad: load.currentLoad.toFixed(2) + '%',
        cpus: load.cpus.map((cpu, i) => ({
          core: i,
          load: cpu.load.toFixed(2) + '%'
        }))
      };
    } catch (error) {
      logger.error(`Erro ao obter uso de CPU: ${error.message}`);
      throw error;
    }
  }

  // Uso de memória
  async getMemoryUsage() {
    try {
      const mem = await si.mem();
      return {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        used: (mem.used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        free: (mem.free / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        usedPercent: ((mem.used / mem.total) * 100).toFixed(2) + '%',
        cached: (mem.cached / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        buffers: (mem.buffers / 1024 / 1024 / 1024).toFixed(2) + ' GB'
      };
    } catch (error) {
      logger.error(`Erro ao obter uso de memória: ${error.message}`);
      throw error;
    }
  }

  // Uso de disco
  async getDiskUsage() {
    try {
      const disks = await si.fsSize();
      return disks.map(disk => ({
        fs: disk.fs,
        mount: disk.mount,
        type: disk.type,
        size: (disk.size / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        used: (disk.used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        available: (disk.available / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        usedPercent: disk.use + '%'
      }));
    } catch (error) {
      logger.error(`Erro ao obter uso de disco: ${error.message}`);
      throw error;
    }
  }

  // Uso de rede
  async getNetworkUsage() {
    try {
      const stats = await si.networkStats();
      return stats.map(interface => ({
        iface: interface.iface,
        rx: (interface.rx_bytes / 1024 / 1024).toFixed(2) + ' MB',
        tx: (interface.tx_bytes / 1024 / 1024).toFixed(2) + ' MB',
        rxSec: (interface.rx_sec / 1024).toFixed(2) + ' KB/s',
        txSec: (interface.tx_sec / 1024).toFixed(2) + ' KB/s'
      }));
    } catch (error) {
      logger.error(`Erro ao obter uso de rede: ${error.message}`);
      throw error;
    }
  }

  // Informações de processos
  async getProcesses() {
    try {
      const processes = await si.processes();
      return {
        total: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping,
        list: processes.list.slice(0, 20).map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu.toFixed(2) + '%',
          mem: p.mem.toFixed(2) + '%',
          state: p.state
        }))
      };
    } catch (error) {
      logger.error(`Erro ao obter processos: ${error.message}`);
      throw error;
    }
  }

  // Temperatura
  async getTemperature() {
    try {
      const temps = await si.cpuTemperature();
      return {
        main: temps.main + '°C',
        cores: temps.cores
      };
    } catch (error) {
      return { main: 'N/A', cores: [] };
    }
  }

  // Bateria
  async getBattery() {
    try {
      const battery = await si.battery();
      return {
        percent: battery.percent,
        isCharging: battery.isCharging,
        hasBattery: battery.hasBattery,
        timeRemaining: battery.timeRemaining
      };
    } catch (error) {
      return { percent: 0, isCharging: false, hasBattery: false };
    }
  }

  // Docker info
  async getDockerInfo() {
    try {
      const docker = await si.docker();
      return docker;
    } catch (error) {
      return { running: false, error: error.message };
    }
  }

  // Formatar uptime
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

export default new SystemService();