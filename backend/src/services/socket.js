/**
 * Socket Handlers
 * Gerencia conexões WebSocket em tempo real
 */

import { logger } from '../utils/logger.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Juntar a uma sala específica
    socket.on('join-room', (room) => {
      socket.join(room);
      logger.info(`Client ${socket.id} joined room: ${room}`);
    });

    // Sair de uma sala
    socket.on('leave-room', (room) => {
      socket.leave(room);
      logger.info(`Client ${socket.id} left room: ${room}`);
    });

    // Solicitar atualização de container
    socket.on('request-container-update', async (containerId) => {
      socket.emit('container-updated', { containerId, timestamp: Date.now() });
    });

    // Chat em tempo real
    socket.on('chat-message', (data) => {
      io.emit('chat-message', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}