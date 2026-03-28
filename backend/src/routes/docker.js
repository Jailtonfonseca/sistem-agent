/**
 * Docker Routes
 * API para gerenciamento de containers Docker
 */

import express from 'express';
import dockerService from '../services/docker.js';

const router = express.Router();

// Listar todos os containers
router.get('/containers', async (req, res) => {
  try {
    const { all } = req.query;
    const containers = await dockerService.listContainers(all !== 'false');
    res.json({ success: true, containers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter container específico
router.get('/containers/:id', async (req, res) => {
  try {
    const container = await dockerService.getContainer(req.params.id);
    res.json({ success: true, container });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// Iniciar container
router.post('/containers/:id/start', async (req, res) => {
  try {
    const result = await dockerService.startContainer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Parar container
router.post('/containers/:id/stop', async (req, res) => {
  try {
    const result = await dockerService.stopContainer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reiniciar container
router.post('/containers/:id/restart', async (req, res) => {
  try {
    const result = await dockerService.restartContainer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Remover container
router.delete('/containers/:id', async (req, res) => {
  try {
    const { force } = req.query;
    const result = await dockerService.removeContainer(req.params.id, force === 'true');
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Obter logs
router.get('/containers/:id/logs', async (req, res) => {
  try {
    const { tail } = req.query;
    const logs = await dockerService.getContainerLogs(req.params.id, parseInt(tail) || 100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter stats
router.get('/containers/:id/stats', async (req, res) => {
  try {
    const stats = await dockerService.getContainerStats(req.params.id);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar imagens
router.get('/images', async (req, res) => {
  try {
    const images = await dockerService.listImages();
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar volumes
router.get('/volumes', async (req, res) => {
  try {
    const volumes = await dockerService.listVolumes();
    res.json({ success: true, volumes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar redes
router.get('/networks', async (req, res) => {
  try {
    const networks = await dockerService.listNetworks();
    res.json({ success: true, networks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar container
router.post('/containers', async (req, res) => {
  try {
    const container = await dockerService.createContainer(req.body);
    res.status(201).json({ success: true, container });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Pull de imagem
router.post('/images/pull', async (req, res) => {
  try {
    const { image } = req.body;
    await dockerService.pullImage(image);
    res.json({ success: true, message: `Imagem ${image} baixada com sucesso` });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Ping Docker
router.get('/ping', async (req, res) => {
  try {
    const online = await dockerService.ping();
    res.json({ success: online, docker: online ? 'online' : 'offline' });
  } catch (error) {
    res.json({ success: false, docker: 'offline' });
  }
});

export default router;