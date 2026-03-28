/**
 * Sistem-Agent Backend
 * Servidor principal que gerencia Docker + Chat IA
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import dockerRoutes from './src/routes/docker.js';
import systemRoutes from './src/routes/system.js';
import chatRoutes from './src/routes/chat.js';
import { setupSocketHandlers } from './src/services/socket.js';
import errorMonitor from './src/services/errorMonitor.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});
app.use('/api/', limiter);

// Configurar monitoramento de erros
errorMonitor.setupGlobalHandlers();

// Rotas API
app.use('/api/docker', dockerRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Setup Socket.IO
setupSocketHandlers(io);

// Tratamento de erros globais
app.use(errorMonitor.middleware());

// Tratamento de erros da API
app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`);
  
  // Enviar erro para o servidor de monitoramento
  errorMonitor.captureError(err, {
    type: 'api-error',
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    }
  });
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Sistem-Agent Backend rodando na porta ${PORT}`);
  logger.info(`📡 API disponível em http://localhost:${PORT}/api`);
  
  if (errorMonitor.enabled) {
    logger.info(`📊 Error Monitor ativo: ${errorMonitor.serverUrl}`);
  }
});

export { app, io };