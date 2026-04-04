'use client';

import { useState, useEffect } from 'react';
import { FiCpu, FiHardDrive, FiActivity, FiNetwork, FiRefreshCw } from 'react-icons/fi';
import api from '@/services/api';

export default function System() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [cpu, setCpu] = useState(null);
  const [memory, setMemory] = useState(null);
  const [disk, setDisk] = useState([]);
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [infoRes, cpuRes, memRes, diskRes, netRes] = await Promise.all([
        api.getSystemInfo(),
        api.getCpuUsage(),
        api.getMemoryUsage(),
        api.getDiskUsage(),
        api.getNetworkUsage()
      ]);
      
      setSystemInfo(infoRes);
      setCpu(cpuRes);
      setMemory(memRes);
      setDisk(Array.isArray(diskRes.disk) ? diskRes.disk : []);
      setNetwork(Array.isArray(netRes.network) ? netRes.network : []);
    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    } finally {
      setLoading(false);
    }
  }

  function parsePercent(val) {
    if (!val) return 0;
    const num = parseFloat(String(val).replace('%', ''));
    return isNaN(num) ? 0 : Math.min(num, 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Informações do Sistema</h1>
          <p className="text-slate-400 mt-1">Monitoramento em tempo real</p>
        </div>
        <button 
          onClick={loadData}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiRefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* System Info */}
      {systemInfo && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">🖥️ Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-500">SO:</span><br/>{systemInfo.os?.distro || 'N/A'}</div>
            <div><span className="text-slate-500">Arquitetura:</span><br/>{systemInfo.os?.arch || 'N/A'}</div>
            <div><span className="text-slate-500">Hostname:</span><br/>{systemInfo.os?.hostname || 'N/A'}</div>
            <div><span className="text-slate-500">Uptime:</span><br/>{systemInfo.uptime || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
            <div><span className="text-slate-500">CPU:</span><br/>{systemInfo.cpu?.brand || 'N/A'}</div>
            <div><span className="text-slate-500">Cores:</span><br/>{systemInfo.cpu?.cores || 'N/A'}</div>
            <div><span className="text-slate-500">Memória Total:</span><br/>{systemInfo.memory?.total || 'N/A'}</div>
            <div><span className="text-slate-500">Memória Livre:</span><br/>{systemInfo.memory?.free || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* CPU & Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiCpu className="text-indigo-500" />
              Uso de CPU
            </h3>
            <span className="text-2xl font-bold text-indigo-500">{cpu?.currentLoad || '0%'}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div 
              className="bg-indigo-500 h-4 rounded-full transition-all"
              style={{ width: `${parsePercent(cpu?.currentLoad)}%` }}
            />
          </div>
          {cpu?.cpus && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {cpu.cpus.map((c, i) => (
                <div key={i} className="text-center text-sm">
                  <div className="text-slate-400">Core {i}</div>
                  <div className="font-semibold">{c.load}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiActivity className="text-emerald-500" />
              Uso de Memória
            </h3>
            <span className="text-2xl font-bold text-emerald-500">{memory?.usedPercent || '0%'}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div 
              className="bg-emerald-500 h-4 rounded-full transition-all"
              style={{ width: `${parsePercent(memory?.usedPercent)}%` }}
            />
          </div>
          {memory && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-400">
              <div>Usado: {memory.used}</div>
              <div>Livre: {memory.free}</div>
              <div>Cache: {memory.cached}</div>
            </div>
          )}
        </div>
      </div>

      {/* Disk */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FiHardDrive className="text-amber-500" />
          Uso de Disco
        </h3>
        <div className="space-y-4">
          {disk.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{d.mount} ({d.fs})</span>
                <span>{d.used} / {d.size} ({d.usedPercent})</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-amber-500 h-3 rounded-full transition-all"
                  style={{ width: `${parsePercent(d.usedPercent)}%` }}
                />
              </div>
            </div>
          ))}
          {disk.length === 0 && <p className="text-slate-400">Sem informações de disco</p>}
        </div>
      </div>

      {/* Network */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FiNetwork className="text-blue-500" />
          Uso de Rede
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {network.map((n, i) => (
            <div key={i} className="text-sm">
              <p className="font-medium">{n.iface}</p>
              <p className="text-slate-400">↓ {n.rx_sec} | ↑ {n.tx_sec}</p>
              <p className="text-slate-500">Total: ↓ {n.rx} | ↑ {n.tx}</p>
            </div>
          ))}
          {network.length === 0 && <p className="text-slate-400">Sem informações de rede</p>}
        </div>
      </div>
    </div>
  );
}
