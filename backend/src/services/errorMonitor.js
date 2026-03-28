/**
 * Error Monitoring Service
 * Envia erros para o servidor centralizado
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';

class ErrorMonitor {
  constructor() {
    // URL do servidor de monitoramento (configurável via env)
    this.serverUrl = process.env.ERROR_MONITOR_URL || null;
    this.appVersion = process.env.APP_VERSION || '1.0.0';
    this.appName = process.env.APP_NAME || 'sistem-agent';
    this.enabled = !!this.serverUrl;
    
    if (this.enabled) {
      logger.info(`Error Monitor enabled: ${this.serverUrl}`);
    }
  }

  // Capturar e enviar erro
  async captureError(error, context = {}) {
    if (!this.enabled) return;

    try {
      const errorData = {
        // Identificação
        app: this.appName,
        version: this.appVersion,
        timestamp: new Date().toISOString(),
        
        // Informações do erro
        name: error.name,
        message: error.message,
        stack: error.stack,
        
        // Contexto adicional
        context: {
          ...context,
          // Informações do sistema
          platform: process.platform,
          nodeVersion: process.version,
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
        
        // Informações do request (se disponível)
        request: context.request ? {
          method: context.request.method,
          url: context.request.url,
          headers: context.request.headers,
          body: context.request.body,
        } : null,
      };

      // Enviar para o servidor
      await axios.post(`${this.serverUrl}/api/errors`, errorData, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-App-Name': this.appName,
          'X-App-Version': this.appVersion,
        }
      });

      logger.info(`Error captured and sent: ${error.name}`);
    } catch (sendError) {
      logger.error(`Failed to send error to monitoring server: ${sendError.message}`);
    }
  }

  // Capturar erro não tratado
  setupGlobalHandlers() {
    if (!this.enabled) return;

    // Erros não tratados em Promises
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.captureError(error, { type: 'unhandledRejection', promise });
    });

    // Erros não tratados em eventos
    process.on('uncaughtException', (error) => {
      this.captureError(error, { type: 'uncaughtException' });
      // Não encerrar o processo imediatamente para permitir logging
      logger.error(`Uncaught Exception: ${error.message}`);
    });
  }

  //Middleware Express para capturar erros de API
  middleware() {
    return async (err, req, res, next) => {
      // Capturar o erro
      await this.captureError(err, {
        type: 'express-error',
        request: {
          method: req.method,
          url: req.url,
          headers: { ...req.headers, authorization: '[REDACTED]' },
          body: req.body,
        }
      });

      // Continuar com o tratamento padrão
      next(err);
    };
  }

  // Função helper para capturar erros em async handlers
  asyncErrorHandler(fn) {
    return async (...args) => {
      try {
        await fn(...args);
      } catch (error) {
        await this.captureError(error, { handler: fn.name });
        throw error;
      }
    };
  }
}

export default new ErrorMonitor();