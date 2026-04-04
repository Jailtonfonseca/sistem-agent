// API Service para comunicação com o backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

class ApiService {
  // Docker endpoints
  async getContainers(all = true) {
    return safeFetch(`${API_URL}/docker/containers?all=${all}`);
  }

  async getContainer(id) {
    return safeFetch(`${API_URL}/docker/containers/${id}`);
  }

  async startContainer(id) {
    return safeFetch(`${API_URL}/docker/containers/${id}/start`, { method: 'POST' });
  }

  async stopContainer(id) {
    return safeFetch(`${API_URL}/docker/containers/${id}/stop`, { method: 'POST' });
  }

  async restartContainer(id) {
    return safeFetch(`${API_URL}/docker/containers/${id}/restart`, { method: 'POST' });
  }

  async removeContainer(id, force = false) {
    return safeFetch(`${API_URL}/docker/containers/${id}?force=${force}`, { method: 'DELETE' });
  }

  async getContainerLogs(id, tail = 100) {
    return safeFetch(`${API_URL}/docker/containers/${id}/logs?tail=${tail}`);
  }

  async getContainerStats(id) {
    return safeFetch(`${API_URL}/docker/containers/${id}/stats`);
  }

  async getImages() {
    return safeFetch(`${API_URL}/docker/images`);
  }

  async getVolumes() {
    return safeFetch(`${API_URL}/docker/volumes`);
  }

  async getNetworks() {
    return safeFetch(`${API_URL}/docker/networks`);
  }

  // System endpoints
  async getSystemInfo() {
    return safeFetch(`${API_URL}/system/info`);
  }

  async getCpuUsage() {
    return safeFetch(`${API_URL}/system/cpu`);
  }

  async getMemoryUsage() {
    return safeFetch(`${API_URL}/system/memory`);
  }

  async getDiskUsage() {
    return safeFetch(`${API_URL}/system/disk`);
  }

  async getNetworkUsage() {
    return safeFetch(`${API_URL}/system/network`);
  }

  async getProcesses() {
    return safeFetch(`${API_URL}/system/processes`);
  }

  // Chat endpoints
  async sendMessage(message, sessionId) {
    return safeFetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
  }

  async getSuggestions() {
    return safeFetch(`${API_URL}/chat/suggestions`);
  }

  async clearHistory(sessionId) {
    return safeFetch(`${API_URL}/chat/history/${sessionId}`, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return safeFetch(`${API_URL}/health`);
  }
}

export default new ApiService();
