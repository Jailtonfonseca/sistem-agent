// API Service para comunicação com o backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  // Docker endpoints
  async getContainers(all = true) {
    const res = await fetch(`${API_URL}/docker/containers?all=${all}`);
    return res.json();
  }

  async getContainer(id) {
    const res = await fetch(`${API_URL}/docker/containers/${id}`);
    return res.json();
  }

  async startContainer(id) {
    const res = await fetch(`${API_URL}/docker/containers/${id}/start`, { method: 'POST' });
    return res.json();
  }

  async stopContainer(id) {
    const res = await fetch(`${API_URL}/docker/containers/${id}/stop`, { method: 'POST' });
    return res.json();
  }

  async restartContainer(id) {
    const res = await fetch(`${API_URL}/docker/containers/${id}/restart`, { method: 'POST' });
    return res.json();
  }

  async removeContainer(id, force = false) {
    const res = await fetch(`${API_URL}/docker/containers/${id}?force=${force}`, { method: 'DELETE' });
    return res.json();
  }

  async getContainerLogs(id, tail = 100) {
    const res = await fetch(`${API_URL}/docker/containers/${id}/logs?tail=${tail}`);
    return res.json();
  }

  async getContainerStats(id) {
    const res = await fetch(`${API_URL}/docker/containers/${id}/stats`);
    return res.json();
  }

  async getImages() {
    const res = await fetch(`${API_URL}/docker/images`);
    return res.json();
  }

  async getVolumes() {
    const res = await fetch(`${API_URL}/docker/volumes`);
    return res.json();
  }

  async getNetworks() {
    const res = await fetch(`${API_URL}/docker/networks`);
    return res.json();
  }

  // System endpoints
  async getSystemInfo() {
    const res = await fetch(`${API_URL}/system/info`);
    return res.json();
  }

  async getCpuUsage() {
    const res = await fetch(`${API_URL}/system/cpu`);
    return res.json();
  }

  async getMemoryUsage() {
    const res = await fetch(`${API_URL}/system/memory`);
    return res.json();
  }

  async getDiskUsage() {
    const res = await fetch(`${API_URL}/system/disk`);
    return res.json();
  }

  async getNetworkUsage() {
    const res = await fetch(`${API_URL}/system/network`);
    return res.json();
  }

  async getProcesses() {
    const res = await fetch(`${API_URL}/system/processes`);
    return res.json();
  }

  // Chat endpoints
  async sendMessage(message, sessionId) {
    const res = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    return res.json();
  }

  async getSuggestions() {
    const res = await fetch(`${API_URL}/chat/suggestions`);
    return res.json();
  }

  async clearHistory(sessionId) {
    const res = await fetch(`${API_URL}/chat/history/${sessionId}`, { method: 'DELETE' });
    return res.json();
  }

  // Health check
  async healthCheck() {
    const res = await fetch(`${API_URL}/health`);
    return res.json();
  }
}

export default new ApiService();