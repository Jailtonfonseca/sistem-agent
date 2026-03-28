'use client';

import { useState, useEffect } from 'react';
import { FiBox, FiImage, FiFolder, FiGlobe, FiCpu, FiHardDrive, FiActivity } from 'react-icons/fi';
import api from '@/services/api';

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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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
      href: '/images'
    },
    {
      title: 'Volumes',
      value: stats.volumes,
      subtitle: 'volumes',
      icon: FiFolder,
      color: 'amber',
      href: '/volumes'
    },
    {
      title: 'Redes',
      value: stats.networks,
      subtitle: 'redes Docker',
      icon: FiGlobe,
      color: 'rose',
      href: '/networks'
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a 
              key={card.title}
              href={card.href}
              className={`bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-${card.color}--500 transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 bg-${card.color}-500/20 rounded-lg`}>
                  <Icon className={`text-${card.color}-500`} size={28} />
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
              style={{ width: stats.cpu }}
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
              style={{ width: stats.memory.usedPercent }}
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
          <a href="/system" className="bg-amber-600 hover:bg-amber-700 text-center py-3 rounded-lg transition-colors">
            Ver Sistema
          </a>
          <a href="/images" className="bg-rose-600 hover:bg-rose-700 text-center py-3 rounded-lg transition-colors">
            Ver Imagens
          </a>
        </div>
      </div>
    </div>
  );
}