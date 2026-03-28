/**
 * System Routes
 * API para informações do sistema operacional
 */

import express from 'express';
import systemService from '../services/system.js';

const router = express.Router();

// Informações gerais do sistema
router.get('/info', async (req, res) => {
  try {
    const info = await systemService.getSystemInfo();
    res.json({ success: true, ...info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Uso de CPU
router.get('/cpu', async (req, res) => {
  try {
    const cpu = await systemService.getCpuUsage();
    res.json({ success: true, ...cpu });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Uso de memória
router.get('/memory', async (req, res) => {
  try {
    const mem = await systemService.getMemoryUsage();
    res.json({ success: true, ...mem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Uso de disco
router.get('/disk', async (req, res) => {
  try {
    const disk = await systemService.getDiskUsage();
    res.json({ success: true, disk });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Uso de rede
router.get('/network', async (req, res) => {
  try {
    const network = await systemService.getNetworkUsage();
    res.json({ success: true, network });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Processos
router.get('/processes', async (req, res) => {
  try {
    const processes = await systemService.getProcesses();
    res.json({ success: true, ...processes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Temperatura
router.get('/temperature', async (req, res) => {
  try {
    const temp = await systemService.getTemperature();
    res.json({ success: true, ...temp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bateria
router.get('/battery', async (req, res) => {
  try {
    const battery = await systemService.getBattery();
    res.json({ success: true, ...battery });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Docker info
router.get('/docker', async (req, res) => {
  try {
    const docker = await systemService.getDockerInfo();
    res.json({ success: true, ...docker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;