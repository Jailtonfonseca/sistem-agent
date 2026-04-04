'use client';

import { useState, useEffect } from 'react';
import { FiTrash2, FiRefreshCw } from 'react-icons/fi';
import api from '@/services/api';

export default function Images() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const res = await api.getImages();
      setImages(res.images || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  }

  function formatSize(bytes) {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
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
          <h1 className="text-3xl font-bold">Imagens Docker</h1>
          <p className="text-slate-400 mt-1">{images.length} imagens encontradas</p>
        </div>
        <button 
          onClick={loadImages}
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
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Tamanho</th>
              <th className="text-left p-4">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                <td className="p-4 font-medium">
                  {image.tags && image.tags.length > 0 ? image.tags.join(', ') : '<none>'}
                </td>
                <td className="p-4 text-slate-400 font-mono text-sm">
                  {image.id.replace('sha256:', '').slice(0, 12)}
                </td>
                <td className="p-4 text-slate-400">{formatSize(image.size)}</td>
                <td className="p-4 text-slate-400">{formatDate(image.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
