'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import api from '@/services/api';

export default function Networks() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworks();
  }, []);

  async function loadNetworks() {
    try {
      const res = await api.getNetworks();
      setNetworks(res.networks || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold">Redes Docker</h1>
          <p className="text-slate-400 mt-1">{networks.length} redes encontradas</p>
        </div>
        <button 
          onClick={loadNetworks}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiRefreshCw size={18} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {networks.map((network) => (
          <div key={network.Id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold text-lg mb-2">{network.Name}</h3>
            <div className="space-y-1 text-sm text-slate-400">
              <p><span className="text-slate-500">ID:</span> {network.Id.slice(0, 12)}</p>
              <p><span className="text-slate-500">Driver:</span> {network.Driver}</p>
              <p><span className="text-slate-500">Scope:</span> {network.Scope}</p>
              <p><span className="text-slate-500">IPv4:</span> {network.IPAM?.Config?.[0]?.Subnet || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
