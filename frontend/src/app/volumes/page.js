'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import api from '@/services/api';

export default function Volumes() {
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolumes();
  }, []);

  async function loadVolumes() {
    try {
      const res = await api.getVolumes();
      setVolumes(res.volumes || []);
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
          <h1 className="text-3xl font-bold">Volumes Docker</h1>
          <p className="text-slate-400 mt-1">{volumes.length} volumes encontrados</p>
        </div>
        <button 
          onClick={loadVolumes}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiRefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {volumes.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <p className="text-slate-400">Nenhum volume encontrado</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4">Nome</th>
                <th className="text-left p-4">Driver</th>
                <th className="text-left p-4">Mountpoint</th>
              </tr>
            </thead>
            <tbody>
              {volumes.map((volume, i) => (
                <tr key={i} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="p-4 font-medium">{volume.Name}</td>
                  <td className="p-4 text-slate-400">{volume.Driver}</td>
                  <td className="p-4 text-slate-400 font-mono text-sm">{volume.Mountpoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
