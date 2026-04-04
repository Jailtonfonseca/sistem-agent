'use client';

import { useState, useEffect } from 'react';
import { FiBox, FiImage, FiFolder, FiGlobe, FiCpu, FiHardDrive, FiActivity } from 'react-icons/fi';
import api from '@/services/api';

// Tailwind color map (dynamic classes don't work in JIT)
const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-500', border: 'hover:border-indigo-500', btn: 'bg-indigo-500' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'hover:border-emerald-500', btn: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'hover:border-amber-500', btn: 'bg-amber-500' },
  rose: { bg: 'bg-rose-500/20', text: 'text-rose-500', border: 'hover:border-rose-500', btn: 'bg-rose-500' },
};

// Parse percentage string like "45.23%" to number
function parsePercent(val) {
  if (!val) return 0;
  const num = parseFloat(String(val).replace('%', ''));
  return isNaN(num) ? 0 : Math.min(num, 100);
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    containers: { total: 0, running: 0 },
    images: 0,
    volumes: 0,
    networks: 0,
    system: null,
    cpu: '0%',
    memory: { usedPercent: '0%' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [containersRes, imagesRes, volumesRes, networksRes, cpuRes, memoryRes] = await Promise.all([
        api.getContainers(),
        api.getImages(),
        api.getVolumes(),
        api.getNetworks(),
        api.getCpuUsage(),
        api.getMemoryUsage()
      ]);

      setStats({
        containers: {
          total: containersRes.containers?.length || 0,
          running: containersRes.containers?.filter(c => c.state === 'running').length || 0
        },
        images: imagesRes.images?.length || 0,
        volumes: volumesRes.volumes?.length || 0,
        networks: networksRes.networks?.length || 0,
        cpu: cpuRes.currentLoad || '0%',
        memory: { usedPercent: memoryRes.usedPercent || '0%' }
      });
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Não foi possível conectar ao backend. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      title: 'Containers',
      value: stats.containers.running,
      subtitle: `de ${stats.containers.total} rodando`,
      icon: FiBox,
      color: 'indigo',
      href: '/containers'
    },
    {
      title: 'Imagens',
      value: stats.images,
      subtitle: 'imagens Docker',
      icon: FiImage,
      color: 'emerald',
      href: '/containers'
    },
    {
      title: 'Volumes',
      value: stats.volumes,
      subtitle: 'volumes',
      icon: FiFolder,
      color: 'amber',
      href: '/containers'
    },
    {
      title: 'Redes',
      value: stats.networks,
      subtitle: 'redes Docker',
      icon: FiGlobe,
      color: 'rose',
      href: '/containers'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do seu servidor Docker</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const colors = COLOR_MAP[card.color];
          return (
            <a 
              key={card.title}
              href={card.href}
              className={`bg-slate-800 rounded-xl p-6 border border-slate-700 ${colors.border} transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <Icon className={colors.text} size={28} />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiCpu className="text-indigo-500" />
              Uso de CPU
            </h3>
            <span className="text-2xl font-bold text-indigo-500">{stats.cpu}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div 
              className="bg-indigo-500 h-4 rounded-full transition-all"
              style={{ width: `${parsePercent(stats.cpu)}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FiActivity className="text-emerald-500" />
              Uso de Memória
            </h3>
            <span className="text-2xl font-bold text-emerald-500">{stats.memory.usedPercent}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div 
              className="bg-emerald-500 h-4 rounded-full transition-all"
              style={{ width: `${parsePercent(stats.memory.usedPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/containers" className="bg-indigo-600 hover:bg-indigo-700 text-center py-3 rounded-lg transition-colors">
            Ver Containers
          </a>
          <a href="/chat" className="bg-emerald-600 hover:bg-emerald-700 text-center py-3 rounded-lg transition-colors">
            Chat com IA
          </a>
          <a href="/settings" className="bg-amber-600 hover:bg-amber-700 text-center py-3 rounded-lg transition-colors">
            Configurações
          </a>
          <button onClick={loadData} className="bg-rose-600 hover:bg-rose-700 text-center py-3 rounded-lg transition-colors">
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
}
