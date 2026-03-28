'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiSquare, FiRefreshCw, FiTrash2, FiTerminal, FiEye } from 'react-icons/fi';
import api from '@/services/api';

export default function Containers() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [logs, setLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadContainers();
  }, []);

  async function loadContainers() {
    try {
      const res = await api.getContainers();
      setContainers(res.containers || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action, containerId) {
    setActionLoading(containerId);
    try {
      let res;
      switch (action) {
        case 'start':
          res = await api.startContainer(containerId);
          break;
        case 'stop':
          res = await api.stopContainer(containerId);
          break;
        case 'restart':
          res = await api.restartContainer(containerId);
          break;
        case 'remove':
          if (confirm('Tem certeza que deseja remover este container?')) {
            res = await api.removeContainer(containerId, true);
          }
          break;
      }
      if (res?.success) {
        loadContainers();
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function viewLogs(containerId) {
    try {
      const res = await api.getContainerLogs(containerId, 100);
      setLogs(res.logs || 'Sem logs');
      setSelectedContainer(containerId);
      setShowLogs(true);
    } catch (error) {
      alert('Erro ao buscar logs');
    }
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'running': return 'bg-emerald-500';
      case 'exited': return 'bg-red-500';
      case 'paused': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

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
          <h1 className="text-3xl font-bold">Containers</h1>
          <p className="text-slate-400 mt-1">{containers.length} containers encontrados</p>
        </div>
        <button 
          onClick={loadContainers}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiRefreshCw size={18} />
          Atualizar
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Imagem</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((container) => (
              <tr key={container.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                <td className="p-4">
                  <div className={`w-3 h-3 rounded-full ${getStateColor(container.state)}`} />
                </td>
                <td className="p-4 font-medium">{container.name}</td>
                <td className="p-4 text-slate-400">{container.image}</td>
                <td className="p-4 text-slate-400">{container.status}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {container.state !== 'running' ? (
                      <button
                        onClick={() => handleAction('start', container.id)}
                        disabled={actionLoading === container.id}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        title="Iniciar"
                      >
                        <FiPlay size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('stop', container.id)}
                        disabled={actionLoading === container.id}
                        className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg"
                        title="Parar"
                      >
                        <FiSquare size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('restart', container.id)}
                      disabled={actionLoading === container.id}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                      title="Reiniciar"
                    >
                      <FiRefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => viewLogs(container.id)}
                      className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg"
                      title="Ver Logs"
                    >
                      <FiTerminal size={16} />
                    </button>
                    <button
                      onClick={() => handleAction('remove', container.id)}
                      disabled={actionLoading === container.id}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                      title="Remover"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">Logs do Container</h2>
              <button 
                onClick={() => setShowLogs(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                {logs}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}